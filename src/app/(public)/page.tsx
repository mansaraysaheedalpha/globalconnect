// src/app/(public)/page.tsx
import { HeroSection } from "./_components/hero-section";
import { FeaturesSection } from "./_components/features-section";
import { VisualShowcaseSection } from "./_components/showcase-section";
import { BenefitsSection } from "./_components/benefits-section"; // <-- Import the new section
import { CtaSection } from "./_components/cta-section";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <VisualShowcaseSection />
      <BenefitsSection /> {/* <-- Use it here */}
      <CtaSection />
    </div>
  );
}
