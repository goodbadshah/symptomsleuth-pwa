"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/providers";
import type { Symptom } from "@/app/providers";
import ConditionSelect from "./ConditionSelect";
import SymptomSetup from "./SymptomSetup";
import TrialConfirmation from "./TrialConfirmation";
import AppHeader from "@/components/layout/AppHeader";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { state, dispatch } = useAppState();

  const [step, setStep] = useState<Step>(1);
  const [conditions, setConditions] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);

  // Already completed onboarding + payment → straight to app
  useEffect(() => {
    if (state.profile.stripeCustomerId && !state.profile.awaitingAccountSetup) {
      router.replace("/log");
    }
  }, [state.profile.stripeCustomerId, state.profile.awaitingAccountSetup, router]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  function handleTrialContinue() {
    // Persist conditions + symptoms to localStorage before leaving onboarding
    dispatch({ type: "SET_CONDITIONS", payload: conditions });
    dispatch({ type: "SET_SYMPTOMS", payload: symptoms });
    router.push("/upgrade");
  }

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
            onContinue={(selected) => {
              setConditions(selected);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <SymptomSetup
            conditions={conditions}
            onContinue={(selected) => {
              setSymptoms(selected);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <TrialConfirmation
            onContinue={handleTrialContinue}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </>
  );
}
