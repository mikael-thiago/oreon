import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useCallback } from "react";

type Step = {
  readonly id: number;
  readonly title: string;
  readonly description: string;
};

type WizardStepsProps = {
  readonly steps: Step[];
  readonly currentStep: number;
  onStepChange?(step: number): void;
};

export function WizardSteps({ steps, currentStep, onStepChange }: WizardStepsProps) {
  const handleStepClick = useCallback(
    (id: number) => {
      if (!onStepChange) return;
      if (currentStep < id) return;

      onStepChange(id);
    },
    [onStepChange, currentStep]
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className={cn("flex items-center flex-1", isCompleted && "cursor-pointer")}
              onClick={() => handleStepClick(step.id)}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isActive && !isCompleted && "border-primary text-primary bg-primary/10",
                    !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground bg-background"
                  )}
                >
                  {isCompleted && <Check className="size-5" />}
                  {!isCompleted && <span className="text-sm font-semibold">{step.id}</span>}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      (isActive || isCompleted) && "text-foreground",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-all",
                    isCompleted && "bg-primary",
                    !isCompleted && "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
