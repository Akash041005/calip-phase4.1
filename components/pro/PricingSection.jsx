"use client";

import { useState } from "react";
import PricingToggle from "./PricingToggle";
import PricingCard from "./PricingCard";
import UpgradeModal from "./UpgradeModal";
import { pricingPlans } from "./proMockData";

export default function PricingSection() {
  const [billing, setBilling] = useState("monthly");
  const [modalOpen, setModalOpen] = useState(false);

  const freePlan = pricingPlans.find((plan) => plan.variant === "free");
  const proPlan = pricingPlans.find((plan) => plan.variant === "pro");

  return (
    <>
      <div className="mt-[80px] sm:mt-[110px] lg:mt-[150px] flex flex-col items-center">
        <PricingToggle billing={billing} onBillingChange={setBilling} />

        <div className="mt-[60px] sm:mt-[80px] lg:mt-[113px] flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-[50.62px]">
          <PricingCard plan={freePlan} billing={billing} />
          <PricingCard
            plan={proPlan}
            billing={billing}
            onUpgrade={() => setModalOpen(true)}
          />
        </div>
      </div>

      <UpgradeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
