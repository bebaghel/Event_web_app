import React, { useEffect, useState } from "react";
import logo from "/event-buddi-logo.png";
import { useNavigate, useSearchParams } from "react-router";
import pricingData from "../../config/pricing.json";
import { Switch } from "../../components/ui/switch";
import PricingDetail from "./PricingDetail";

type PricingCardProps = {
  children: React.ReactNode;
  description: string;
  price: string;
  type: string;
  subscription: string;
  buttonText: string;
  active?: boolean;
  onClick: () => void;
};

type BillingCycle = "monthly" | "yearly";

const Pricing = () => {
  const [openPricingDetail, setOpenPricingDetail] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const plan = searchParams.get("plan");
    const billing = searchParams.get("billing");

    if (plan === "pro") {
      setSelectedPlan(plansObject.pro);
      setOpenPricingDetail(true);
    }
    if (billing === "monthly" || billing === "yearly") {
      setBillingCycle(billing);
    }
  }, []);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const token = sessionStorage.getItem("token");

  // Extract the plans object from the array
  const plansObject = pricingData[0]; // { free: {...}, pro: {...}, enterprise: {...} }
  const plans = Object.values(plansObject); // Array of plan objects

  const handlePricing = async (planId: string) => {
    if (planId === "Starter") {
      if (!token) return navigate("/signin");
      navigate("/creator/events");
      return;
    }

    if (planId === "Enterprise") {
      const message = encodeURIComponent(
        "Hello Assist Buddi Event 👋\n\nI'm interested in the Enterprise plan and would like to know more details."
      );

      const whatsappUrl = `https://wa.me/918084378326?text=${message}`;
      if (!token) {
        return navigate(`/signin?redirect=${encodeURIComponent(whatsappUrl)}`);
      }
      window.open(whatsappUrl, "_blank");
      return;
    }

    if (planId === "Pro") {
      const billing = billingCycle;
      if (!token) {
        return navigate(
          `/signin?redirect=${encodeURIComponent(
            `pricing?plan=pro&billing=${billing}`
          )}`
        );
      }

      const proPlan = plansObject.pro;
      setSelectedPlan(proPlan);
      setBillingCycle(billing);
      setOpenPricingDetail(true);
    }
  };

  return (
    <>
      <section className="pb-10">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="flex justify-center mb-3">
              <img src={logo} className="h-10" alt="EventBuddi" />
            </div>

            <h2 className="text-4xl font-bold text-gray-900">
              Our Pricing Plans
            </h2>

            <p className="text-gray-600 mt-4">
              Simple, transparent pricing for every scale.
            </p>

            {/* Billing Switch */}
            <div className="flex justify-center items-center gap-3 mt-6">
              <span className="text-sm">Monthly</span>
              <Switch
                checked={billingCycle === "yearly"}
                onCheckedChange={(v) =>
                  setBillingCycle(v ? "yearly" : "monthly")
                }
                className="data-[state=checked]:bg-purple-900"
              />
              <span className="text-sm">
                Yearly{" "}
                <span className="text-xs text-green-600 font-medium">
                  (Save up to 17%)
                </span>
              </span>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {plans.map((plan: any) => {
              const price =
                plan.price[billingCycle] === null ||
                plan.price[billingCycle] === undefined
                  ? "Custom"
                  : `₹${plan.price[billingCycle].toLocaleString()}`;

              const isYearly = billingCycle === "yearly";
              const subscriptionText =
                price === "Custom" ? "" : isYearly ? "year" : "month";

              return (
                <PricingCard
                  key={plan.id}
                  type={plan.label || plan.name}
                  price={price}
                  subscription={subscriptionText}
                  description={plan.best_for}
                  buttonText={
                    plan.id === "Enterprise" ? "Contact Sales" : "Get Started"
                  }
                  active={plan.id === "Pro"}
                  onClick={() => handlePricing(plan.id)}
                >
                  <ul className="space-y-3">
                    {plan.features.map((f: string, i: number) => (
                      <List key={i}>{f}</List>
                    ))}
                  </ul>
                </PricingCard>
              );
            })}
          </div>
        </div>

        <p className="pt-20 text-gray-500 text-sm text-center">
          Payment Gateway (PG) charges apply as per the gateway norms (usually
          around 2%). Platform fees are calculated on top of PG charges.
        </p>
      </section>

      {openPricingDetail && (
        <PricingDetail
          isOpen={openPricingDetail}
          onClose={() => setOpenPricingDetail(false)}
          billingCycle={billingCycle}
          plan={selectedPlan}
          user={user}
        />
      )}
    </>
  );
};

export default Pricing;

// PricingCard and List components remain unchanged
const PricingCard = ({
  children,
  description,
  price,
  type,
  subscription,
  buttonText,
  active = false,
  onClick,
}: PricingCardProps) => {
  return (
    <div className="w-full">
      <div
        className={`relative rounded-2xl p-8 border transition-all ${
          active
            ? "border-purple-900 shadow-xl scale-[1.03]"
            : "border-gray-200 hover:shadow-lg"
        }`}
      >
        {active && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-900 text-white text-xs px-3 py-1 rounded-full">
            Most Popular
          </span>
        )}

        <h3 className="text-lg font-semibold text-purple-900">{type}</h3>

        <h2 className="mt-4 text-4xl font-bold text-purple-900">
          {price}
          {subscription && (
            <span className="text-base text-gray-600"> /{subscription}</span>
          )}
        </h2>

        <p className="mt-4 text-gray-600 border-b pb-6">{description}</p>

        <div className="mt-6">{children}</div>

        <button
          onClick={onClick}
          className={`mt-8 w-full py-3 rounded-lg font-medium transition-all ${
            active
              ? "bg-purple-900 text-white hover:bg-purple-800"
              : "border border-purple-900 text-purple-900 hover:bg-purple-900 hover:text-white"
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const List = ({ children }: { children: React.ReactNode }) => {
  return (
    <li className="flex items-start gap-3 text-gray-700">
      <span className="mt-[2px] text-purple-900 font-bold">✓</span>
      <span>{children}</span>
    </li>
  );
};
