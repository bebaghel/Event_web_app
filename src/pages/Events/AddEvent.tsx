import React, { useEffect, useState, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  MapPin,
  Calendar,
  Ticket,
  Users,
  ImagePlus,
  Plus,
  Edit,
  Trash2,
  Globe,
  Lock,
  Edit3,
  Palette,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import AIContent from "./AIContent";
import {
  addEvent,
  getAllPages,
  getEventById,
  updateEvent,
} from "../../services/services";
import { toast } from "sonner";
import { useLocation, useNavigate, useParams } from "react-router";
import { API_URL, mediaUrl } from "../../constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogFooter,
} from "../../components/ui/dialog";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import moment from "moment";
import DatePicker from "../../components/shared/Date";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import Loading from "../loading";
import eventCategory from "../../config/event_category.json";
import * as Icons from "lucide-react";
import { EventPage } from "../EventPage/Page";
import EventQuestions, { Question } from "./EventQuestion";

type ITicket = {
  name: string;
  price?: string;
  description: string;
  currency: string;
  ticket_details: string;
  slots?: number | null;
  ticket_questions: Question[];
};

interface FormState {
  title: string;
  description: string;
  startDate: string; // Store as YYYY-MM-DD for consistency
  startTime: string;
  endDate: string; // Store as YYYY-MM-DD for consistency
  endTime: string;
  location: string;
  location_type: string;
  ticket_type: string;
  ticket_price: ITicket[];
  approval: boolean;
  capacity: number | null;
  is_public: boolean;
  image: File | null;
  imagePreview: string | null;
  brand_color: string;
  virtual_link: string;
  event_category: string;
  page: string;
  // registration_questions: any[];
  seo_keywords: string[];
}

