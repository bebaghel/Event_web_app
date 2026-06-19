import React, { useEffect, useState } from "react";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import {
  googleLogin,
  sendOtp,
  verifyOtp,
  verifyPin,
} from "../../services/services";
import { toast } from "sonner";
import logo from "/event-buddi-logo.png";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../../components/ui/input-otp";
import SetPin from "../../pages/AuthPages/SetPin";
import { ArrowRight, Edit3, X } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "../ui/button";
import { GoogleLogin } from "@react-oauth/google";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [userId, setUserId] = useState("");

  const [disableBtn, setDisableBtn] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [step, setStep] = useState<"email" | "otp" | "verifyPin" | "setPin">(
    "email",
  );

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const navigate = useNavigate();

  const handlePostLoginRedirect = () => {
    if (redirectTo?.startsWith("https://wa.me")) {
      window.open(redirectTo, "_blank"); // WhatsApp open
      return;
    } else if (redirectTo?.startsWith("pricing")) {
      navigate(`/${redirectTo}`, { replace: true });
      return;
    }
    navigate("/creator/events");
  };

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    if (disableBtn) return;

    setDisableBtn(true);

    try {
      const res = await sendOtp({ email });
      if (res.data.status) {
        if (res.data.isPin) {
          toast.success("Please enter your PIN to continue");
          setStep("verifyPin");
        } else {
          toast.success("OTP sent to your email");
          setStep("otp");
          setResendTimer(60);
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setDisableBtn(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Please enter OTP");
    setDisableBtn(true);

    try {
      const res = await verifyOtp({ email, otp });
      if (res.data.status) {
        toast.success(res.data.message);
        sessionStorage.setItem("token", res.data?.response?.token);
        sessionStorage.setItem(
          "user",
          JSON.stringify(res.data?.response?.user),
        );
        setUserId(res.data?.response?.user?._id);
        if (redirectTo) {
          handlePostLoginRedirect();
        } else {
          setStep("setPin");
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Verification failed!");
    } finally {
      setDisableBtn(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return toast.error("Enter Email first!");
    if (resendTimer > 0) return;

    try {
      const res = await sendOtp(email);
      if (res.data.status && res.data.message !== "Enter your pin") {
        toast.success("OTP Resent!");
        setResendTimer(60);
      } else {
        toast.error("Cannot resend OTP for this account");
      }
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  const handleVerifyPin = async () => {
    if (!pin) return toast.error("Please enter pin");
    setDisableBtn(true);

    try {
      const res = await verifyPin({ email, pin });
      if (res.data.status) {
        toast.success(res.data.message);
        sessionStorage.setItem("token", res.data?.response?.token);
        sessionStorage.setItem(
          "user",
          JSON.stringify(res.data?.response?.user),
        );
        handlePostLoginRedirect();
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Verification failed!");
    } finally {
      setDisableBtn(false);
    }
  };

  const handleResetPin = async () => {
    if (!email) return toast.error("Please enter email");
    const payload = {
      email,
      isResetPin: true,
    };

    try {
      const res = await sendOtp(payload);
      if (res.data.status) {
        toast.success("OTP sent to your email");
        setStep("otp");
        setResendTimer(60);
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [resendTimer]);

  const goBackToEmail = () => {
    setStep("email");
    setOtp("");
    setPin("");
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    const payload = {
      credential: credentialResponse.credential,
    };
    try {
      const res = await googleLogin(payload);
      if (res.data.status) {
        toast.success(res.data.message);
        sessionStorage.setItem("token", res.data?.response?.token);
        sessionStorage.setItem(
          "user",
          JSON.stringify(res.data?.response?.user),
        );
        handlePostLoginRedirect();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.response?.message ||
          "Verification failed!",
      );
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
      <Link
        to="/"
        className="fixed top-5 right-5 bg-gray-100 p-2 rounded-full cursor-pointer"
      >
        <X className="h-5 w-5 " />
      </Link>

      {/* Email Form */}
      {step === "email" && (
        <>
          <div className="mb-5 sm:mb-8">
            <img src={logo} className="h-15 w-15 lg:hidden" alt="logo" />
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md mt-5">
              Welcome, Organizer
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in as an organizer to start creating and managing events!
            </p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="info@gmail.com"
                required
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                autoFocus
                autoComplete="on"
                type="email"
                className="md:text-[15px]"
              />
            </div>
            <Button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-md bg-purple-900 text-white hover:bg-purple-800 transition w-full"
              disabled={disableBtn}
            >
              Continue <ArrowRight />
            </Button>
          </form>

          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mt-5">
            <span className="flex-1 h-px bg-gray-300"></span>
            <span>or </span>
            <span className="flex-1 h-px bg-gray-300"></span>
          </div>

          <div className="mt-5">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                handleGoogleLogin(credentialResponse);
              }}
              onError={() => {
                console.log("Login Failed");
                toast.error("Login Failed");
              }}
            />

            {/* <button
              onClick={() => login()}
              className="w-full border rounded-lg py-2 flex items-center justify-center gap-3 hover:bg-gray-50 transition"
            >
              <img src="/google.svg" className="h-5 w-5" />
              <span className="text-gray-700 font-medium">
                Sign in with Google
              </span>
            </button> */}
          </div>
        </>
      )}

      {/* OTP Form */}
      {step === "otp" && (
        <div className="space-y-3">
          <div className="mb-5">
            <img src={logo} className="h-15 w-15 lg:hidden" alt="logo" />
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md mt-5">
              Welcome, Organizer
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              Your email <span className="text-gray-900">{email}</span>{" "}
              <Edit3
                className="h-3 w-3 text-purple-900 cursor-pointer"
                onClick={goBackToEmail}
              />
            </p>
          </div>

          <Label>Enter OTP</Label>

          <InputOTP maxLength={6} onChange={setOtp} className="w-full">
            <InputOTPGroup className="w-full">
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot key={i} index={i} className="h-14 w-20 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendTimer > 0}
            className={`block w-full text-right text-sm font-medium ${
              resendTimer > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-purple-900 hover:underline"
            }`}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
          </button>

          <button
            onClick={handleVerifyOtp}
            disabled={disableBtn}
            className="px-4 py-2 text-sm mt-4 font-medium rounded-md bg-purple-900 text-white hover:bg-purple-800 transition w-full"
          >
            Verify OTP
          </button>
        </div>
      )}

      {/* Verify Pin Form (for existing users with PIN) */}
      {step === "verifyPin" && (
        <div className="space-y-3">
          <div className="mb-5">
            <img src={logo} className="h-15 w-15 lg:hidden" alt="logo" />
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md mt-5">
              Welcome, Organizer
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              Your email <span className="text-gray-900">{email}</span>{" "}
              <Edit3
                className="h-3 w-3 text-purple-900 cursor-pointer"
                onClick={goBackToEmail}
              />
            </p>
          </div>

          <Label>Enter your PIN</Label>
          <InputOTP
            maxLength={4}
            onChange={setPin}
            className="w-full"
            value={pin}
          >
            <InputOTPGroup className="w-full">
              {[...Array(4)].map((_, i) => (
                <InputOTPSlot key={i} index={i} className="h-14 w-40 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <p
            className="text-sm text-red-500 text-end cursor-pointer"
            onClick={handleResetPin}
          >
            Forgot PIN?
          </p>
          <Button
            onClick={handleVerifyPin}
            disabled={disableBtn}
            className="px-4 py-2 text-sm mt-4 font-medium rounded-md bg-purple-900 text-white hover:bg-purple-800 transition w-full"
          >
            Verify PIN
          </Button>
        </div>
      )}

      {/* Set Pin Form (for new users or without PIN) */}
      {step === "setPin" && <SetPin userId={userId} />}
    </div>
  );
}
