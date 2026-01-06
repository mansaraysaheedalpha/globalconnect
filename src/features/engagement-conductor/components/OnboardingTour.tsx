import React, { useState, useEffect } from 'react';
import styles from './OnboardingTour.module.css';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * OnboardingTour - Interactive guide for first-time users
 *
 * Features:
 * - Step-by-step walkthrough
 * - Element highlighting
 * - Progress indicator
 * - Skip option
 */
export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    // Highlight target element if specified
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        element.classList.add(styles.highlighted);

        // Scroll into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        return () => {
          element.classList.remove(styles.highlighted);
        };
      }
    }
  }, [step.target]);

  const handleNext = () => {
    if (isLastStep) {
      setIsVisible(false);
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={handleSkip} />

      {/* Tour Card */}
      <div className={styles.tourCard}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{step.title}</h3>
            <button className={styles.closeButton} onClick={handleSkip} aria-label="Close tour">
              ✕
            </button>
          </div>
          <div className={styles.progress}>
            <span className={styles.progressText}>
              Step {currentStep + 1} of {steps.length}
            </span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <p className={styles.description}>{step.description}</p>
        </div>

        <div className={styles.footer}>
          <button className={styles.skipButton} onClick={handleSkip}>
            Skip Tour
          </button>

          <div className={styles.navigation}>
            {!isFirstStep && (
              <button className={styles.previousButton} onClick={handlePrevious}>
                ← Previous
              </button>
            )}
            <button className={styles.nextButton} onClick={handleNext}>
              {isLastStep ? "Get Started! 🚀" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Default tour steps for Engagement Conductor
 */
export const defaultTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to Engagement Conductor!',
    description:
      'Your AI-powered assistant for managing event engagement. This quick tour will show you the key features in 60 seconds.'
  },
  {
    id: 'engagement-score',
    title: '📊 Real-Time Engagement Score',
    description:
      'Watch live engagement metrics calculated from chat activity, polls, and user presence. The score updates every 5 seconds.'
  },
  {
    id: 'anomaly-detection',
    title: '🔍 Anomaly Detection',
    description:
      'The AI continuously monitors for engagement drops. When detected, you\'ll see alerts here with severity levels and descriptions.'
  },
  {
    id: 'interventions',
    title: '🎯 AI Interventions',
    description:
      'When engagement drops, the AI suggests interventions like polls or prompts. You can review and approve suggestions, or let the agent run autonomously.'
  },
  {
    id: 'agent-mode',
    title: '🤖 Agent Modes',
    description:
      'Choose how much control you want: Manual (approve everything), Semi-Auto (approve low-confidence only), or Auto (fully autonomous).'
  },
  {
    id: 'learning',
    title: '🧠 Continuous Learning',
    description:
      'The agent learns which interventions work best in different contexts. Over time, it gets smarter and more effective at recovering engagement!'
  },
  {
    id: 'ready',
    title: '✅ You\'re All Set!',
    description:
      'Start by monitoring an active session. The agent will alert you if engagement drops. Happy hosting!'
  }
];

/**
 * Hook to manage onboarding tour state
 */
export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('engagement_conductor_tour_completed');

    if (!hasSeenTour) {
      // Show tour after a brief delay
      const timeout = setTimeout(() => {
        setShowTour(true);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem('engagement_conductor_tour_completed', 'true');
    setShowTour(false);
  };

  const skipTour = () => {
    localStorage.setItem('engagement_conductor_tour_completed', 'true');
    setShowTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem('engagement_conductor_tour_completed');
    setShowTour(true);
  };

  return {
    showTour,
    completeTour,
    skipTour,
    resetTour
  };
}
