import { useState, useRef } from "react";
import { Shield, KeyRound, Lock, Smartphone, ArrowLeft } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../../components/ui/input-otp";
import { updateUser } from "../../services/services";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const SetPin = ({ userId }: { userId: string }) => {
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  const handleSavePin = async () => {
    const payload = {
      pin,
    };
    try {
      const res: any = await updateUser(userId, payload);
      console.log(res);
      if (res.data.status) {
        navigate("/creator/events");
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to set pin!");
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1b1b1e] shadow-xl p-6 md:p-8 transition-colors">
      {!showPin ? (
        <>
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-gray-700 dark:text-gray-300" />
          </div>

          {/* Title */}
          <h2 className="text-center font-semibold text-xl text-gray-900 dark:text-white mt-6">
            Create a Passkey
          </h2>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2">
            Passkeys are a fast and secure way to sign in.
          </p>

          {/* Features */}
          <ul className="space-y-3 mt-6 text-sm">
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <KeyRound className="w-5 h-5" />
              Sign in without password or code
            </li>
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <Lock className="w-5 h-5" />
              Encrypted by your device
            </li>
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <Smartphone className="w-5 h-5" />
              Works across all your devices
            </li>
          </ul>

          <p className="text-xs text-center mt-4 text-gray-500 dark:text-gray-400">
            Your existing password will still work. You can update sign-in
            methods anytime.
          </p>

          {/* Buttons */}
          <div className="mt-6 space-y-3">
            <button
              className="w-full py-2.5 text-sm font-medium bg-purple-900 text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition"
              onClick={() => setShowPin(true)}
            >
              Create Passkey
            </button>
            <button
              onClick={() => navigate("/creator/events")}
              className="w-full py-2.5 text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:opacity-90 transition"
            >
              Not Now
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-center font-semibold text-xl text-gray-900 dark:text-white">
            <ArrowLeft onClick={() => setShowPin(false)} className="h-5 w-5" />{" "}
            Set Your Passkey PIN
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2">
            Enter 4-digit PIN to secure your account
          </p>

          {/* PIN input */}
          <div className="flex justify-center gap-3 mt-6">
            <InputOTP maxLength={4} onChange={setPin} className="w-full">
              <InputOTPGroup className="w-full">
                {[...Array(4)].map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-14 w-20 text-lg"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSavePin}
            className="w-full mt-6 py-3 text-sm font-medium bg-purple-900 text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition"
          >
            Save PIN
          </button>
        </>
      )}
    </div>
  );
};

export default SetPin;
