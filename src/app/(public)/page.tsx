// src/app/(public)/page.tsx
import { HeroSection } from "./_components/hero-section";
import { FeaturesSection } from "./_components/features-section";
import { HowItWorksSection } from "./_components/how-it-works-section";
import { ForOrganizersSection } from "./_components/for-organizers-section";
import { ForAttendeesSection } from "./_components/for-attendees-section";
import { VisualShowcaseSection } from "./_components/showcase-section";
import { BenefitsSection } from "./_components/benefits-section";
import { CtaSection } from "./_components/cta-section";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ForOrganizersSection />
      <ForAttendeesSection />
      <VisualShowcaseSection />
      <BenefitsSection />
      <CtaSection />
    </div>
  );
}
