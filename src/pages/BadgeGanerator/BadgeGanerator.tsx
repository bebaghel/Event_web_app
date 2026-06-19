import { useRef, useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import TemplateSettings from "./TemplateSetting";
import BadgePreview from "./BadgePreview";
import template1 from "/images/assets/template1.jpg";
import template2 from "/images/assets/template2.jpg";
import template3 from "/images/assets/template3.jpg";
import template4 from "/images/assets/template4.jpg";
import template5 from "/images/assets/template5.jpg";
import template6 from "/images/assets/template6.jpg";
import template7 from "/images/assets/template7.jpg";
import { Label } from "../../components/ui/label";
import {
  getAllBooking,
  getBadgeTemplates,
  getEventsWithLessData,
  saveBadgeTemplate,
} from "../../services/services";
import { toast } from "sonner";
import { mediaUrl } from "../../constants";
// import QRCode from "react-qr-code";

const PREVIEW_W = 340;
const PREVIEW_H = 567;
const BADGE_W_MM = 90;
const BADGE_H_MM = 150;

export interface TemplateElement {
  id: string;
  label: string;
  text?: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  align?: "left" | "center" | "right";
  resizeMode?: "auto" | "fixed";
  isCustom?: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontFamily?: string;
  width?: number;
  borderRadius?: number;
  backgroundColor?: string;
  enabled?: boolean;
  logoSrc?: string;
}

const defaultElements: TemplateElement[] = [
  {
    id: "eventTitle",
    label: "Event Title",
    x: PREVIEW_W / 2,
    y: 170,
    color: "#000000",
    align: "center",
    fontSize: 16,
    isCustom: false,
    enabled: true,
  },
  {
    id: "name",
    label: "Name",
    text: "Name",
    x: PREVIEW_W / 2,
    y: 410,
    color: "#000000",
    fontSize: 15,
    isCustom: false,
    enabled: true,
  },
  {
    id: "delegates",
    label: "Ticket Name",
    text: "Delegates",
    x: PREVIEW_W / 2,
    y: 435,
    color: "#777777",
    fontSize: 12,
    isCustom: false,
    enabled: true,
  },
  {
    id: "qr",
    label: "QR Code",
    text: "QR",
    x: PREVIEW_W / 2,
    y: 235,
    color: "#000000",
    fontSize: 140,
    isCustom: false,
    enabled: true,
  },
  {
    id: "logo",
    label: "Logo",
    text: "Logo",
    logoSrc: "",
    x: PREVIEW_W / 2,
    y: 70,
    color: "#000000",
    fontSize: 80,
    isCustom: false,
    borderRadius: 50,
    enabled: true,
  },
];

const BadgeGenerator = () => {
  const previewRef = useRef<HTMLDivElement>(null);
  /* ---------------- STATE ---------------- */
  const [selectedTemplateId, setSelectedTemplateId] = useState("t1");
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [showBgInfoModal, setShowBgInfoModal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [qrValue, setQrValue] = useState("1234567890");

  const [savedTemplates, setSavedTemplates] = useState<
    {
      _id: string;
      id: string;
      src: string;
      background: string;
      elements: TemplateElement[];
      name?: string;
    }[]
  >([]);
  const [events, setEvents] = useState<any>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [uploadedBgFile, setUploadedBgFile] = useState<File | null>(null);
  const [uploadedBgSrc, setUploadedBgSrc] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const [loading, setLoading] = useState(false);

  const templates = [
    { id: "t1", src: template1 },
    { id: "t2", src: template2 },
    { id: "t3", src: template3 },
    { id: "t4", src: template4 },
    { id: "t5", src: template5 },
    { id: "t6", src: template6 },
    { id: "t7", src: template7 },
  ];

  const mainTemplates = templates.slice(0, 3);
  const moreTemplates = templates.slice(3);

  /* ---------------- ELEMENTS ---------------- */
  const [elements, setElements] = useState<TemplateElement[]>(
    defaultElements.map((el) => ({ ...el, text: el.text || "" })),
  );

  /* ---------------- API & EFFECTS ---------------- */
  const fetchEvents = async () => {
    const payload = { organizer: user?._id };
    try {
      const res = await getEventsWithLessData(payload);
      if (res.data.status) {
        setEvents(res.data.response);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  };

  const loadSavedTemplates = async () => {
    try {
      const res = await getBadgeTemplates(); // No event param needed if fetching all
      const validSaved = (res.data.response || []).map((t: any) => ({
        ...t,
        elements: t.elements.map((el: any) => ({
          ...el,
          text:
            el.id === "name"
              ? "John Doe"
              : el.id === "delegates"
                ? "Ticket Name"
                : el.id === "eventTitle"
                  ? "Sample Event"
                  : el.id === "qr"
                    ? "QR"
                    : el.id === "logo"
                      ? "Logo"
                      : el.text,
        })),
      }));
      setSavedTemplates(validSaved);
    } catch (error) {
      console.error("Failed to load saved templates:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    loadSavedTemplates();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      setElements((prev) =>
        prev.map((el) =>
          el.id === "eventTitle"
            ? { ...el, text: selectedEvent.title || "Event Title" }
            : el,
        ),
      );
    } else {
      setElements((prev) =>
        prev.map((el) => {
          if (el.id === "eventTitle")
            return { ...el, text: "Sample Event 2025" };
          if (el.id === "name") return { ...el, text: "John Doe" };
          if (el.id === "delegates") return { ...el, text: "Ticket Name" };
          return el;
        }),
      );
    }
  }, [selectedEvent]);

  /* ---------------- HANDLERS ---------------- */
  const handleTemplateSelect = (id: string) => {
    const saved = savedTemplates.find((t) => t._id === id || t.id === id);
    if (saved) {
      // Load saved elements with correct logoSrc
      const loadedElements = saved.elements.map((el: TemplateElement) => ({
        ...el,
        logoSrc: el.logoSrc ? el.logoSrc : "", // Ensure logoSrc present
        text:
          el.id === "name"
            ? "John Doe"
            : el.id === "delegates"
              ? "Ticket Name"
              : el.id === "eventTitle"
                ? selectedEvent?.title || "Sample Event"
                : el.id === "qr"
                  ? "QR"
                  : el.id === "logo"
                    ? "Logo"
                    : el.text,
      }));

      setElements(loadedElements);
      setSelectedTemplateId(saved._id || saved.id);
      setUploadedBgSrc(`${mediaUrl}/badge_images/${saved.background}`);
      setLogoFile(null); // Clear current upload since we're loading saved
      setShowMoreModal(false);
    } else {
      // Static template logic same
      const template = templates.find((t) => t.id === id);
      if (template) {
        setSelectedTemplateId(id);
        setUploadedBgSrc("");
        setElements(
          defaultElements.map((el) => ({
            ...el,
            text: el.text || selectedEvent?.title || "",
          })),
        );
        setShowMoreModal(false);
      }
    }
  };

  const handleUploadTemplate = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedBgFile(file);
    setUploadedBgSrc(url);
    setSelectedTemplateId("uploaded");
  };

  const handleUploadLogo = (file?: File) => {
    if (!file) return;
    setLogoFile(file);
  };

  const addElement = () => {
    const id = Date.now().toString();
    setElements((prev) => [
      ...prev,
      {
        id,
        label: "Custom",
        text: "New Text",
        x: PREVIEW_W / 2,
        y: 40,
        color: "#000",
        fontSize: 14,
        isCustom: true,
      },
    ]);
    setActiveId(id);
  };

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const saveTemplate = async () => {
    if (!selectedEvent) {
      alert("Please select an event");
      return;
    }

    const formData = new FormData();
    formData.append("event", selectedEvent._id);
    formData.append("name", `Badge Template - ${selectedEvent.title}`);
    formData.append("elements", JSON.stringify(elements));

    // Background
    let bgFile: File | null = null;
    if (selectedTemplateId === "uploaded" && uploadedBgFile) {
      bgFile = uploadedBgFile;
    } else {
      const currentTemplate = getCurrentTemplate();
      if (currentTemplate.src) {
        const response = await fetch(currentTemplate.src);
        const blob = await response.blob();
        bgFile = new File([blob], `bg-${selectedTemplateId}.jpg`, {
          type: "image/jpeg",
        });
      }
    }
    if (bgFile) formData.append("background", bgFile);

    // Logo – simple direct append (just like background)
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    try {
      const res = await saveBadgeTemplate(formData);
      if (res.data.status) {
        toast.success(res.data.message);
        loadSavedTemplates();
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save template");
    }
  };

  const getCurrentTemplate = () => {
    if (selectedTemplateId === "uploaded") {
      return { id: "uploaded", src: uploadedBgSrc };
    }
    if (
      selectedTemplateId.startsWith("saved-") ||
      selectedTemplateId.length > 10
    ) {
      // saved template ID long hota hai
      const saved = savedTemplates.find((t) => t._id === selectedTemplateId);
      return saved
        ? { id: saved._id, src: `${mediaUrl}/badge_images/${saved.background}` }
        : templates[0];
    }
    const template = templates.find((t) => t.id === selectedTemplateId);
    return template || templates[0];
  };

  const downloadPdf = async (
    replaceText: (el: HTMLElement) => Promise<void>,
    file: string,
    pdfInstance?: jsPDF,
  ) => {
    const preview = previewRef.current;
    if (!preview) return;

    const clone = preview.cloneNode(true) as HTMLElement;
    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    document.body.appendChild(clone);

    // Remove resize handles and borders
    clone
      .querySelectorAll("[data-resize-handle='true']")
      .forEach((n) => n.remove());
    clone.querySelectorAll("[data-el-id]").forEach((n) => {
      (n as HTMLElement).style.border = "none";
      (n as HTMLElement).style.background = "transparent";
    });

    for (const el of Array.from(clone.querySelectorAll("*"))) {
      await replaceText(el as HTMLElement);
    }

    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });
    const pdf =
      pdfInstance ||
      new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [BADGE_W_MM, BADGE_H_MM],
      });

    pdf.addImage(
      canvas.toDataURL("image/jpeg"),
      "JPEG",
      0,
      0,
      BADGE_W_MM,
      BADGE_H_MM,
    );

    clone.remove();
    if (!pdfInstance) pdf.save(file);
  };

  const downloadSampleBadge = () =>
    downloadPdf(async (el) => {
      if (el.innerText === "Name") el.innerText = "John Doe";
      if (el.innerText === "Event Title")
        el.innerText = selectedEvent?.title || "Sample Event 2025";
      if (el.innerText === "Delegates") el.innerText = "sample@example.com";
    }, "sample-badge.pdf");

  const downloadAllBadges = async () => {
    if (!selectedEvent?._id) {
      toast.error("Please select an event");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        event: selectedEvent._id,
        status: "Booked",
      };
      const res = await getAllBooking(payload);

      if (!res.data.status) {
        toast.error("Failed to fetch bookings");
        return;
      }

      const freshBookings = res.data.response.bookings || [];

      if (freshBookings.length === 0) {
        toast.error("No guests found for this event");
        setLoading(false);
        return;
      }

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [BADGE_W_MM, BADGE_H_MM],
      });

      for (let i = 0; i < freshBookings.length; i++) {
        const booking = freshBookings[i];

        setQrValue(booking?.tin);

        await downloadPdf(
          async (el) => {
            // NAME
            if (el.dataset?.elId === "name") {
              el.innerText = booking.user?.name || "Guest";
            }

            // EVENT TITLE
            if (el.dataset?.elId === "eventTitle") {
              el.innerText = selectedEvent.title;
            }

            // DELEGATES
            if (el.dataset?.elId === "delegates") {
              el.innerText =
                selectedEvent.ticket_type === "Free"
                  ? ""
                  : booking.ticket_info?.name || "";
            }

            // if (el.dataset?.elId === "qr") {
            //   const qrContainer = el.querySelector("[data-qr-container]");
            //   if (qrContainer) {
            //     const tinValue = booking.tin;
            //     <QRCode value={tinValue} />;
            //   }
            // }
          },
          "temp.pdf",
          pdf,
        );

        if (i < freshBookings.length - 1) pdf.addPage();
      }

      pdf.save(`${selectedEvent.title}-badges.pdf`);
    } catch (error) {
      console.error("Error generating badges:", error);
      toast.error("Something went wrong while generating badges");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 md:col-span-6">
        <div className="mb-4 space-y-2">
          <Label>Event</Label>
          <Select
            value={selectedEvent?._id || ""}
            onValueChange={(val) => {
              const ev = events.find((e: any) => e._id === val);
              setSelectedEvent(ev);
            }}
          >
            <SelectTrigger className="bg-white w-full md:w-[250px]">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((ev: any) => (
                <SelectItem key={ev._id} value={ev._id}>
                  {ev.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <TemplateSettings
          mainTemplates={mainTemplates}
          moreTemplates={moreTemplates}
          savedTemplates={savedTemplates}
          selectedTemplateId={selectedTemplateId}
          setSelectedTemplateId={setSelectedTemplateId}
          handleTemplateSelect={handleTemplateSelect}
          showMoreModal={showMoreModal}
          setShowMoreModal={setShowMoreModal}
          showBgInfoModal={showBgInfoModal}
          setShowBgInfoModal={setShowBgInfoModal}
          handleUploadTemplate={handleUploadTemplate}
          handleUploadLogo={handleUploadLogo}
          PREVIEW_W={PREVIEW_W}
          PREVIEW_H={PREVIEW_H}
          BADGE_W_MM={BADGE_W_MM}
          BADGE_H_MM={BADGE_H_MM}
          elements={elements}
          activeId={activeId}
          setActiveId={setActiveId}
          setElements={setElements}
          addElement={addElement}
          removeElement={removeElement}
          downloadAllBadges={downloadAllBadges}
          saveTemplate={saveTemplate}
          selectedEvent={selectedEvent}
        />
      </div>
      <div className="col-span-12 md:col-span-6">
        <BadgePreview
          ref={previewRef}
          elements={elements}
          setElements={setElements}
          activeId={activeId}
          setActiveId={setActiveId}
          template={getCurrentTemplate()}
          logoFile={logoFile}
          downloadSampleBadge={downloadSampleBadge}
          downloadAllBadges={downloadAllBadges}
          loading={loading}
          qrValue={qrValue}
        />
      </div>
    </div>
  );
};

export default BadgeGenerator;
