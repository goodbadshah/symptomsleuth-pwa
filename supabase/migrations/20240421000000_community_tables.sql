-- ============================================================================
-- Community Intelligence Layer - anonymous data tables
-- ============================================================================
-- No user ID, no device ID - intentional.
-- All symptom data is aggregated to ISO-week granularity before storage.
-- ============================================================================

-- anonymous_logs: one row per symptom entry submitted for community aggregation
CREATE TABLE IF NOT EXISTS anonymous_logs (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  condition     text        NOT NULL,
  symptom_name  text        NOT NULL,
  value         integer     NOT NULL CHECK (value BETWEEN 1 AND 5),
  week_of       text        NOT NULL,           -- YYYY-Wnn (ISO 8601 week)
  sleep_quality integer     CHECK (sleep_quality BETWEEN 1 AND 5),
  stress_level  integer     CHECK (stress_level  BETWEEN 1 AND 5),
  exercise      boolean,
  food_triggers text[],                          -- e.g. ['Dairy', 'Gluten']
  created_at    timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_anon_logs_condition
  ON anonymous_logs (condition);

CREATE INDEX IF NOT EXISTS idx_anon_logs_week_of
  ON anonymous_logs (week_of);

CREATE INDEX IF NOT EXISTS idx_anon_logs_condition_week
  ON anonymous_logs (condition, week_of);

-- condition_aggregates: one row per condition, replaced nightly by compute job
CREATE TABLE IF NOT EXISTS condition_aggregates (
  condition          text        PRIMARY KEY,
  total_active_users integer     NOT NULL DEFAULT 0,
  symptoms           jsonb       NOT NULL DEFAULT '[]',   -- SymptomAggregate[]
  correlations       jsonb       NOT NULL DEFAULT '[]',   -- Correlation[]
  updated_at         timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- Row-Level Security: anonymous_logs are append-only (INSERT) from the anon
-- key. The aggregates table is read-only from the anon key.
-- The compute job runs as the service role and bypasses RLS.
-- ============================================================================

ALTER TABLE anonymous_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_aggregates ENABLE ROW LEVEL SECURITY;

-- Anyone can insert anonymous logs (no user identity required)
CREATE POLICY "insert_anonymous_log"
  ON anonymous_logs FOR INSERT
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE for anon key on raw logs (aggregates only)
-- (service role bypasses RLS and can read for aggregation)

-- Public read on aggregates (cached, pre-computed, no PII)
CREATE POLICY "read_condition_aggregates"
  ON condition_aggregates FOR SELECT
  USING (true);

-- ============================================================================
-- compute_condition_aggregates() - SQL function called nightly by pg_cron
-- or the Edge Function. Replaces all rows in condition_aggregates.
-- ============================================================================

CREATE OR REPLACE FUNCTION compute_condition_aggregates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cond              text;
  active_users      integer;
  symptoms_json     jsonb;
  correlations_json jsonb;
BEGIN
  FOR cond IN
    SELECT DISTINCT condition FROM anonymous_logs
  LOOP

    -- ── Active users (distinct week_of in last 4 weeks as proxy) ───────────
    SELECT COUNT(DISTINCT week_of)
    INTO   active_users
    FROM   anonymous_logs
    WHERE  condition  = cond
      AND  created_at >= now() - INTERVAL '28 days';

    -- ── Symptom aggregates ─────────────────────────────────────────────────
    SELECT jsonb_agg(
      jsonb_build_object(
        'symptomName',          symptom_name,
        'trackingCount',        entry_count,
        'avgSeverity',          avg_sev,
        'severityDistribution', sev_dist,
        'trendDirection',       trend
      ) ORDER BY entry_count DESC
    )
    INTO symptoms_json
    FROM (
      SELECT
        symptom_name,
        COUNT(*)                                       AS entry_count,
        ROUND(AVG(value)::numeric, 2)                 AS avg_sev,
        jsonb_build_array(
          COUNT(*) FILTER (WHERE value = 1),
          COUNT(*) FILTER (WHERE value = 2),
          COUNT(*) FILTER (WHERE value = 3),
          COUNT(*) FILTER (WHERE value = 4),
          COUNT(*) FILTER (WHERE value = 5)
        )                                              AS sev_dist,
        CASE
          WHEN
            AVG(value) FILTER (WHERE created_at >= now() - INTERVAL '28 days')
            >
            AVG(value) FILTER (
              WHERE created_at >= now() - INTERVAL '56 days'
                AND created_at <  now() - INTERVAL '28 days'
            ) + 0.3
          THEN 'worsening'
          WHEN
            AVG(value) FILTER (WHERE created_at >= now() - INTERVAL '28 days')
            <
            AVG(value) FILTER (
              WHERE created_at >= now() - INTERVAL '56 days'
                AND created_at <  now() - INTERVAL '28 days'
            ) - 0.3
          THEN 'improving'
          ELSE 'stable'
        END                                            AS trend
      FROM   anonymous_logs
      WHERE  condition = cond
      GROUP  BY symptom_name
    ) s;

    -- ── Context correlations (min 200 samples each) ────────────────────────
    WITH
      sleep_corr AS (
        SELECT
          'sleep_poor'     AS factor_a,
          'severity_high'  AS factor_b,
          ROUND(
            COUNT(*) FILTER (WHERE sleep_quality <= 2 AND value >= 3) * 100.0
            / NULLIF(COUNT(*) FILTER (WHERE sleep_quality IS NOT NULL), 0)
          )                AS pct,
          COUNT(*) FILTER (WHERE sleep_quality IS NOT NULL) AS n
        FROM anonymous_logs
        WHERE condition = cond
        HAVING COUNT(*) FILTER (WHERE sleep_quality IS NOT NULL) >= 200
      ),
      stress_corr AS (
        SELECT
          'stress_high'    AS factor_a,
          'severity_high'  AS factor_b,
          ROUND(
            COUNT(*) FILTER (WHERE stress_level >= 3 AND value >= 3) * 100.0
            / NULLIF(COUNT(*) FILTER (WHERE stress_level IS NOT NULL), 0)
          )                AS pct,
          COUNT(*) FILTER (WHERE stress_level IS NOT NULL) AS n
        FROM anonymous_logs
        WHERE condition = cond
        HAVING COUNT(*) FILTER (WHERE stress_level IS NOT NULL) >= 200
      ),
      exercise_corr AS (
        SELECT
          'exercise_yes'   AS factor_a,
          'severity_high'  AS factor_b,
          ROUND(
            COUNT(*) FILTER (WHERE exercise = true AND value >= 3) * 100.0
            / NULLIF(COUNT(*) FILTER (WHERE exercise IS NOT NULL), 0)
          )                AS pct,
          COUNT(*) FILTER (WHERE exercise IS NOT NULL) AS n
        FROM anonymous_logs
        WHERE condition = cond
        HAVING COUNT(*) FILTER (WHERE exercise IS NOT NULL) >= 200
      ),
      food_corr AS (
        SELECT
          'food_' || trigger_name AS factor_a,
          'severity_high'         AS factor_b,
          ROUND(
            SUM(CASE WHEN value >= 3 THEN 1 ELSE 0 END) * 100.0
            / NULLIF(COUNT(*), 0)
          )                       AS pct,
          COUNT(*)                AS n
        FROM (
          SELECT value, UNNEST(food_triggers) AS trigger_name
          FROM   anonymous_logs
          WHERE  condition = cond
            AND  food_triggers IS NOT NULL
        ) t
        GROUP BY trigger_name
        HAVING COUNT(*) >= 200
      ),
      all_corr AS (
        SELECT factor_a, factor_b, pct, n FROM sleep_corr
        UNION ALL
        SELECT factor_a, factor_b, pct, n FROM stress_corr
        UNION ALL
        SELECT factor_a, factor_b, pct, n FROM exercise_corr
        UNION ALL
        SELECT factor_a, factor_b, pct, n FROM food_corr
      )
    SELECT jsonb_agg(
      jsonb_build_object(
        'factorA',    factor_a,
        'factorB',    factor_b,
        'percentage', pct,
        'sampleSize', n
      ) ORDER BY pct DESC NULLS LAST
    )
    INTO correlations_json
    FROM all_corr
    WHERE pct IS NOT NULL;

    -- ── Upsert ─────────────────────────────────────────────────────────────
    INSERT INTO condition_aggregates
      (condition, total_active_users, symptoms, correlations, updated_at)
    VALUES
      (cond, active_users,
       COALESCE(symptoms_json,     '[]'),
       COALESCE(correlations_json, '[]'),
       now())
    ON CONFLICT (condition) DO UPDATE SET
      total_active_users = EXCLUDED.total_active_users,
      symptoms           = EXCLUDED.symptoms,
      correlations       = EXCLUDED.correlations,
      updated_at         = EXCLUDED.updated_at;

  END LOOP;
END;
$$;

-- ============================================================================
-- Schedule via pg_cron (enable the extension first if not already done):
--   CREATE EXTENSION IF NOT EXISTS pg_cron;
--   SELECT cron.schedule('nightly-aggregates', '0 3 * * *',
--     'SELECT compute_condition_aggregates()');
-- ============================================================================
