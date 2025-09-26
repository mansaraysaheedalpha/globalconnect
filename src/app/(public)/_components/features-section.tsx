// src/app/(public)/_components/features-section.tsx
import {
  PaintBrushIcon,
  CogIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Create",
    description:
      "Launch a stunning event page in minutes with our intuitive builder.",
    icon: PaintBrushIcon,
  },
  {
    name: "Manage",
    description:
      "Control everything from ticketing and analytics to attendee engagement from a single, elegant dashboard.",
    icon: CogIcon,
  },
  {
    name: "Experience",
    description:
      "Discover, register, and engage with events through a frictionless, beautiful interface.",
    icon: UsersIcon,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            An Intelligent, Unified OS
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to run successful events, all in one place.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-lg sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <feature.icon
                    className="h-8 w-8 flex-none text-primary"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
