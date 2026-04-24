"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/providers";
import type { Symptom } from "@/app/providers";
import ConditionSelect from "./ConditionSelect";
import SymptomSetup from "./SymptomSetup";
import CommunityOptIn from "./CommunityOptIn";
import PlanPicker from "./PlanPicker";
import CardCollection from "./CardCollection";
import AppHeader from "@/components/layout/AppHeader";

type Step = 1 | 2 | 3 | 4 | 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { state } = useAppState();

  const [step, setStep] = useState<Step>(1);
  const [conditions, setConditions] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [communityOptIn, setCommunityOptIn] = useState(true);
  const [plan, setPlan] = useState<"monthly" | "annual" | "lifetime">("annual");

  async function handlePlanContinue() {
    if (plan === "lifetime") {
      try {
        const res = await fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: "lifetime",
            email: state.profile.email,
            customerId: state.profile.stripeCustomerId,
          }),
        });
        if (!res.ok) throw new Error();
        const { url } = (await res.json()) as { url: string };
        window.location.href = url;
      } catch {
        router.push("/upgrade");
      }
    } else {
      setStep(5);
    }
  }

  // If onboarding already completed (stripeCustomerId set), go straight to app
  useEffect(() => {
    if (state.profile.stripeCustomerId) {
      router.replace("/log");
    }
  }, [state.profile.stripeCustomerId, router]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  return (
    <>
      <AppHeader showStreak={false} />
      <div
        className="mx-auto"
        style={{
          maxWidth: "480px",
          minHeight: "100dvh",
          backgroundColor: "var(--bg-primary)",
        }}
      >
      {step === 1 && (
        <ConditionSelect
          onContinue={(selected) => { setConditions(selected); setStep(2); }}
        />
      )}
      {step === 2 && (
        <SymptomSetup
          conditions={conditions}
          onContinue={(selected) => { setSymptoms(selected); setStep(3); }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <CommunityOptIn
          conditions={conditions}
          onContinue={(optIn) => { setCommunityOptIn(optIn); setStep(4); }}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <PlanPicker
          selectedPlan={plan}
          onSelectPlan={setPlan}
          onContinue={handlePlanContinue}
          onBack={() => setStep(3)}
          conditions={conditions}
          symptoms={symptoms}
          communityOptIn={communityOptIn}
        />
      )}
      {step === 5 && plan !== "lifetime" && (
        <CardCollection
          plan={plan as "monthly" | "annual"}
          onBack={() => setStep(4)}
        />
      )}
      </div>
    </>
  );
}
