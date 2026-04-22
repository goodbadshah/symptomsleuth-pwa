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
import FeatureShowcase from "./FeatureShowcase";
import AppHeader from "@/components/layout/AppHeader";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export default function OnboardingPage() {
  const router = useRouter();
  const { state } = useAppState();

  const [step, setStep] = useState<Step>(1);
  const [conditions, setConditions] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [communityOptIn, setCommunityOptIn] = useState(true);
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");

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
      {(step === 4 || step === 5 || step === 6 || step === 7 || step === 8) && (
        <FeatureShowcase
          feature={(['log', 'ai', 'timeline', 'community', 'report'] as const)[step - 4]}
          conditions={conditions}
          stepIndex={step - 3}
          onContinue={() => setStep((step + 1) as Step)}
          onSkip={() => setStep(9)}
        />
      )}
      {step === 9 && (
        <PlanPicker
          selectedPlan={plan}
          onSelectPlan={setPlan}
          onContinue={() => setStep(10)}
          onBack={() => setStep(8)}
          conditions={conditions}
          symptoms={symptoms}
          communityOptIn={communityOptIn}
        />
      )}
      {step === 10 && (
        <CardCollection
          plan={plan}
          onBack={() => setStep(9)}
        />
      )}
      </div>
    </>
  );
}
