import Button from "../../components/ui/button/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useState } from "react";
import { createBooking, getUsers } from "../../services/services";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Check } from "lucide-react";
import { IEventQuestion } from "../Registration/RegistrationForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { EventDetails } from "./EventDetails";

type EventRegistrationDialogProps = {
  isOpen: boolean;
  event: EventDetails;
  onClose: () => void;
  fetchEvent: () => void;
  ticket_price: any[];
};

export const AddGuestForm = ({
  isOpen,
  onClose,
  event,
  fetchEvent,
  ticket_price,
}: EventRegistrationDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reference: "",
    mode: "manual", // manual, viaAssistBuddi
  });
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [eventAnswers, setEventAnswers] = useState<Record<string, string>>({});

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  let fetchTimeout: any = null;

  // handle personal info input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      mode: "manual",
      reference: "",
    });
    setSelectedTicket("");
    setEventAnswers({});
    setSearchResults([]);
    setShowDropdown(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const fetchUsers = async (email: string) => {
    const payload = { search: email, limit: 50 };

    try {
      const res = await getUsers(payload);
      if (res.data.status) {
        setSearchResults(res.data.response);
        setShowDropdown(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });

    if (fetchTimeout) clearTimeout(fetchTimeout);

    // Only search when 2+ characters typed
    if (value.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    fetchTimeout = setTimeout(() => {
      fetchUsers(value);
    }, 300);
  };

  console.log("event ", event);

  const selectUser = (user: any) => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      mode: "manual",
      reference: user.reference || "",
    });
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    if (!formData.email) {
      return toast.error("Please enter guest email address");
    }

    if (!formData.phone) {
      return toast.error("Please enter guest phone number");
    }

    if (event?.ticket_type == "Paid" && !selectedTicket) {
      return toast.error("Please select a ticket");
    }

    const registration_answers = event.registration_questions.map(
      (q: IEventQuestion) => ({
        ques: q.ques,
        answer: eventAnswers[q._id] || "",
      }),
    );

    const payload = {
      event: event.event_id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      mode: formData.mode,
      reference: formData.reference,
      ticket: selectedTicket,
      bookby_organizer: true,
      registration_answers,
    };

    try {
      setLoading(true);
      const res = await createBooking(payload);

      if (res.data.status) {
        handleClose();
        toast.success("Guest added");
        fetchEvent();
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (id: string, value: string) => {
    setEventAnswers({ ...eventAnswers, [id]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all" />
      <DialogContent className="bg-white text-gray-900 rounded-lg h-[95vh] flex flex-col p-0">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <DialogHeader>
            <DialogTitle>Add Guest Booking</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col space-y-2 my-4 relative">
            <Label htmlFor="email">
              Email<span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleEmailChange}
              autoComplete="on"
              required
            />
          </div>

          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-[8rem] left-0 w-[90%] mx-auto bg-white border rounded-lg shadow-md z-50 ms-5 ">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => selectUser(user)}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex flex-col last:border-none border-b"
                >
                  <span className="font-medium">{user.email}</span>
                  <span className="text-sm text-gray-600">{user.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="name">
                Full Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="phone">
                Phone Number<span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                maxLength={15}
                required
              />
            </div>

            {/* Registration ques */}

            {event?.registration_questions.length != 0 && (
              <div className="space-y-4 mt-4 py-4 border-t-[2px]  border-dashed">
                {event.registration_questions.map((q: IEventQuestion) => (
                  <div key={q._id} className="flex flex-col space-y-2">
                    <Label>
                      {q.ques}
                      {q.required && <span className="text-red-500">*</span>}
                    </Label>
                    {q.question_type === "options" && q.options?.length > 0 ? (
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

            {ticket_price.length > 0 && (
              <div className="border-t-[2px]  border-dashed py-3">
                <p className="mb-2 font-semibold">Select ticket</p>
                <RadioGroup
                  value={selectedTicket}
                  onValueChange={(v) => setSelectedTicket(v)}
                  className="space-y-2"
                >
                  {ticket_price?.map((tkt: any) => (
                    <label
                      key={tkt._id}
                      htmlFor={tkt._id}
                      className={`relative cursor-pointer w-full rounded-lg flex flex-col transition p-3 border ${
                        selectedTicket === tkt._id
                          ? " bg-purple-50 shadow-md"
                          : " bg-white hover:shadow-md"
                      }`}
                    >
                      {/* Ticket Body */}
                      <div className="space-y-2 flex items-center justify-between">
                        <div className="mb-0">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {tkt.name}
                          </h3>

                          {tkt.description && (
                            <p className="text-gray-700 text-[11px] leading-tight my-1">
                              {tkt.description}
                            </p>
                          )}

                          <span className="text-xs font-semibold text-gray-800">
                            {tkt.price} {tkt.currency}
                          </span>
                        </div>

                        <RadioGroupItem
                          id={tkt._id}
                          value={tkt._id}
                          className="peer hidden"
                        />

                        <div
                          className={`w-5 h-5 flex items-center justify-center rounded-[4px] border border-purple-700 transition-all`}
                        >
                          {selectedTicket === tkt._id && (
                            <Check className="text-purple-600 w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>

                {event?.ticket_type == "Paid" && selectedTicket && (
                  <div className="mt-4 pt-4 border-t-[2px]  border-dashed grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="mode" className="flex items-center gap-1">
                        Booking Mode<span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.mode}
                        onValueChange={(value) =>
                          setFormData({ ...formData, mode: value })
                        }
                      >
                        <SelectTrigger className="w-full ">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="viaAssistBuddi" disabled>
                            Via AssistBuddi
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {formData.mode === "manual" && (
                        <p className="text-xs text-muted-foreground">
                          You will collect payments yourself via Bank Transfer,
                          UPI, Cash, etc.
                        </p>
                      )}

                      {formData.mode === "viaAssistBuddi" && (
                        <p className="text-xs text-muted-foreground">
                          Payments will be collected through AssistBuddi
                          platform.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="reference">Reference</Label>
                      <Input
                        id="name"
                        name="reference"
                        placeholder="Enter reference (optional)"
                        value={formData.reference || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="border-t bg-white px-6 py-4">
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Booking..." : "Book Ticket"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
