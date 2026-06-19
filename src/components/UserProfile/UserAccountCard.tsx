import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { updateUser } from "../../services/services";
import { toast } from "sonner";

export default function UserAccountCard({ user, fetchUser }: any) {
  const [loading, setLoading] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  const id = user?._id;
  let account_details = user?.account_details;

  const [form, setForm] = useState({
    account_holder_name: account_details?.account_holder_name || "",
    account_no: account_details?.account_no || "",
    ifsc_code: account_details?.ifsc_code || "",
    currency: user?.currency || "INR",
  });

  // Handle Inputs
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    // Account Holder Name
    if (!form.account_holder_name.trim()) {
      toast.error("Account holder name is required");
      return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(form.account_holder_name)) {
      toast.error("Account holder name can contain only letters");
      return false;
    }

    if (form.account_holder_name.trim().length < 3) {
      toast.error("Account holder name must be at least 3 characters");
      return false;
    }

    // Account Number
    if (!form.account_no.trim()) {
      toast.error("Account number is required");
      return false;
    }

    if (!/^\d{9,18}$/.test(form.account_no)) {
      toast.error("Account number must be 9 to 18 digits");
      return false;
    }

    // IFSC
    if (!form.ifsc_code.trim()) {
      toast.error("IFSC code is required");
      return false;
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code)) {
      toast.error("Invalid IFSC code");
      return false;
    }

    // Currency
    if (!form.currency) {
      toast.error("Currency is required");
      return false;
    }

    return true;
  };

  // const handleSave = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   const payload = {
  //     account_details: {
  //       account_holder_name: form.account_holder_name,
  //       account_no: form.account_no,
  //       ifsc_code: form.ifsc_code,
  //     },
  //     currency: form.currency,
  //   };

  //   try {
  //     const res = await updateUser(id, payload);

  //     if (res.data.status) {
  //       sessionStorage.setItem("user", JSON.stringify(res.data.response));
  //       toast.success("Account information updated successfully");
  //       closeModal();

  //       fetchUser();
  //     } else {
  //       toast.error(res.data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error updating account information:", error);
  //     toast.error("Failed to update account information");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      account_details: {
        account_holder_name: form.account_holder_name,
        account_no: form.account_no,
        ifsc_code: form.ifsc_code,
      },
      currency: form.currency,
    };

    try {
      const res = await updateUser(id, payload);

      if (res.data.status) {
        sessionStorage.setItem("user", JSON.stringify(res.data.response));

        toast.success("Account information updated successfully");

        closeModal();

        fetchUser();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error updating account information:", error);

      toast.error("Failed to update account information");
    } finally {
      setLoading(false);
    }
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
              Account Information
            </h3>
            <button
              onClick={openModal}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                  fill=""
                />
              </svg>
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Account holder name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.account_details?.account_holder_name || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                IFSC Code
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.account_details?.ifsc_code || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Account No.
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.account_details?.account_no || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Base Currency
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 capitalize">
                {user?.currency || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Platform Fee Charges
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 capitalize">
                {user?.charges_type || "-"}
              </p>
            </div>

            <span
              style={{
                fontSize: "10rem",
                position: "absolute",
                color: "#f1f1f1",
                bottom: "-2rem",
                right: "2rem",
                zIndex: "99",
              }}
            >
              {user?.currency == "INR" ? "₹" : "$"}
            </span>

            <div
              className="flex gap-2 items-center mt-5 md:mt-0 justify-center"
              style={{ zIndex: "9999" }}
            >
              <img
                src="/images/assets/aes256.webp"
                className="h-8 w-8 object-cover rounded-full"
              />
              <p className="text-xs text-gray-700">
                Data secured with AES-256 encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Account
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your account details
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2  custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label>Account Holder Name</Label>
                  <Input
                    type="text"
                    name="account_holder_name"
                    value={form.account_holder_name}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setForm({ ...form, account_holder_name: value });
                    }}
                    placeholder="Enter account holder name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    type="text"
                    name="account_no"
                    maxLength={18}
                    value={form.account_no}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setForm({ ...form, account_no: value });
                    }}
                    placeholder="Enter account no"
                  />
                </div>

                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input
                    type="text"
                    name="ifsc_code"
                    maxLength={11}
                    value={form.ifsc_code}
                    onChange={(e) => {
                      const value = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "");

                      setForm({ ...form, ifsc_code: value });
                    }}
                    placeholder="Enter IFSC Code"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Base Currency</Label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="INR">₹ - INR</option>
                    <option value="USD">$ - USD</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={loading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
