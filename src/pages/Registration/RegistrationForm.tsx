import { useNavigate } from "react-router";
import Button from "../../components/ui/button/Button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useEffect, useState } from "react";
import { createBooking } from "../../services/services";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { ChevronDown, X } from "lucide-react";
import { PLATFORM_GST } from "../../constants";
import { IEvent, ITicket } from "../Explore-Events/Exp_EventDetails";
import moment from "moment";
import VerifyGuest from "./VerifyGuest";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export type IEventQuestion = {
  _id: string;
  ques: string;
  question_type: string;
  options: string[];
  required: boolean;
};

type EventRegistrationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  ticket: ITicket;
  event: IEvent;
  fetchEvent: () => void;
};

export const RegistrationForm = ({
  isOpen,
  onClose,
  ticket,
  event,
  fetchEvent,
}: EventRegistrationDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [eventAnswers, setEventAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [showFeeBreakup, setShowFeeBreakup] = useState(false);
  const [showVerifyGuest, setShowVerifyGuest] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const navigate = useNavigate();

  // console.log("ticket", ticket);

  // Unified user handling
  const token = sessionStorage.getItem("token");
  const guest_token = localStorage.getItem("guest_token");
  const isCreator = !!token;
  const isGuest = !!guest_token;
  const sessionUser = isCreator
    ? JSON.parse(sessionStorage.getItem("user") || "{}")
    : {};
  const guestUser = isGuest
    ? JSON.parse(localStorage.getItem("guest_user") || "{}")
    : {};

  const currentUser = isCreator ? sessionUser : guestUser;
  const isLoggedIn = isCreator || isGuest;

  useEffect(() => {
    if (guestUser) {
      setFormData({
        name: currentUser?.name,
        email: currentUser?.email,
        phone: `${currentUser?.country_code || ""}${currentUser?.phone || ""}`,
      });
    }
  }, []);

  // Resolve final values for use in payload, display, prefill
  const finalName = formData.name || currentUser?.name || "";
  const finalEmail = formData.email || currentUser?.email || "";
  const finalPhone =
    formData.phone ||
    `${currentUser?.country_code || ""}${currentUser?.phone || ""}` || "";
  const isPaid = event.ticket_type == "Paid";

  // handle personal info input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle event question answer change
  const handleAnswerChange = (id: string, value: string) => {
    setEventAnswers({ ...eventAnswers, [id]: value });
  };

  // form validation
  const validateForm = (): boolean => {
    if (!finalName) {
      toast.error("Please enter your name");
      return false;
    }
    if (!finalEmail) {
      toast.error("Please enter your email");
      return false;
    }
    if (!finalPhone) {
      toast.error("Please enter your phone number");
      return false;
    }
    const missingRequired = event.registration_questions.filter(
      (q: IEventQuestion) => q.required && !eventAnswers[q._id]?.trim(),
    );
    if (missingRequired.length > 0) {
      toast.error(`Please answer: "${missingRequired[0].ques}"`);
      return false;
    }
    return true; // Valid
  };

  // Ticket summary
  const isExclusive = event.charges_type === "exclusive";
  const grossAmount = Number(ticket?.price);
  const platformRate = event.organizer?.platform_fees;
  const gstRate = Number(PLATFORM_GST);
  const baseCharges = isExclusive ? grossAmount * platformRate : 0;
  const gstOnCharges = isExclusive ? baseCharges * gstRate : 0;
  const bookingFee = baseCharges + gstOnCharges;
  const payableAmount = isExclusive ? grossAmount + bookingFee : grossAmount;

  // For paid event
  const handleContinue = () => {
    const valid = validateForm();
    if (!valid) return;
    // Fixed: Verify check here too for earlier trigger (optional, but improves flow)
    if (!isCreator && (!isGuest || finalEmail !== currentUser.email)) {
      setGuestEmail(finalEmail);
      setShowVerifyGuest(true);
      return;
    }
    setStep(2); // move to confirmation
  };

  // Booking
  const handleSubmit = async () => {
    const valid = validateForm();
    if (!valid) return;
    // Fixed: Proper verify check
    if (!isCreator && (!isGuest || finalEmail !== currentUser.email)) {
      setGuestEmail(finalEmail);
      setShowVerifyGuest(true);
      return;
    }
    // map eventAnswers to registration_answers[]
    const registration_answers = event.registration_questions.map(
      (q: IEventQuestion) => ({
        ques: q.ques,
        answer: eventAnswers[q._id] || "",
      }),
    );
    const payload = {
      event: event.event_id,
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      registration_answers,
      ticket: ticket?._id,
    };
    try {
      setLoading(true);
      const res = await createBooking(payload);
      if (res.data.status) {
        const data = res.data.response;
        const ticketId = data?.tin;
        if (data.status == "Booked") {
          onClose();
          toast.success(res.data.message);
          if (data.is_approved) {
            navigate(`/ticket/${event.event_id}?t=${ticketId}`);
          }
          return;
        }
        if (ticket.price === 0) {
          navigate(`/ticket/${event.event_id}?t=${ticketId}`);
        } else {
          openRazorpay(data);
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
      fetchEvent();
    }
  };

  // Use final values in prefill
  const openRazorpay = (data: any) => {
    const { order_details } = data;
    const options = {
      key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
      amount: order_details.amount,
      currency: order_details.currency,
      name: "Assist Buddi Event",
      description: "Event Registration Payment",
      order_id: order_details.id,
      image: "https://event.assistbuddi.com/logo_txt_color.png",
      prefill: {
        name: finalName,
        email: finalEmail,
        contact: finalPhone,
      },
      theme: {
        color: event?.brand_color || "#59168b",
      },
      handler: async function (response: any) {
        console.log("PAYMENT SUCCESS:", response);
        navigate(`/ticket/${event.event_id}?t=${data.tin}`);
      },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
    razorpay.on("payment.failed", (error: any) => {
      toast.error(error.error.description);
    });
  };

  // Button label for consistency
  const step1ButtonLabel = isPaid
    ? "Continue"
    : isLoggedIn
      ? "Register"
      : "Verify";

  const curr_symbol = ticket?.currency == "INR" ? "₹" : "$";
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-2">
          <div
            className={`fixed right-0 h-full bg-white text-gray-900 transform transition-transform duration-300 ease-in-out ${
              isOpen ? "translate-x-0" : "translate-x-full"
            } w-full sm:w-[50%] md:w-[40%] lg:w-[35%] xl:w-[30%] 2xl:w-[25%]`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {step == 1 ? "Register" : "Booking Summary"}
                </h2>

                <div className="cursor-pointer" onClick={onClose}>
                  <X className="h-4 w-4 " />
                </div>
              </div>
            </div>

            {step == 1 && (
              <>
                <div className="h-full overflow-y-auto no-scrollbar">
                  {/* Fixed: Personal Details for both creator and guest */}
                  <div className="space-y-4 mt-3 px-6">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="name">
                        Full Name<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="email">
                        Email<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="phone">
                        Phone Number<span className="text-red-500">*</span>
                      </Label>
                      {/* <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={15}
                        required
                      /> */}
                      <PhoneInput
                        country={"in"}
                        value={formData.phone}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: value,
                          }))
                        }
                        enableSearch
                        placeholder="Enter phone number"
                        inputStyle={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  {/* Event Questions */}
                  {event.registration_questions.length != 0 && (
                    <div className="space-y-4 mt-4 mx-6 py-4 border-t-[2px] border-dashed pb-[60vh]">
                      {event.registration_questions.map((q: IEventQuestion) => (
                        <div key={q._id} className="flex flex-col space-y-2">
                          <Label>
                            {q.ques}
                            {q.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          {q.question_type === "options" &&
                          q.options?.length > 0 ? (
                            <Select
                              value={eventAnswers[q._id] || ""}
                              onValueChange={(value) =>
                                handleAnswerChange(q._id, value)
                              }
                            >
                              <SelectTrigger className="w-full border border-gray-300 dark:border-gray-700">
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                {q.options.map((opt, idx) => (
                                  <SelectItem key={idx} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder="Type your answer"
                              value={eventAnswers[q._id] || ""}
                              onChange={(e) =>
                                handleAnswerChange(q._id, e.target.value)
                              }
                              required={q.required}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* btn */}
                <div className="fixed bottom-0 w-full bg-white border-t px-4 py-3">
                  <button
                    className={`w-full text-sm font-normal disabled:opacity-50 disabled:text-white disabled:cursor-not-allowed py-3 rounded-md text-white ${
                      event.brand_color ? "brand_button" : ""
                    }`}
                    style={{
                      backgroundColor: event?.brand_color || "#59168b",
                    }}
                    onClick={isPaid ? handleContinue : handleSubmit}
                    disabled={loading}
                  >
                    {step1ButtonLabel}
                  </button>
                </div>
              </>
            )}
            {step === 2 && isPaid && (
              <>
                <div className="px-6 space-y-4 h-full overflow-y-auto no-scrollbar">
                  {/* Event / Ticket Card */}
                  <div className="border rounded-xl bg-white p-4 shadow-sm">
                    <div>
                      <h3 className="font-semibold text-base">
                        {event?.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {moment(event?.start_at).format(
                          "DD MMM, YYYY • hh:mm A",
                        )}
                      </p>
                    </div>
                    <hr className="my-3" />
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-600">{ticket?.name}</p>
                      <p className="font-semibold text-base">
                        {curr_symbol}
                        {grossAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {/* Fixed: Buyer Details use final values */}
                  <div className="border rounded-xl bg-gray-50 p-4 text-sm">
                    <div className="space-y-2 text-gray-700">
                      <p>
                        <b>Name:</b> {finalName}
                      </p>
                      <p>
                        <b>Email:</b> {finalEmail}
                      </p>
                      <p>
                        <b>Phone:</b> {finalPhone}
                      </p>
                    </div>
                  </div>
                  {/* Price Breakdown */}
                  <div className="border rounded-xl bg-white p-4 mb-[50vh]">
                    <p className="font-medium mb-3">Payment Details</p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Ticket Price</span>
                        <span>
                          {curr_symbol}
                          {grossAmount.toFixed(2)}
                        </span>
                      </div>
                      {isExclusive && (
                        <>
                          {/* Booking Fee (Clickable) */}
                          <div
                            className="flex justify-between text-gray-600 cursor-pointer select-none"
                            onClick={() => setShowFeeBreakup(!showFeeBreakup)}
                          >
                            <span className="flex items-center gap-1">
                              Booking Fee
                              <span
                                className={`transition-transform duration-300 ease-in-out ${
                                  showFeeBreakup ? "rotate-180" : "rotate-0"
                                }`}
                              >
                                <ChevronDown className="h-4 w-4 mt-0.5" />
                              </span>
                            </span>
                            <span>
                              {curr_symbol}
                              {bookingFee.toFixed(2)}
                            </span>
                          </div>
                          {/* Fee Breakup */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              showFeeBreakup
                                ? "max-h-40 opacity-100 mt-2"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="p-2 space-y-1 text-xs text-gray-500">
                              <div className="flex justify-between">
                                <span>Platform Charges</span>
                                <span>
                                  {curr_symbol}
                                  {baseCharges.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>GST ({gstRate * 100}%)</span>
                                <span>
                                  {curr_symbol}
                                  {gstOnCharges.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total Amount</span>
                        <span>
                          {curr_symbol}
                          {payableAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 space-y-4">
                  <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex gap-3">
                    <Button
                      variant="outline"
                      className="w-1/2"
                      onClick={() => setStep(1)}
                    >
                      Go Back
                    </Button>
                    <button
                      className={`w-1/2 text-sm font-normal disabled:opacity-50 disabled:text-white disabled:cursor-not-allowed py-3 rounded-md text-white ${
                        event.brand_color ? "brand_button" : ""
                      }`}
                      style={{
                        backgroundColor: event?.brand_color || "#59168b",
                      }}
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading
                        ? "Processing..."
                        : ticket.price == 0
                          ? "Confirm"
                          : "Confirm & Pay"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showVerifyGuest && (
        <VerifyGuest
          defaultEmail={guestEmail}
          defaultName={formData.name}
          defaultPhone={formData.phone}
          onClose={() => setShowVerifyGuest(false)}
          onVerified={() => {
            // Fixed: Reparse after verify
            const updatedGuestUser = JSON.parse(
              localStorage.getItem("guest_user") || "{}",
            );
            setFormData((prev) => ({
              ...prev,
              name: updatedGuestUser?.name || prev.name,
              email: updatedGuestUser?.email || prev.email,
              phone: updatedGuestUser?.phone || prev.phone,
            }));
            // Fixed: Auto-proceed
            if (isPaid) {
              setStep(2);
            } else {
              handleSubmit();
            }
          }}
        />
      )}
    </>
  );
};
