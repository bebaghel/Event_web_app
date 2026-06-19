import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "../../components/ui/dialog";
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
import { ArrowRight, Edit3 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "../../components/ui/button";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type VerifyGuestProps = {
  defaultEmail?: string;
  defaultName?: string;
  defaultPhone?: string;
  onClose?: () => void;
  onVerified?: () => void;
};

export default function VerifyGuest({
  defaultEmail = "",
  defaultName = "",
  defaultPhone = "",
  onClose,
  onVerified,
}: VerifyGuestProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(`${defaultPhone}`);
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<
    "email" | "otp" | "verifyPin" | "phone" | "phoneOtp"
  >("email");
  const [disableBtn, setDisableBtn] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setDisableBtn(true);

    let payload = {
      email,
      name: defaultName,
      phone,
    };

    try {
      const res: any = await sendOtp(payload);
      if (res.data.status) {
        if (res.data.isPin) {
          toast.success(res.data.message);
          setStep("verifyPin");
          return;
        }
        toast.success("OTP sent to your email");
        setStep("otp");
        setResendTimer(60);
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

    let payload: any = {
      otp: otp,
    };

    if (isPhoneLogin) {
      payload.phone = phone;
    } else {
      payload.email = email;
    }

    try {
      const res = await verifyOtp(payload);
      if (res.data.status) {
        toast.success("Verify Successfull");
        localStorage.setItem("guest_token", res.data?.response?.token);
        localStorage.setItem(
          "guest_user",
          JSON.stringify(res.data?.response?.user),
        );
        onVerified?.();
        onClose?.();
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
    if (isPhoneLogin) {
      if (!phone) return toast.error("Enter Phone first!");
    } else {
      if (!email) return toast.error("Enter Email first!");
    }
    if (resendTimer > 0) return;

    let payload = {
      email,
      name: defaultName,
      phone,
      is_whatsapp_login: isPhoneLogin && true,
    };

    try {
      const res = await sendOtp(payload);
      if (res.data.status && !res.data.isPin) {
        toast.success("OTP Resent!");
        setOtp("");
        setResendTimer(60);
      } else {
        toast.error("Cannot resend OTP for this account");
      }
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  const goBackToEmail = () => {
    setStep("email");
    setOtp("");
  };

  const handleVerifyPin = async () => {
    if (!pin) return toast.error("Please enter pin");
    setDisableBtn(true);

    try {
      const res = await verifyPin({ email, pin });
      if (res.data.status) {
        toast.success("Verify Successfull");
        localStorage.setItem("guest_token", res.data?.response?.token);
        localStorage.setItem(
          "guest_user",
          JSON.stringify(res.data?.response?.user),
        );
        onVerified?.();
        onClose?.();
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

  // whatsapp login
  const goBackToPhone = () => {
    setStep("phone");
    setOtp("");
  };

  const handleWhatsappLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phone) return toast.error("Please enter phone no");
    setDisableBtn(true);

    let payload = {
      email,
      name: defaultName,
      phone,
      is_whatsapp_login: true,
    };

    try {
      const res: any = await sendOtp(payload);
      if (res.data.status) {
        if (res.data.isPin) {
          toast.success(res.data.message);
          setStep("verifyPin");
          return;
        }
        toast.success("OTP sent to your phone");
        setStep("otp");
        setResendTimer(60);
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setDisableBtn(false);
    }
  };

  // google login
  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const res = await googleLogin({
        credential: credentialResponse.credential,
      });
      if (res.data.status) {
        toast.success("Verify Successfull");
        localStorage.setItem("guest_token", res.data?.response?.token);
        localStorage.setItem(
          "guest_user",
          JSON.stringify(res.data?.response?.user),
        );

        onVerified?.();
        onClose?.();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.message ||
          "Verification failed!",
      );
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all z-999" />
      <DialogContent className="z-999">
        {/* EMAIL STEP */}
        {step === "email" && (
          <>
            <div className="mb-6 text-center">
              <img src={logo} className="h-14 mx-auto" alt="logo" />
              <h1 className="mt-4 text-lg font-semibold">Verify to Continue</h1>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  placeholder="info@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoFocus
                />
              </div>

              <Button className="w-full" type="submit" disabled={disableBtn}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="flex-1 h-px bg-gray-300" />
              or verify with
              <span className="flex-1 h-px bg-gray-300" />
            </div>

            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Login Failed")}
            />

            {isPhoneLogin ? (
                <Button
                  type="button"
                  variant="outline"
                  style={{
                    fontFamily: "Google Sans, arial, sans-serif",
                    letterSpacing: ".25px",
                  }}
                  className="w-full h-10.5 flex justify-between px-3 items-center rounded-[4px] text-[14px] shadow-none text-[#3c4043] font-[500] border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    setIsPhoneLogin(false);
                    setStep("email");
                  }}
                >
                  <img
                    src="/images/brand/email.png"
                    alt="email"
                    className="h-6 w-6 object-contain"
                  />
                  <p className="mx-auto">Sign in with Email</p>
                </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                style={{
                  fontFamily: "Google Sans, arial, sans-serif",
                  letterSpacing: ".25px",
                }}
                className="w-full h-10.5 flex justify-between px-3 items-center rounded-[4px] text-[14px] shadow-none text-[#3c4043] font-[500] border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setIsPhoneLogin(true);
                  setStep("phone");
                }}
              >
                <img
                  src="/images/brand/whatsapp.svg"
                  alt="whatsapp"
                  className="h-5 w-5 object-contain"
                />
                <p className="mx-auto">Sign in with WhatsApp</p>
              </Button>
            )}
          </>
        )}

        {/* Phone step */}
        {step === "phone" && (
          <>
            <div className="mb-6 text-center">
              <img src={logo} className="h-14 mx-auto" alt="logo" />
              <h1 className="mt-4 text-lg font-semibold">Verify to Continue</h1>
            </div>

            <form onSubmit={handleWhatsappLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Phone (Whatsapp Number) *</Label>
                <PhoneInput
                  country={"in"}
                  value={phone}
                  onChange={(value) => setPhone(value)}
                  enableSearch
                  placeholder="Enter phone number"
                  inputStyle={{ width: "100%" }}
                />
              </div>

              <Button className="w-full" type="submit" disabled={disableBtn}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="flex-1 h-px bg-gray-300" />
              or verify with
              <span className="flex-1 h-px bg-gray-300" />
            </div>

            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Login Failed")}
            />

             {isPhoneLogin ? (
                <Button
                  type="button"
                  variant="outline"
                  style={{
                    fontFamily: "Google Sans, arial, sans-serif",
                    letterSpacing: ".25px",
                  }}
                  className="w-full h-10.5 flex justify-between px-3 items-center rounded-[4px] text-[14px] shadow-none text-[#3c4043] font-[500] border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    setIsPhoneLogin(false);
                    setStep("email");
                  }}
                >
                  <img
                    src="/images/brand/email.png"
                    alt="email"
                    className="h-6 w-6 object-contain"
                  />
                  <p className="mx-auto">Sign in with Email</p>
                </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                style={{
                  fontFamily: "Google Sans, arial, sans-serif",
                  letterSpacing: ".25px",
                }}
                className="w-full h-10.5 flex justify-between px-3 items-center rounded-[4px] text-[14px] shadow-none text-[#3c4043] font-[500] border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setIsPhoneLogin(true);
                  setStep("phone");
                }}
              >
                <img
                  src="/images/brand/whatsapp.svg"
                  alt="whatsapp"
                  className="h-5 w-5 object-contain"
                />
                <p className="mx-auto">Sign in with WhatsApp</p>
              </Button>
            )}
          </>
        )}

        {/* OTP STEP */}
        {step === "otp" && (
          <div className="space-y-4 overflow-x-hidden">
            <div>
              <img src={logo} className="h-14 mx-auto" alt="logo" />
              <h1 className="mt-4 text-lg font-semibold text-center">
                Verify to Continue Booking
              </h1>
              {isPhoneLogin ? (
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  {phone}
                  <Edit3
                    className="h-3 w-3 text-purple-700 cursor-pointer"
                    onClick={goBackToPhone}
                  />
                </p>
              ) : (
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  {email}
                  <Edit3
                    className="h-3 w-3 text-purple-700 cursor-pointer"
                    onClick={goBackToEmail}
                  />
                </p>
              )}
            </div>

            <div className="space-y-5 flex flex-col items-center">
              <Label>Enter OTP</Label>

              <InputOTP maxLength={6} onChange={setOtp}>
                <InputOTPGroup className="w-full">
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="h-14 w-12 md:w-16 text-lg"
                      autoFocus
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

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

            <Button
              onClick={handleVerifyOtp}
              className="w-full"
              disabled={disableBtn}
            >
              Verify OTP
            </Button>
          </div>
        )}

        {/* Pin */}
        {step === "verifyPin" && (
          <div className="space-y-3 overflow-x-hidden">
            <div className="mb-5">
              <img src={logo} className="h-14 mx-auto" alt="logo" />
              <h1 className="mt-4 text-lg font-semibold text-center">
                Verify to Continue Booking
              </h1>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                {email}
                <Edit3
                  className="h-3 w-3 text-purple-700 cursor-pointer"
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
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-14 w-full text-lg"
                  />
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
      </DialogContent>
    </Dialog>
  );
}
