// src/app/(public)/_components/benefits-section.tsx
import {
  SparklesIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const benefits = [
  {
    name: "Unparalleled Simplicity",
    description:
      "Our powerful, intuitive interface lets you create stunning events in minutes, not days. No coding or complex training required.",
    icon: SparklesIcon,
  },
  {
    name: "Enterprise-Grade Power",
    description:
      "From global-scale analytics to robust security and integrations, get the professional tools you need to run events with confidence.",
    icon: ShieldCheckIcon,
  },
  {
    name: "A Futuristic Experience",
    description:
      "Delight your attendees with a seamless, beautiful, and engaging journey from registration to post-event follow-up.",
    icon: GlobeAltIcon,
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-secondary py-20 sm:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The GlobalConnect Advantage
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We built a platform that's both incredibly powerful and beautifully
            simple.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-lg sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7">
                  <benefit.icon
                    className="h-8 w-8 flex-none text-primary"
                    aria-hidden="true"
                  />
                  {benefit.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{benefit.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