const AddEvent: React.FC = () => {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const token = sessionStorage.getItem("token");
  const organizer = user?._id;
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiContent, setAiContent] = useState(false);
  const [seoInput, setSeoInput] = useState("");

  const MAX_SEO_CHARACTERS = 500;

  const location = useLocation();
  const selectedDate = location.state?.date || "";
  const page_id = location.state?.page_id || "";

  const [pages, setPages] = useState<EventPage[]>([]);

  const [ticketData, setTicketData] = useState<ITicket>({
    name: "",
    price: "",
    description: "",
    currency: user.currency,
    ticket_details: "",
    slots: null,
    ticket_questions: [],
  });

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    startDate: selectedDate || "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    location_type: "Offline",
    ticket_type: "Free",
    ticket_price: [],
    approval: false,
    capacity: null,
    is_public: true,
    image: null,
    imagePreview: null,
    brand_color: "#59168b",
    virtual_link: "",
    event_category: "",
    page: page_id || null,
    // registration_questions: [],
    seo_keywords: [],
  });

  const session_id: string = localStorage.getItem("sessionId") || "";

  const handleAIInsert = (text: string) => {
    setForm((prev) => ({ ...prev, description: text }));
    setAiContent(false);
    setDialogOpen(true);
  };

  const fetchPages = async () => {
    const payload = {
      user: user?._id,
    };
    try {
      const res = await getAllPages(payload);
      // console.log(res);
      if (res.data.status) {
        setPages(res.data.response.pages || []);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const calculateCapacityFromTickets = (tickets: ITicket[]) => {
    return tickets.reduce((sum, t) => {
      if (t.slots !== null && !isNaN(Number(t.slots))) {
        return sum + Number(t.slots);
      }
      return sum;
    }, 0);
  };

  const handleSavePricing = () => {
    if (!ticketData.name || !ticketData.price || !ticketData.currency) {
      toast.error("Please fill all required fields");
      return;
    }

    const finalTicket = {
      ...ticketData,
      slots: ticketData.slots ? Number(ticketData.slots) : null,
    };

    setForm((prev) => {
      let updated = [...prev.ticket_price];

      if (editingIndex !== null) {
        // Edit mode
        updated[editingIndex] = finalTicket;
      } else {
        // Add mode
        updated.push(finalTicket);
      }

      // Capacity auto fill
      const totalSlots = calculateCapacityFromTickets(updated);

      return {
        ...prev,
        ticket_price: updated,
        capacity: totalSlots > 0 ? totalSlots : prev.capacity,
      };
    });

    // Reset edit mode
    setEditingIndex(null);

    // Reset input fields
    setTicketData({
      name: "",
      price: "",
      description: "",
      currency: "INR",
      slots: null,
      ticket_details: "",
      ticket_questions: [],
    });

    setIsPricingDialogOpen(false);
  };

  const handleDeleteTicket = (index: number) => {
    setForm((prev) => ({
      ...prev,
      ticket_price: prev.ticket_price.filter((_, i) => i !== index),
    }));
  };

  const handleEditTicket = (index: number) => {
    const editTicket = form.ticket_price[index];
    setTicketData(editTicket);
    setEditingIndex(index);
    setIsPricingDialogOpen(true);
  };

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await getEventById(id);
      if (res.data.status && res.data.response) {
        const event = res.data.response;

        const start = new Date(event.start_at);
        const end = new Date(event.end_at);

        // Ensure valid dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          toast.error("Invalid event dates");
          return;
        }

        setForm({
          title: event.title || "",
          description: event.description || "",
          startDate: start.toISOString().split("T")[0],
          startTime: start.toTimeString().slice(0, 5),
          endDate: end.toISOString().split("T")[0],
          endTime: end.toTimeString().slice(0, 5),
          location: event.location || "",
          location_type: event.location_type || "Offline",
          ticket_type: event.ticket_type || "Free",
          ticket_price: event.ticket_price || [],
          approval: event.approval || false,
          capacity: event.capacity || null,
          is_public: event.is_public || true,
          brand_color: event.brand_color || "",
          virtual_link: event.virtual_link || "",
          event_category: event.event_category || "",
          page: event.page || null,
          seo_keywords: event.seo_keywords || [],
          // registration_questions: event.registration_questions || [],
          image: null,
          imagePreview: event.image
            ? `${mediaUrl}/event_images/${event.image}`
            : null,
        });
      }
    } catch (error) {
      console.error("Failed to load event for edit:", error);
      toast.error("Could not load event data");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);

      setForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: preview,
      }));
    }
  };

  useEffect(() => {
    if (form.location_type === "Virtual") {
      setForm((prev) => ({
        ...prev,
        location: "", // offline location clear
      }));
    }

    if (form.location_type === "Offline") {
      setForm((prev) => ({
        ...prev,
        virtual_link: "", // virtual link clear
      }));
    }
  }, [form.location_type]);

  const handleSubmit = async () => {
    setSubmitted(true);
    // Validation
    if (!form.imagePreview) {
      toast.error("Please select image");
      setSubmitted(false);
      return;
    }

    if (!form.startDate || !form.startTime || !form.endTime) {
      toast.error("Please select start and end date/time");
      setSubmitted(false);
      return;
    }

    const start_at = moment(`${form.startDate}T${form.startTime}`).toDate();
    const end_at = moment(`${form.endDate}T${form.endTime}`).toDate();

    const formData = new FormData();
    if (!id) {
      formData.append("organizer", organizer);
    }
    formData.append("is_public", form.is_public.toString());
    formData.append("title", form.title);
    formData.append("page", form.page);
    formData.append("description", form.description);
    formData.append("start_at", start_at.toISOString());
    formData.append("end_at", end_at.toISOString());
    formData.append("ticket_type", form.ticket_type);
    formData.append("ticket_price", JSON.stringify(form.ticket_price));
    formData.append("seo_keywords", JSON.stringify(form.seo_keywords));
    formData.append("approval", form.approval.toString());
    formData.append("location", form.location);
    formData.append("location_type", form.location_type);
    formData.append("virtual_link", form.virtual_link);
    formData.append("event_category", form.event_category);
    formData.append("capacity", String(form.capacity) || "");
    formData.append("session_id", session_id);
    formData.append("brand_color", form.brand_color);
    // formData.append(
    //   "registration_questions",
    //   String(form.registration_questions)
    // );
    if (form.image) {
      formData.append("image", form.image);
    }

    // console.log("Prepared FormData entries:");
    // for (let [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }

    try {
      let res: any;
      if (id) {
        res = await updateEvent(id, formData);
      } else {
        res = await addEvent(formData);
      }
      // console.log(res);

      if (res.data.status) {
        toast.success(res.data.message);
        if (id) {
          navigate(-1);
        } else {
          navigate("/creator/events");
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      console.log(error?.response?.data?.response[0]?.msg);
      toast.error(
        error?.response?.data?.response[0]?.msg ||
          error?.response?.data?.message ||
          "Something went wrong",
      );
    } finally {
      setSubmitted(false);
    }
  };

  // Helper to format date for display in DatePicker button (if needed)
  const formatDisplayDate = (isoDate: string) => {
    if (!isoDate) return null;
    return moment(isoDate, "YYYY-MM-DD").toDate();
  };

  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [form.title]);

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-6 md:mt-4">
          {/* Header Row */}

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left */}
            <div className="flex flex-col gap-4">
              {/* Event Poster Upload */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm flex items-center justify-center relative overflow-hidden">
                {/* Hidden file input */}
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  required
                />

                {/* Image Preview or Placeholder */}
                {form.imagePreview ? (
                  <img
                    src={form.imagePreview}
                    alt="Event poster"
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div
                    onClick={() =>
                      document.getElementById("fileInput")?.click()
                    }
                    className="flex flex-col items-center justify-center h-[50vh] w-full cursor-pointer text-gray-500 dark:text-gray-300 gap-2"
                    style={{
                      backgroundImage: `url("/images/assets/signin-bg.jpg")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <ImagePlus size={36} />
                    <p className="text-sm">Upload Event Image / Banner</p>
                  </div>
                )}

                {/* Upload Floating Button */}
                {form.imagePreview && (
                  <button
                    onClick={() =>
                      document.getElementById("fileInput")?.click()
                    }
                    className="absolute bottom-4 right-4 bg-black dark:bg-white text-white dark:text-black p-3 rounded-full hover:opacity-80 transition shadow-lg"
                  >
                    <ImagePlus size={24} />
                  </button>
                )}
              </div>

              {/* EVENT NAME BELOW IMAGE BOX (NEW) */}
              {form.title && (
                <div className="mt-3 break-words whitespace-normal">
                  <h2 className="text-md text-gray-900 dark:text-white">
                    {form.title}
                  </h2>
                </div>
              )}
            </div>
            {/* Right */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-end gap-2 sm:gap-4">
                <Select
                  value={form.page ?? ""}
                  onValueChange={(value) => {
                    setForm({ ...form, page: value });
                  }}
                >
                  <SelectTrigger className="w-[170px] sm:w-[200px] bg-white">
                    <SelectValue placeholder="Select Event Page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.length == 0 ? (
                      <SelectItem value="no-page" disabled>
                        No pages yet
                      </SelectItem>
                    ) : (
                      <>
                        {pages.map((p) => (
                          <SelectItem key={p._id} value={p._id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>

                <Select
                  value={form.event_category}
                  onValueChange={(value) => {
                    setForm({ ...form, event_category: value });
                  }}
                >
                  <SelectTrigger className="w-[180px] sm:w-[200px] bg-white">
                    <SelectValue placeholder="Select Event Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventCategory.map((ev_ct, index) => {
                      const Icon = Icons[
                        ev_ct.icon as keyof typeof Icons
                      ] as LucideIcon;

                      return (
                        <SelectGroup key={index}>
                          <SelectItem
                            value={ev_ct.value}
                            className="flex items-center gap-2"
                          >
                            {Icon && <Icon size={16} />}
                            <span>{ev_ct.label}</span>
                          </SelectItem>
                        </SelectGroup>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              {/* Event Name Input */}
              <textarea
                ref={titleRef}
                placeholder="Event Name"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full text-2xl md:text-3xl font-semibold bg-transparent border-b-[2px] border-dashed border-gray-300 dark:border-gray-600 pb-2 focus:outline-none resize-none overflow-hidden leading-tight"
                rows={1}
                onInput={(e) => {
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height =
                    e.currentTarget.scrollHeight + "px";
                }}
                autoFocus
              />

              {/* Date Time Section */}
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                {/* Start */}
                <div className="flex items-center justify-between">
                  <span className="w-[50px] text-gray-700 dark:text-gray-300 me-2.5 md:me-0">
                    Start
                  </span>
                  <div className="flex gap-3">
                    <DatePicker
                      value={formatDisplayDate(form.startDate)}
                      onChange={(date: Date | null) => {
                        const isoDate = date
                          ? moment(date).format("YYYY-MM-DD")
                          : "";
                        setForm({ ...form, startDate: isoDate });
                      }}
                      placeholder="Start Date"
                      className="w-[140px] md:w-[200px]"
                      disabledRules={{ before: new Date() }}
                    />
                    <input
                      type="time"
                      value={form.startTime || ""}
                      onChange={(e) =>
                        setForm({ ...form, startTime: e.target.value })
                      }
                      className="border rounded-md px-2 py-1 dark:bg-gray-700 dark:border-gray-600 shadow-xs text-[14px] w-[90px]"
                    />
                  </div>
                </div>

                {/* End */}
                <div className="flex items-center justify-between">
                  <span className="w-[50px] text-gray-700 dark:text-gray-300 me-4  md:me-0">
                    End
                  </span>
                  <div className="flex gap-3">
                    <DatePicker
                      value={formatDisplayDate(form.endDate)}
                      onChange={(date: Date | null) => {
                        const isoDate = date
                          ? moment(date).format("YYYY-MM-DD")
                          : "";
                        setForm({ ...form, endDate: isoDate });
                      }}
                      placeholder="End Date"
                      className="w-[140px] md:w-[200px]"
                      disabledRules={{ before: new Date() }}
                    />
                    <input
                      type="time"
                      value={form.endTime || ""}
                      onChange={(e) =>
                        setForm({ ...form, endTime: e.target.value })
                      }
                      className="border rounded-md px-2 py-1 dark:bg-gray-700 dark:border-gray-600 shadow-xs text-[14px] w-[90px]"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-start gap-1">
                <MapPin size={18} className="text-gray-500" />
                <div className="flex flex-col  w-full">
                  <div className="text-sm font-medium flex justify-between mb-4 md:mb-2">
                    Add Event Location
                    <Select
                      value={form.location_type}
                      onValueChange={(value) =>
                        setForm({ ...form, location_type: value })
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Offline">Offline</SelectItem>
                          <SelectItem value="Virtual">Virtual</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {form.location_type == "Offline" ? (
                    <input
                      type="text"
                      placeholder="Event location"
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      className="text-sm bg-transparent focus:outline-none"
                    />
                  ) : (
                    <input
                      type="url"
                      placeholder="Virtual link"
                      value={form.virtual_link}
                      onChange={(e) =>
                        setForm({ ...form, virtual_link: e.target.value })
                      }
                      className="text-sm bg-transparent focus:outline-none"
                    />
                  )}
                </div>
              </div>
              {/* Description */}
              <div
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm cursor-pointer "
                onClick={() => setDialogOpen(true)}
              >
                <div className="flex items-start justify-between mb-7 md:mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium block">
                      {form.description ? "Edit" : "Add"} Description
                    </span>
                    {form.description && (
                      <span>
                        <Edit3 className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <Button
                    size={"sm"}
                    variant={"secondary"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAiContent(true);
                    }}
                    className="border border-purple-900 bg-transparent flex items-center justify-center rounded-md"
                  >
                    <div
                      className="w-5 h-5 bg-purple-900 mask mask-center mask-no-repeat mask-contain"
                      style={{
                        maskImage: "url(/images/brand/ai.svg)",
                        WebkitMaskImage: "url(/images/brand/ai.svg)",
                      }}
                    ></div>
                    Generate with AI
                  </Button>
                </div>
                <div
                  className="w-full text-sm text-gray-600 dark:text-gray-300 line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html:
                      form.description || "Write something about you event...",
                  }}
                />
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all" />

                <DialogContent className="w-full h-[70vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>{id ? "Edit" : "Add"} Description</DialogTitle>
                  </DialogHeader>

                  <div className="flex-1 overflow-hidden">
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={form.description}
                      onChange={(_, editor) => {
                        const data = (editor as any).getData();
                        setForm({ ...form, description: data });
                      }}
                      config={{
                        licenseKey: "GPL",
                        ckfinder: {
                          uploadUrl: `${API_URL}/events/upload-event-image?token=${token}`,
                        },
                      }}
                    />
                  </div>

                  <DialogFooter>
                    <Button size={"sm"} onClick={() => setDialogOpen(false)}>
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Event Options */}
              <div className="space-y-4">
                <p className="text-sm font-medium mb-2">Event Options</p>
                {/* Tickets */}
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <Ticket className="h-4 w-4" />
                    <span className="text-sm font-medium">Tickets</span>
                  </div>
                  <Select
                    value={form.ticket_type}
                    onValueChange={(value) => {
                      setForm({ ...form, ticket_type: value });
                      if (value === "Paid") {
                        setForm((prev) => ({ ...prev, approval: false }));
                      }

                      if (value === "Paid") setIsPricingDialogOpen(true);
                    }}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <Dialog
                  open={isPricingDialogOpen}
                  onOpenChange={setIsPricingDialogOpen}
                >
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {ticketData.name
                          ? "Edit Ticket Pricing"
                          : "Add Ticket Pricing"}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          Ticket Name<span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          placeholder="Enter ticket name"
                          value={ticketData.name}
                          onChange={(e) =>
                            setTicketData({
                              ...ticketData,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Price<span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          placeholder="Enter ticket price"
                          value={ticketData.price}
                          onChange={(e) =>
                            setTicketData({
                              ...ticketData,
                              price: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Currency<span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={ticketData.currency}
                          onValueChange={(val) =>
                            setTicketData({ ...ticketData, currency: val })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="INR">₹ - INR</SelectItem>
                              <SelectItem value="USD">$ - USD</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Ticket Seats</Label>
                        <Input
                          type="number"
                          placeholder="Unlimited"
                          value={ticketData.slots ?? ""}
                          onChange={(e) =>
                            setTicketData({
                              ...ticketData,
                              slots: Number(e.target.value),
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Short Description</Label>
                        <Textarea
                          placeholder="Description (optional)"
                          className="resize-none"
                          rows={4}
                          value={ticketData.description}
                          onChange={(e) =>
                            setTicketData({
                              ...ticketData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Ticket Details</Label>
                        <div className="h-[25vh]">
                          <CKEditor
                            editor={ClassicEditor as any}
                            data={ticketData.ticket_details}
                            onChange={(_, editor) => {
                              const data = (editor as any).getData();
                              setTicketData({
                                ...ticketData,
                                ticket_details: data,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTicketData({
                            name: "",
                            price: "",
                            description: "",
                            currency: "INR",
                            slots: null,
                            ticket_details: "",
                            ticket_questions: [],
                          });
                          setIsPricingDialogOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSavePricing}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {form.ticket_type === "Paid" && (
                  <div className="mt-5 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTicketData({
                          name: "",
                          price: "",
                          description: "",
                          currency: "INR",
                          slots: null,
                          ticket_details: "",
                          ticket_questions: [],
                        });
                        setIsPricingDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mt-0.5" /> Add Ticket
                    </Button>
                  </div>
                )}

                {form.ticket_price.length > 0 && (
                  <Card className="mt-3 gap-4">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        Ticket Types:
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 mt-0 pt-0">
                      {form.ticket_price.map((ticket, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2"
                        >
                          <div>
                            <p className="font-medium text-sm">{ticket.name}</p>
                            <p className="text-xs text-gray-500">
                              {ticket.price} {ticket.currency}
                            </p>
                            {ticket.description && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {ticket.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTicket(idx)}
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteTicket(idx)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Capacity */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm flex justify-between items-center mt-2">
                    <div className="flex gap-3 items-center">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Capacity</span>
                    </div>
                    <input
                      type="number"
                      value={form.capacity ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, capacity: Number(e.target.value) })
                      }
                      className="text-sm text-gray-500 dark:text-gray-400 border rounded px-2 py-1 w-24 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Unlimited"
                    />
                  </div>

                  {/* Approval */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm flex justify-between items-center mt-2">
                    <div className="flex gap-3 items-center">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Require Approval
                      </span>
                    </div>
                    <button
                      disabled={form.ticket_type === "Paid"}
                      onClick={() =>
                        setForm({ ...form, approval: !form.approval })
                      }
                      className={`w-10 h-6 rounded-full transition relative ${
                        form.approval
                          ? "bg-black dark:bg-white"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-black rounded-full transition-transform ${
                          form.approval ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Public/Private */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Select
                    value={form.is_public ? "public" : "private"}
                    onValueChange={(value) =>
                      setForm({ ...form, is_public: value === "public" })
                    }
                  >
                    {/* CLOSED STATE → Only Public / Private */}
                    <SelectTrigger className="w-full bg-white flex items-center gap-2 h-14 !h-14 rounded-xl shadow-sm">
                      <SelectValue>
                        <div className="flex items-center gap-3 ">
                          {form.is_public ? (
                            <Globe className="text-gray-900" />
                          ) : (
                            <Lock size={18} />
                          )}
                          <span className="text-md font-medium">
                            {form.is_public ? "Public" : "Private"}
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {/* PUBLIC OPTION */}
                        <SelectItem value="public" className="py-2">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Globe size={20} />
                              <span>Public</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                              Your event is public and visible to everyone
                            </span>
                          </div>
                        </SelectItem>

                        {/* PRIVATE OPTION */}
                        <SelectItem value="private" className="py-2">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Lock size={18} />
                              <span>Private</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                              Your event is private and only visible to you
                            </span>
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {/* Color Picker */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl py-3.5 px-4 md:py-0 shadow-sm flex justify-between  items-center gap-3">
                    <div className="flex gap-3 items-center">
                      <Palette className="h-4 w-4" />
                      <span className="text-sm font-medium text-nowrap">
                        Brand Color
                      </span>
                    </div>

                    <div className="flex gap-3 items-center">
                      <span className="text-xs">{form.brand_color}</span>
                      <input
                        type="color"
                        value={form.brand_color}
                        onChange={(e) =>
                          setForm({ ...form, brand_color: e.target.value })
                        }
                        className="w-7 h-7 appearance-none cursor-pointer border-none p-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-6">
                  {/* SEO Keywords */}
                  <div className="bg-white space-y-3 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                    <Label>SEO Keywords</Label>

                    {/* Input State */}
                    <Input
                      type="text"
                      placeholder="Add a keyword and press Enter"
                      value={seoInput}
                      onChange={(e) => setSeoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();

                          const tag = seoInput.trim();
                          if (!tag) return;

                          const currentCharacters =
                            form.seo_keywords.join(", ").length;
                          const newTotal = currentCharacters + tag.length + 2; // +2 for ", "

                          if (newTotal > MAX_SEO_CHARACTERS) {
                            toast.error(
                              `SEO Keywords cannot exceed ${MAX_SEO_CHARACTERS} characters`,
                            );
                            return;
                          }

                          if (form.seo_keywords.includes(tag)) {
                            toast.error("Tag already exists");
                            return;
                          }

                          setForm({
                            ...form,
                            seo_keywords: [...form.seo_keywords, tag],
                          });

                          setSeoInput("");
                        }
                      }}
                    />

                    {/* Keywords List */}
                    {form.seo_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.seo_keywords.map((tag, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            <span>{tag}</span>

                            <button
                              type="button"
                              onClick={() => {
                                setForm({
                                  ...form,
                                  seo_keywords: form.seo_keywords.filter(
                                    (_, i) => i !== index,
                                  ),
                                });
                              }}
                              className="text-red-500 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Registration ques */}
                {/* <div className="grid grid-cols-1 gap-4 mt-6">
                  <EventQuestions
                    event_ques={form.registration_questions}
                    fetchEvent={fetchEvent}
                  />
                </div> */}
              </div>
            </div>
          </div>
          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <Button
              variant="outline"
              className="mr-4"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitted}>
              {id ? "Update" : "Create Event"}
            </Button>
          </div>
        </div>
      )}
      <AIContent
        isOpen={aiContent}
        onClose={() => setAiContent(false)}
        onInsert={handleAIInsert}
      />
    </>
  );
};

export default AddEvent;
