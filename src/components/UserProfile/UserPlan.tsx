import moment from "moment";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function UserPlan({ user, fetchUser }: any) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const id = user?._id;
  let plan_details = user?.plan;

  const handleUpgradeSubs = () => {
    navigate("/pricing");
  };

  return (
    <>
      <div
        className="mt-5 p-5 border bg-white border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6"
        style={{ position: "relative" }}
      >
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Subscription
            </h3>
            <div className="flex items-center gap-2 ">
              <button
                onClick={() => navigate("/creator/subscriptions")}
                className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
              >
                History
              </button>
              <button
                onClick={handleUpgradeSubs}
                className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
              >
                Update Plan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Plan Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 ">
                {plan_details?.type}
              </p>
            </div>

            {plan_details?.billing_cycle && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Billing Cycle
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 capitalize">
                  {plan_details?.billing_cycle}
                </p>
              </div>
            )}

            {plan_details?.subscribed_date && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Start Date
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {moment(plan_details?.subscribed_date).format("DD MMM, YYYY")}
                </p>
              </div>
            )}

            {plan_details?.expiry_date && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Expiry Date
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {moment(plan_details?.expiry_date).format("DD MMM, YYYY")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
