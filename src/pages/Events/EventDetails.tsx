import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Share2,
  Globe,
  Plus,
  Edit3,
  ScanLine,
  Ticket,
  Copy,
  UserX,
  UserCheck,
  Users,
  Download,
} from "lucide-react";
import {
  export_bookings,
  getBookingByTin,
  getBookingsForEvent,
  getEventById,
  guestAnalytics,
  updateBooking,
  updateEvent,
} from "../../services/services";
import { useParams, Link } from "react-router";
import { mediaUrl } from "../../constants";
import Loading from "../loading";
import { getAvatarColor } from "../../utils/avatarColor";
import RegistrationQuestions from "./RegistrationQuestions";
import moment from "moment";
import { HostForm } from "./HostForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";
import { AddGuestForm } from "./AddGuestForm";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import Pagination from "../../components/shared/Pagination";
import { Textarea } from "../../components/ui/textarea";

type IOrganizer = {
  name: string;
  profilePic?: string;
  picture: string;
};

type IGuest = {
  name: string;
  profilePic?: string;
  picture: string;
};

export interface EventDetails {
  _id: string;
  event_id: string;
  title: string;
  time: string;
  location: string;
  image?: string;
  description?: string;
  start_at: string;
  guests: IGuest[];
  organizer: IOrganizer;
  hosts: IOrganizer[];
  end_at: string;
  registration_questions: [];
  ticket_price: any[];
  approval: boolean;
  is_public: boolean;
  location_type: string;
  invite_link?: string;
  ticket_type: string;
  is_closed: string;
  seo_keywords?: string[];
  analytics_meta_tag: string;
}

