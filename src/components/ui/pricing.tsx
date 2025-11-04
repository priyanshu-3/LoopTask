"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const NumberFlow = dynamic(
  () => import("@number-flow/react").then((mod: any) => ({ default: mod.NumberFlow || mod.default || mod })),
  {
    ssr: false,
  }
);

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggle = async (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current && typeof window !== "undefined") {
      const confetti = (await import("canvas-confetti")).default;
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(var(--secondary))",
          "hsl(var(--muted))",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="container py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg whitespace-pre-line text-gray-400">
          {description}
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <label className="relative inline-flex items-center cursor-pointer">
          <Label>
            <Switch
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative"
            />
          </Label>
        </label>
        <span className="ml-2 font-semibold text-white">
          Annual billing <span className="text-cyan-400">(Save 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: 0,
                    scale: 1.0,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              `rounded-2xl p-6 text-center lg:flex lg:flex-col lg:justify-center relative flex flex-col min-h-[550px] w-full`,
              "backdrop-blur-[14px] bg-gradient-to-br",
              "from-white/10 to-white/5 border border-white/10",
              "dark:from-white/10 dark:to-white/5 dark:border-white/10 dark:backdrop-brightness-[0.91]",
              plan.isPopular 
                ? "scale-105 ring-2 ring-cyan-400/20 dark:from-white/20 dark:to-white/10 dark:border-cyan-400/30 shadow-2xl min-h-[600px]"
                : "",
              !plan.isPopular && "mt-5",
              index === 0 || index === 2
                ? "z-0 transform translate-x-0 translate-y-0 -translate-z-[50px] rotate-y-[10deg]"
                : "z-10",
              index === 0 && "origin-right",
              index === 2 && "origin-left"
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 text-[12px] font-semibold rounded-full bg-white text-black z-10">
                Most Popular
              </div>
            )}

            <div className="flex-1 flex flex-col">
              <p className="text-base font-semibold text-white mb-2">
                {plan.name}
              </p>
              
              <p className="text-sm text-gray-400 mb-6">
                {plan.description}
              </p>

              <div className="mt-6 flex items-center justify-center gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-white">
                  {isMounted && NumberFlow ? (
                    <NumberFlow
                      value={
                        isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                      }
                      format={{
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }}
                      formatter={(value: number) => `$${value}`}
                      transformTiming={{
                        duration: 500,
                        easing: "ease-out",
                      }}
                      willChange
                      className="font-variant-numeric: tabular-nums"
                    />
                  ) : (
                    `$${isMonthly ? plan.price : plan.yearlyPrice}`
                  )}
                </span>
                {plan.period !== "Next 3 months" && (
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-400">
                    / {plan.period}
                  </span>
                )}
              </div>

              <p className="text-xs leading-5 text-gray-400 mt-2">
                {isMonthly ? "billed monthly" : "billed annually"}
              </p>

              <ul className="mt-5 gap-2 flex flex-col flex-grow mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-white mt-1 flex-shrink-0" />
                    <span className="text-left text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-4 border-gray-700" />

              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter mt-auto",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out",
                  plan.isPopular || plan.buttonText !== "Get Started"
                    ? "bg-white hover:bg-gray-100 text-black border-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                )}
              >
                {plan.buttonText}
              </Link>

              <p className="mt-6 text-xs leading-5 text-gray-400">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
