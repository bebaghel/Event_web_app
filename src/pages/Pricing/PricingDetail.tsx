import { useNavigate } from "react-router";
import { take_subscription } from "../../services/services";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { PLATFORM_GST } from "../../constants";

interface PricingDetailProps {
  isOpen: boolean;
  onClose: () => void;
  billingCycle: "monthly" | "yearly";
  plan: any;
  user: any;
}

const PricingDetail = ({
  isOpen,
  onClose,
  billingCycle,
  plan,
  user,
}: PricingDetailProps) => {
  const [plan_amount, setPlan_amount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (billingCycle == "monthly") {
      setPlan_amount(plan.price?.monthly);
    } else {
      setPlan_amount(plan.price?.yearly);
    }
  }, [billingCycle, plan]);

  const GST = Number(PLATFORM_GST);
  const gst_charges = plan_amount * GST;
  const total_amount = plan_amount + gst_charges;

  const curr_symbol = plan?.currency == "INR" ? "₹" : "$";

  const handlePayNow = async () => {
    const payload = {
      type: plan.id,
      currency: plan.currency,
      billing_cycle: billingCycle,
    };

    try {
      const res = await take_subscription(payload);

      if (res.data.status) {
        const data = res.data.response;
        // console.log("data", data);
        if (data.status === "active") {
          toast.success(res.data.message);
          navigate("/creator/events");
          return;
        }

        openRazorpay(data);
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  const openRazorpay = (data: any) => {
    const { order_details } = data;

    const options = {
      key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
      amount: order_details.amount,
      currency: order_details.currency,
      name: "Assist Buddi Event",
      description: "Pro Subscription",
      order_id: order_details.id,
      notes: {
        invoice_ref: `EB_SUB_${data.subs_id}`,
      },
      image: "https://event.assistbuddi.com/logo_txt_color.png",
      theme: { color: "#59168b" },
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      },
      handler: () => {
        toast.success("Payment successful");
        navigate("/creator/events");
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    razorpay.on("payment.failed", (err: any) => {
      toast.error(err.error.description || "Payment failed");
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full bg-white w-full sm:w-[420px] flex flex-col">
        {/* HEADER */}
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Subscription</h2>
          <X className="cursor-pointer h-4 w-4" onClick={onClose} />
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* USER INFO */}
          <div className="border rounded-xl bg-gray-50 p-4 text-sm">
            <div className="space-y-2 text-gray-700">
              <h1 className="text-md mb-2 font-semibold">Account Details</h1>
              <p>
                <b>Name:</b> {user?.name}
              </p>
              <p>
                <b>Email:</b> {user?.email}
              </p>
            </div>
          </div>

          {/* PLAN DETAILS */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span>Plan</span>
              <span className="font-medium">
                Assist Buddi Event - {plan.name}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Billing</span>
              <span className="capitalize">{billingCycle}</span>
            </div>

            <div className="flex justify-between">
              <span>Plan Amount</span>
              <span>
                {curr_symbol}
                {plan_amount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>GST ({GST * 100}%)</span>
              <span>
                {curr_symbol}
                {gst_charges.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                {curr_symbol}
                {total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* FIXED FOOTER */}
        <div className="p-4 border-t sticky bottom-0 bg-white">
          <button
            onClick={handlePayNow}
            className="w-full bg-purple-900 hover:bg-purple-800 text-white py-3 rounded-lg font-medium"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingDetail;