// ScannerModal Component
interface ScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const ScannerModal: React.FC<ScannerProps> = ({ open, onClose, onScan }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded w-[350px]">
        <h3 className="text-lg font-semibold mb-4">Scan Guest QR</h3>
        <Scanner
          constraints={{ facingMode: "environment" }}
          onScan={(detectedCodes: IDetectedBarcode[]) => {
            if (detectedCodes.length > 0) {
              onScan(detectedCodes[0].rawValue);
              onClose();
            }
          }}
          onError={(err: unknown) => console.error(err)}
        />
        <button
          onClick={onClose}
          className="mt-4 w-full bg-purple-700 text-white p-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetails>();
  const [loading, setLoading] = useState(true);
  const [addHost, setAddHost] = useState(false);
  const [addGuest, setAddGuest] = useState(false);

  const [bookings, setBookings] = useState<any>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [openGuestDialog, setOpenGuestDialog] = useState(false);

  const [search, setsearch] = useState<string>("");
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  // New state to control QR scanner modal
  const [scannerOpen, setScannerOpen] = useState(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketUser, setTicketUser] = useState<any>(null);

  // Booking pagination
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [metaAnalyticsTag, setMetaAnalyticsTag] = useState(
    event?.analytics_meta_tag || "",
  );
  const [save, setSave] = useState(false);

  // Function to handle scanned data
  const handleScan = async (data: string) => {
    try {
      const res = await getBookingByTin(data);
      console.log("handleScan ...", res);

      if (res.data.status) {
        const booking = res.data.response;
        if (booking?.is_checked_in) {
          toast.success(
            `${booking?.user?.name} already checked in at ${moment(booking?.updatedAt).format("Do MMM h:mm A")}`,
          );
          return;
        }
        if (!booking.is_approved) {
          setTicketDialogOpen(true);
          setTicketUser(booking);
          return;
        }
        try {
          const updateRes = await updateBooking(booking?._id, {
            is_checked_in: true,
          });

          console.log("updateRes ===>", updateRes);

          if (updateRes.data.status) {
            setTicketDialogOpen(true);
            setTicketUser(booking);
            fetchBookings();
            setScannerOpen(false);
          }
        } catch (error) {
          console.log(error);
          toast.error("Can't check in user");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Can't check in user");
    }
  };

  const fetchEvent = async () => {
    if (!id) return;
    try {
      const res = await getEventById(id);
      if (res.data.status && res.data.response) {
        setEvent(res.data.response);
      }
    } catch (error) {
      console.error("Failed to fetch event:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdateEvent = async () => {
    if (!id) return;
    if (!event) return;
    const payload = {
      is_public: !event.is_public, // toggle ✔
    };
    try {
      const res = await updateEvent(id, payload);
      if (res.data.status) {
        setEvent((prev) =>
          prev ? { ...prev, is_public: !prev.is_public } : prev,
        );
        toast.success(
          `Event changes to ${res.data.response.is_public ? "public" : "private"
          }`,
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await export_bookings(
        { event_id: event?._id },
        { responseType: "blob" },
      );

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${event?.title || "event"}-guests.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Guest list exported successfully");
    } catch (error) {
      console.error(error);
      toast.error("Export failed");
    }
  };

  const fetchBookings = async () => {
    const payload = {
      event: event?._id,
      status: "Booked",
      limit,
      page,
      search,
    };
    try {
      const res = await getBookingsForEvent(payload);
      // console.log(res);
      if (res.data.status) {
        const data = res.data.response.bookings;
        setBookings(data);
        setTotalPages(res.data.response.totalPages);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await guestAnalytics({ eventId: event?._id });
      if (res.data.status) {
        setAnalytics(res.data.response);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBookingUpdate = async (id: string, checkIn: boolean) => {
    if (!selectedGuest.is_approved) {
      toast.error("Can't check in. Guest is not approved");
      return;
    }
    const payload = {
      is_checked_in: checkIn,
    };
    try {
      const res = await updateBooking(id, payload);
      if (res.data.status) {
        toast.success(`${checkIn ? "Check in" : "Remove Check in"}`);
        fetchBookings();
        setOpenGuestDialog(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Can't check in user");
    }
  };

  const handleApproval = async (
    id: string,
    is_approved: boolean,
    is_checked_in: boolean,
    ticket_type: string,
  ) => {
    if (is_checked_in || ticket_type == "Paid") return;
    const payload = {
      is_approved,
    };
    try {
      const res = await updateBooking(id, payload);
      if (res.data.status) {
        toast.success(`${is_approved ? "Approved" : "Approval Removed"}`);
        fetchBookings();
      }
    } catch (error) {
      console.log(error);
      toast.error("Server error, please try again later.");
    }
  };

  const handleMetaTagUpdate = async () => {
    setSave(true);
    try {
      const res = await updateEvent(id!, {
        analytics_meta_tag: metaAnalyticsTag,
      });
      if (res.data.status) {
        toast.success("Meta tag updated successfully");
        fetchEvent();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update meta tag");
    } finally {
      setSave(false);
    }
  };

  const handleShare = () => {
    const link = `${window.location.origin}/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied");
    return link;
  };

  // Share handlers
  const eventUrl = `${window.location.origin}/${id}`;

  const shareOnFacebook = (eventUrl: string) => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        eventUrl,
      )}`,
      "_blank",
    );
  };

  const shareOnTwitter = (eventUrl: string, title: string) => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        eventUrl,
      )}&text=${encodeURIComponent(title)}`,
      "_blank",
    );
  };

  const shareOnLinkedIn = (eventUrl: string) => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        eventUrl,
      )}`,
      "_blank",
    );
  };

  const shareOnWhatsApp = (eventUrl: string, title: string) => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        title + " " + eventUrl,
      )}`,
      "_blank",
    );
  };

  // Close event

  const isEventClosed = event?.is_closed == "closed";

  const handleToggleEventStatus = async () => {
    if (!id) return;

    const payload = {
      is_closed: isEventClosed ? "open" : "closed",
    };

    try {
      const res = await updateEvent(id, payload);
      if (res.data.status) {
        toast.success(
          `Event ${isEventClosed ? "re-opened" : "closed"} successfully`,
        );
        setCloseDialogOpen(false);
        fetchEvent();
      } else {
        toast.error("Action failed, try again");
      }
    } catch (error) {
      console.error(error);
      toast.error("Action failed, try again");
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (event?._id) {
      fetchAnalytics();
    }
  }, [event]);

  useEffect(() => {
    if (event?.analytics_meta_tag) {
      setMetaAnalyticsTag(event.analytics_meta_tag);
    }
  }, [event]);

  useEffect(() => {
    if (event?._id) {
      if (search.length === 0 || search.length >= 3) {
        fetchBookings();
      }
    }
  }, [event, limit, page, search]);

  if (loading) {
    return <Loading />;
  }

  if (!event) {
    return (
      <div className="h-[70vh] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/event-buddi-whitelogo.png"
            alt="bg"
            className="h-30 w-30"
          />
          <p className="font-normal text-lg">Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-3 text-nowrap">
              {/* Share Event */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-sm bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                    <Share2 size={18} /> Share Event
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share link</DialogTitle>
                    <DialogDescription>
                      Anyone who has this link will be able to view this.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="items-center space-x-2">
                    <div className="flex gap-2">
                      <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                          Link
                        </Label>
                        <Input
                          id="link"
                          value={`${window.location.origin}/${id}`}
                          readOnly
                        />
                      </div>
                      <DialogClose asChild>
                        <Button
                          type="submit"
                          size="sm"
                          className="px-3"
                          onClick={() => {
                            handleShare();
                          }}
                        >
                          <span className="sr-only">Copy</span>
                          <Copy />
                        </Button>
                      </DialogClose>
                    </div>
                    <DialogFooter>
                      <div className="flex items-center order-2 gap-4 grow xl:order-3 pt-5">
                        <button
                          onClick={() => shareOnFacebook(eventUrl)}
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                        >
                          <img src="/images/brand/facebook.svg" />
                        </button>

                        {/* WHATSAPP */}
                        <button
                          onClick={() =>
                            shareOnWhatsApp(eventUrl, event?.title)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                        >
                          <img src="/images/brand/whatsapp.svg" />
                        </button>

                        {/* LINKEDIN */}
                        <button
                          onClick={() => shareOnLinkedIn(eventUrl)}
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                        >
                          <img src="/images/brand/linkedin.svg" />
                        </button>

                        {/* TWITTER */}
                        <button
                          onClick={() => shareOnTwitter(eventUrl, event?.title)}
                          className="flex h-7 w-7 items-center justify-center rounded-full"
                        >
                          <img src="/images/brand/twitter.svg" />
                        </button>
                      </div>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
              <a
                href={`/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 text-sm dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <Globe size={18} /> Go to Event
              </a>
            </div>

            <Link to={`/creator/events/add/${event.event_id}`}>
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Event Info Card */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Left: Event Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 flex flex-col md:flex-row gap-4">
            <img
              src={
                event.image
                  ? `${mediaUrl}/event_images/${event.image}`
                  : "/event-buddi-whitelogo.png"
              }
              alt={event.title}
              className="w-full md:w-40 h-full rounded-lg object-cover"
            />
            <div className="flex flex-col flex-1">
              <div>
                <h2 className="text-lg font-semibold mb-1">{event.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {new Date(event.start_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm mt-2 text-gray-400">
                  {event.approval
                    ? "Approval Required — Registration needs host approval."
                    : "Open Event — Anyone can join."}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Time & Location */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-900 text-white shadow-md">
                <Calendar size={16} />
              </div>
              <div className="flex items-center">
                <p className="text-sm text-gray-500 dark:text-white">
                  {event.start_at && (
                    <div className="flex flex-col">
                      {moment(event.start_at).format("DD MMM, YYYY") ===
                        moment(event.end_at).format("DD MMM, YYYY") ? (
                        <span className="text-sm font-normal">
                          {moment(event.start_at).format("dddd, DD MMM YYYY")}
                        </span>
                      ) : (
                        <span className="text-sm font-normal">
                          {moment(event.start_at).format("DD MMM, YYYY")} –{" "}
                          {moment(event.end_at).format("DD MMM, YYYY")}
                        </span>
                      )}

                      <span className="text-sm text-gray-500">
                        {moment(event.start_at).format("hh:mm A")}
                        {event.end_at &&
                          ` – ${moment(event.end_at).format("hh:mm A")}`}
                      </span>
                    </div>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-900 text-white shadow-md">
                <MapPin size={16} />
              </div>
              <p className="flex text-sm text-gray-500 dark:text-gray-400 flex-1 break-words ">
                {event.location || event.location_type}
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3 pt-2">
              <Button
                onClick={() => setScannerOpen(true)}
                className="w-full md:w-auto"
              >
                <ScanLine className="h-5 w-5" /> Check In Guests
              </Button>
            </div>
          </div>
        </div>

        {/* Hosts */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 md:col-span-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">Hosts</h2>
              <Button
                onClick={() => setAddHost(true)}
                size={"sm"}
                variant={"secondary"}
                className="border"
              >
                <Plus size={16} /> Add Host
              </Button>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex justify-between items-center">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {event.organizer.profilePic || event.organizer?.picture ? (
                    <img
                      src={`${event.organizer.profilePic
                          ? `${mediaUrl}/user_profile_pics/${event.organizer.profilePic}`
                          : event.organizer.picture
                        } `}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                        event.organizer.name || "",
                      )}`}
                    >
                      {event.organizer?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="font-medium">{event.organizer?.name}</p>
                </div>
                {event.hosts.length !== 0 && (
                  <>
                    {event.hosts.map((host: any) => (
                      <div key={host._id} className="flex items-center gap-3">
                        {host.profilePic ? (
                          <img
                            src={`${host.profilePic
                                ? `${mediaUrl}/user_profile_pics/${host.profilePic}`
                                : host.picture
                              } `}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                              host.name || "",
                            )}`}
                          >
                            {host?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="font-medium">{host?.name}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Analytics */}
            <div className="mt-8">
              <h2 className="font-semibold text-lg mb-3">Event Analytics</h2>

              {/* Single Card with All Metrics */}
              <Card className="mb-6">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Guest Overview
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Total Guests */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>Total Guests</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {analytics?.totalGuests || 0}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                        <span>Approved Guests</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-500">
                        {analytics?.approvedGuests || 0}
                      </div>
                    </div>

                    {/* Checked In */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-green-600" />
                        <span>Checked In</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {analytics?.checkedInGuests || 0}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          (
                          {analytics?.totalGuests > 0
                            ? Math.round(
                              (analytics?.checkedInGuests /
                                analytics?.totalGuests) *
                              100,
                            )
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>

                    {/* Not Checked In */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                        <UserX className="h-3.5 w-3.5 text-red-600" />
                        <span>Not Checked In</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {analytics?.notCheckedInGuests || 0}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          (
                          {analytics?.totalGuests > 0
                            ? Math.round(
                              (analytics?.notCheckedInGuests /
                                analytics?.totalGuests) *
                              100,
                            )
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Guests */}
          <div className="col-span-12 md:col-span-8">
            <div className="flex justify-between items-center flex-wrap gap-3 mb-3">
              <h2 className="font-semibold text-lg">Guests</h2>

              {/* Here input+search */}
              <div className="flex gap-4 items-center">
                <div>
                  <Input
                    type="search"
                    placeholder="Search guest..."
                    className="bg-white p-0 px-2.5"
                    value={search}
                    onChange={(e) => setsearch(e.target.value)}
                  />
                </div>

                <Button
                  onClick={() => setAddGuest(true)}
                  size={"sm"}
                  variant={"secondary"}
                  className="border"
                >
                  <Plus size={16} /> Add Guest
                </Button>
                <div className="flex justify-end">
                  <Button onClick={handleExportCSV} size={"sm"}>
                    <Download /> Export
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="bg-white max-h-[50vh] no-scrollbar overflow-y-auto text-gray-50 text-sm">
                {bookings.length === 0 ? (
                  <p className="text-black text-center">No guest invited</p>
                ) : (
                  <>
                    <Table>
                      <TableHeader className="bg-gray-100">
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Checked In</TableHead>
                          <TableHead>Approved</TableHead>
                          <TableHead>Ticket</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((bk: any) => (
                          <TableRow
                            key={bk?._id}
                            className="cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                            onClick={() => {
                              setSelectedGuest(bk);
                              setOpenGuestDialog(true);
                            }}
                          >
                            {/* LEFT SIDE: Avatar + Name */}
                            <TableCell className="flex items-center gap-3">
                              <p className="font-medium text-gray-800 dark:text-gray-200 mt-1.5">
                                {bk?.user?.name}
                              </p>
                            </TableCell>

                            <TableCell className="w-full sm:w-[120px]">
                              {bk?.is_checked_in && (
                                <Badge className="bg-green-200 text-xs text-green-700">
                                  Checked in
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell
                              className="text-center w-full sm:w-[60px] "
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproval(
                                  bk?._id,
                                  !bk?.is_approved,
                                  bk.is_checked_in,
                                  event.ticket_type,
                                );
                              }}
                            >
                              <Checkbox
                                disabled={event.ticket_type == "Paid"}
                                checked={bk?.is_approved}
                                className={` data-[state=checked]:bg-green-500  data-[state=checked]:border-green-500   data-[state=checked]:text-white rounded-md border-gray-600`}
                              />
                            </TableCell>

                            <TableCell className="w-[50px]">
                              <Link
                                to={`/ticket/${id}?t=${bk?.tin}`}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()} // prevent row click
                                className="flex items-center icon_bg text-purple-600 dark:text-purple-400 hover:text-purple-700"
                              >
                                <Ticket className="h-5 w-5" />
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </div>
              <div className="mt-4">
                <Pagination
                  page={page}
                  limit={limit}
                  onLimitChange={(val) => setLimit(Number(val))}
                  onPageChange={(val) => setPage(val)}
                  totalPages={totalPages}
                />
              </div>
            </div>
          </div>

          {/* Guest Check in dialog */}
          <Dialog open={openGuestDialog} onOpenChange={setOpenGuestDialog}>
            <DialogContent className="">
              {selectedGuest && (
                <div className="space-y-4">
                  {/* USER INFO */}
                  <div className="flex items-center gap-3 border-b pb-3">
                    {selectedGuest.user.profilePic ||
                      selectedGuest.user?.picture ? (
                      <img
                        src={`${selectedGuest?.user?.profilePic
                            ? `${mediaUrl}/user_profile_pics/${selectedGuest.user.profilePic}`
                            : selectedGuest.user?.picture
                          }`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                          selectedGuest.user.name || "",
                        )}`}
                      >
                        {selectedGuest.user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                        {selectedGuest.user.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedGuest.user.email}
                      </p>
                    </div>
                  </div>

                  {/* QUESTIONS + ANSWERS */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">
                      Registration Questions
                    </h4>
                    <div className="space-y-3 bg-gray-50 p-3 rounded-md border">
                      {selectedGuest.registration_answers?.length > 0 ? (
                        selectedGuest.registration_answers.map((qa: any) => (
                          <div
                            key={qa._id}
                            className="flex flex-col border-b last:border-b-0 pb-2 last:pb-0"
                          >
                            <span className="text-sm font-semibold text-gray-800">
                              {qa.ques}
                            </span>
                            <span className="text-sm text-gray-600 break-all">
                              {qa.answer}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No answers provided.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* REGISTERED DATE */}
                  <div className="pt-2 border-t text-sm text-gray-600">
                    <span className="font-semibold text-md">
                      {" "}
                      Registered on:
                    </span>{" "}
                    {moment(selectedGuest.createdAt).format(
                      "DD MMM, YYYY • hh:mm A",
                    )}
                  </div>

                  {/* BUTTONS */}
                  <DialogFooter>
                    {!selectedGuest.is_checked_in ? (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          handleBookingUpdate(selectedGuest._id, true)
                        }
                      >
                        Check In
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() =>
                          handleBookingUpdate(selectedGuest._id, false)
                        }
                      >
                        Undo Check In
                      </Button>
                    )}
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Visibility & Discovery */}
        <div className="mb-10">
          <h2 className="font-semibold text-lg mb-3">Visibility & Discovery</h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 sm:text-nowrap">
                <Globe className="h-4 w-4 mr-1" />
                {event.is_public ? "Public" : "Private"} — This event is{" "}
                {event.is_public ? "listed" : "not listed"} on your profile.
              </p>

              <div className="flex gap-2 items-end justify-end w-full">
                <button
                  onClick={() => fetchUpdateEvent()}
                  className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Change Visibility
                </button>
              </div>
            </div>
          </div>
        </div>



        {/* Registration */}
        <RegistrationQuestions
          event_ques={event.registration_questions}
          fetchEvent={fetchEvent}
        />

        {/* SEO Keywords */}
        {event?.seo_keywords && event.seo_keywords.length > 0 && (
          <div className="mb-10">
            <h2 className="font-semibold text-lg mb-3">SEO Keywords</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              {event?.seo_keywords && event.seo_keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.seo_keywords.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs"
                    >
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Meta Tag */}
        <div className="mb-10">
          <h2 className="font-semibold text-lg mb-3">Analytics Script Tags</h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <Textarea
              value={metaAnalyticsTag}
              onChange={(e) => setMetaAnalyticsTag(e.target.value)}
              rows={10}
            />
            <div className="mt-4 flex justify-end">
              <Button size={"sm"} onClick={handleMetaTagUpdate} disabled={save}>
                {save ? "Updating..." : "Update Script"}
              </Button>
            </div>
          </div>
        </div>

        {/* Toggle open/close event */}
        <div className="flex items-center justify-center w-full">
          <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant={isEventClosed ? "success" : "destructive"}
                onClick={() => setCloseDialogOpen(true)}
              >
                {isEventClosed ? "Re-open Event" : "Close Event"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEventClosed ? "Re-open Event" : "Close Event"}
                </DialogTitle>

                <p>
                  Are you sure you want to {isEventClosed ? "re-open" : "close"}{" "}
                  <b>{event.title}</b>?
                </p>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  size={"sm"}
                  variant="outline"
                  onClick={() => setCloseDialogOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  variant={isEventClosed ? "success" : "destructive"}
                  onClick={handleToggleEventStatus}
                  size="sm"
                >
                  {isEventClosed ? "Confirm Re-open" : "Confirm Close"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Add Host */}
      <HostForm
        isOpen={addHost}
        onClose={() => setAddHost(false)}
        event_id={event._id}
        fetchEvent={fetchEvent}
      />

      {/* QR Scanner Modal */}
      <ScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />

      {/* Add Guest */}
      <AddGuestForm
        isOpen={addGuest}
        onClose={() => setAddGuest(false)}
        event={event}
        fetchEvent={fetchEvent}
        ticket_price={event?.ticket_price}
      />

      {/* Scanner Ticket dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="flex flex-col items-center text-center">
          {ticketUser?.is_approved === true && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <p className="text-gray-600 mt-2 text-md font-semibold flex flex-col">
                {ticketUser?.user?.name}
                <span className="text-gray-500 text-sm font-normal">
                  {ticketUser?.user?.email}
                </span>
              </p>

              {ticketUser?.ticket_info && (
                <p className="text-gray-500 text-md font-semibold">
                  Ticket: {ticketUser?.ticket_info?.name}
                </p>
              )}

              {ticketUser?.meta && (
                <div className="flex items-center gap-4 mt-1">
                  {ticketUser?.meta?.ticket_type && (
                    <p className="text-gray-500 text-sm font-semibold">
                      Type: {ticketUser?.meta?.ticket_type}
                    </p>
                  )}

                  {ticketUser?.meta?.guest_count && (
                    <p className="text-gray-500 text-sm font-semibold ps-4 border-s-2 border-gray-400">
                      Guest Count: {ticketUser?.meta?.guest_count}
                    </p>
                  )}
                </div>
              )}

              {!ticketUser?.meta &&
                ticketUser?.registration_answers.length > 0 && (
                  <div>
                    {ticketUser.registration_answers.map((qa: any) => (
                      <div
                        key={qa._id}
                        className="flex flex-col border-b last:border-b-0 pb-2 last:pb-0"
                      >
                        <span className="text-sm font-semibold text-gray-800">
                          {qa.ques}
                        </span>
                        <span className="text-sm text-gray-600 break-all">
                          {qa.answer}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              <h2 className="text-md text-green-600">Check-In Successful</h2>
            </>
          )}

          {ticketUser?.is_approved === false && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <p className="text-gray-600 mt-2 text-xl font-semibold">
                {ticketUser?.user?.name}
              </p>

              <h2 className="text-md  mt-3 text-red-600">Not Approved</h2>
            </>
          )}

          <Button
            className="bg-purple-900 text-white"
            onClick={() => setTicketDialogOpen(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventDetails;
