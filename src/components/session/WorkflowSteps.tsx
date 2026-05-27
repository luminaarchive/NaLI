"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

interface Step {
  id: number;
  label: string;
  duration: number;
}

export function WorkflowSteps({ steps }: { steps: Step[] }) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    function advance() {
      if (currentIndex >= steps.length) return;
      const step = steps[currentIndex];
      setActiveStep(step.id);
      timeoutId = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step.id]);
        currentIndex++;
        advance();
      }, step.duration);
    }

    advance();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [steps]);

  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      {steps.map((step) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive = activeStep === step.id && !isCompleted;
        const isPending = activeStep < step.id && !isCompleted;
        return (
          <div
            key={step.id}
            className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${
              isPending ? "opacity-30" : "opacity-100"
            }`}
          >
            {isCompleted ? (
              <Check className="h-3.5 w-3.5 text-[#00FFB3] flex-shrink-0" />
            ) : isActive ? (
              <Loader2 className="h-3.5 w-3.5 text-[#00FFB3] animate-spin flex-shrink-0" />
            ) : (
              <div className="h-3.5 w-3.5 rounded-full border border-[#14261c] flex-shrink-0" />
            )}
            <span className={isActive ? "text-[#f5f0e8] font-medium" : "text-[#a1b3a8]"}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
