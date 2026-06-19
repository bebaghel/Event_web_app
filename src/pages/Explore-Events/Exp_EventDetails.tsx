import { Calendar, Check, Globe, MapPin, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button/Button";
import { useState, useEffect } from "react";
import {
  IEventQuestion,
  RegistrationForm,
} from "../Registration/RegistrationForm";
import { getEventById } from "../../services/services";
import { mediaUrl } from "../../constants";
import { Link, Navigate, useParams } from "react-router";
import { getAvatarColor } from "../../utils/avatarColor";
import Loading from "../loading";

import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

import { Helmet } from "react-helmet-async";
import moment from "moment";
import { Badge } from "../../components/ui/badge";
import eventCategory from "../../config/event_category.json";
import * as Icons from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "../../components/ui/dialog";

export type IOrganizer = {
  name: string;
  profilePic?: string;
  picture: string;
  platform_fees: number;
  charges_type: string;
  social_links: any[];
  username: string;
};

export type IGuest = {
  _id: string;
  name: string;
  profilePic?: string;
  picture: string;
  social_links: any[];
};

export type ITicket = {
  _id: string;
  name: string;
  price: number;
  description: string;
  ticket_details: string;
  currency: string;
  slots: number | null;
};

export type IEvent = {
  event_id: string;
  _id: string;
  title: string;
  time: string;
  location: string;
  guests: IGuest[];
  image?: string;
  organizer: IOrganizer;
  hosts: IOrganizer[];
  about: string;
  ticket_type: string;
  ticket_price: ITicket[];
  registration_questions: IEventQuestion[];
  charges_type: string;
  approval: boolean;
  end_at: string;
  capacity: number | null;
  description?: string;
  location_type?: string;
  start_at?: string;
  brand_color: string;
  is_closed: string;
  event_category: string;
  guests_count?: number;
};

const avatarBgColors = [
  "bg-violet-300",
  "bg-amber-300",
  "bg-blue-200",
  "bg-pink-200",
  "bg-purple-200",
  "bg-green-200",
  "bg-yellow-200",
];

const Exp_EventDetails: React.FC = () => {
  const { id } = useParams();
  const [isOpen, setOpen] = useState(false);
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");

  const [toggleTicketInfo, setToggleTicketInfo] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<ITicket | null>(null);

  if (!id?.startsWith("evt-")) {
    return <Navigate to="/404" replace />;
  }

  const isPaidEvent = event?.ticket_type === "Paid";

  const fetchEvent = async () => {
    if (!id) {
      console.error("No event ID provided");
      setLoading(false);
      return;
    }
    try {
      // console.log("Fetching event with ID:", id);
      const res = await getEventById(id);
      // console.log("API Response:", res.data);
      if (res.data.status) {
        const apiEvent = res.data.response;
        setEvent(apiEvent);
      } else {
        console.warn("API status false:", res.data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Failed to load event:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedTicket = event?.ticket_price?.find(
    (tkt) => tkt._id === selectedTicketId,
  );

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const eventDescription =
    event?.about ||
    event?.description ||
    "Description is not available for this event.";

  if (loading) {
    return <Loading />;
  }

  // console.log(selectedTicket);

  if (!event || !id) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600 dark:text-gray-300 flex flex-col justify-center items-center gap-3">
          Event not found.
          <Button onClick={() => window.history.back()} className=" ml-2">
            Go Back
          </Button>
        </p>
      </div>
    );
  }

  // const getColor = (id: string) =>
  //   avatarColors[id.toString().charCodeAt(0) % avatarColors.length];

  const shouldDisableJoin =
    event?.is_closed === "closed" ||
    (event?.capacity !== null && event?.capacity <= 0) ||
    (isPaidEvent &&
      (!selectedTicketId ||
        (selectedTicket &&
          selectedTicket.slots !== null &&
          selectedTicket.slots <= 0)));

  return (
    <>
      <Helmet>
        <title>{event?.title} | Assist Buddi Event</title>

        <meta
          name="description"
          content={
            event.description?.replace(/<[^>]+>/g, "") ||
            "Join exciting events on Assist Buddi Event."
          }
        />

        <meta
          name="keywords"
          content={`${event?.title}, ${event?.location}, ${event?.organizer?.name}, events near me, event details, Assist Buddi Event`}
        />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href={`https://event.assistbuddi.com/${event?.event_id}`}
        />

        {/* Open Graph */}
        <meta property="og:title" content={event?.title || "Event Details"} />
        <meta
          property="og:description"
          content={
            event.description?.replace(/<[^>]+>/g, "") ||
            "Discover event details, schedule, location and registration info."
          }
        />
        <meta
          property="og:image"
          content={
            event?.image
              ? `${mediaUrl}/event_images/${event?.image}`
              : "https://event.assistbuddi.com/default-event.jpg"
          }
        />
        <meta
          property="og:url"
          content={`https://event.assistbuddi.com/${event?.event_id}`}
        />
        <meta property="og:type" content="website" />

        {/* Twitter Meta */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={event?.title || "Event Details"} />
        <meta
          name="twitter:description"
          content={
            event.description?.replace(/<[^>]+>/g, "") ||
            "Assist Buddi Event - Explore event details"
          }
        />
        <meta
          name="twitter:image"
          content={
            event?.image
              ? `${mediaUrl}/event_images/${event?.image}`
              : "https://event.assistbuddi.com/default-event.jpg"
          }
        />
      </Helmet>

      <div className="dark:text-gray-100 w-full">
        <div className="grid grid-cols-12 gap-1 md:gap-10">
          {/* LEFT CONTENT */}
          <div className="col-span-12 md:col-span-5 space-y-8">
            {/* Event Image */}
            <img
              src={
                event?.image
                  ? `${mediaUrl}/event_images/${event?.image}`
                  : "/event-buddi-whitelogo.png"
              }
              alt={event?.title}
              className="w-full h-auto object-cover rounded-xl shadow-sm"
            />

            <div className="space-y-7 hidden md:block">
              {/* Hosted By */}
              <div className="space-y-3">
                <p className="font-medium border-b border-gray-300 pb-1 w-full">
                  Hosted by
                </p>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      to={`/user/${event.organizer?.username}`}
                      className="flex items-center gap-3"
                    >
                      {event.organizer?.profilePic ||
                      event.organizer?.picture ? (
                        <img
                          src={`${
                            event.organizer.profilePic
                              ? `${mediaUrl}/user_profile_pics/${event.organizer.profilePic}`
                              : event.organizer.picture
                          }`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                            event.organizer?.name || "",
                          )}`}
                        >
                          {event.organizer?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <p className="font-medium">{event.organizer?.name}</p>
                    </Link>

                    {/* social link */}
                    <div className="flex items-center order-2 gap-2 grow xl:order-3 md:justify-end">
                      {event.organizer?.social_links?.map((item: any) =>
                        item.url ? (
                          <a
                            key={item._id}
                            href={item.url}
                            target="_blank"
                            rel="noopener"
                            className="flex h-7 w-7 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-400 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                          >
                            {/* FACEBOOK */}
                            {item.platform === "facebook" && (
                              <svg
                                className="fill-current"
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z" />
                              </svg>
                            )}

                            {/* X / TWITTER */}
                            {item.platform === "x" && (
                              <svg
                                className="fill-current"
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875ZM14.2033 16.475H15.7308L5.87078 3.43833H4.23162L14.2033 16.475Z" />
                              </svg>
                            )}

                            {/* LINKEDIN */}
                            {item.platform === "linkedin" && (
                              <svg
                                className="fill-current"
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z" />
                              </svg>
                            )}

                            {/* INSTAGRAM */}
                            {item.platform === "instagram" && (
                              <svg
                                className="fill-current"
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.8567 1.66699C11.7946 1.66854 12.2698 1.67351 12.6805 1.68573L12.8422 1.69102C13.0291 1.69766 13.2134 1.70599 13.4357 1.71641C14.3224 1.75738 14.9273 1.89766 15.4586 2.10391C16.0078 2.31572 16.4717 2.60183 16.9349 3.06503C17.3974 3.52822 17.6836 3.99349 17.8961 4.54141C18.1016 5.07197 18.2419 5.67753 18.2836 6.56433C18.2935 6.78655 18.3015 6.97088 18.3081 7.15775L18.3133 7.31949C18.3255 7.73011 18.3311 8.20543 18.3328 9.1433L18.3335 9.76463C18.3336 9.84055 18.3336 9.91888 18.3336 9.99972L18.3335 10.2348L18.333 10.8562C18.3314 11.794 18.3265 12.2694 18.3142 12.68L18.3089 12.8417C18.3023 13.0286 18.294 13.213 18.2836 13.4351C18.2426 14.322 18.1016 14.9268 17.8961 15.458C17.6842 16.0074 17.3974 16.4713 16.9349 16.9345C16.4717 17.397 16.0057 17.6831 15.4586 17.8955C14.9273 18.1011 14.3224 18.2414 13.4357 18.2831C13.2134 18.293 13.0291 18.3011 12.8422 18.3076L12.6805 18.3128C12.2698 18.3251 11.7946 18.3306 10.8567 18.3324L10.2353 18.333C10.1594 18.333 10.0811 18.333 10.0002 18.333H9.76516L9.14375 18.3325C8.20591 18.331 7.7306 18.326 7.31997 18.3137L7.15824 18.3085C6.97136 18.3018 6.78703 18.2935 6.56481 18.2831C5.67801 18.2421 5.07384 18.1011 4.5419 17.8955C3.99328 17.6838 3.5287 17.397 3.06551 16.9345C2.60231 16.4713 2.3169 16.0053 2.1044 15.458C1.89815 14.9268 1.75856 14.322 1.7169 13.4351C1.707 13.213 1.69892 13.0286 1.69238 12.8417L1.68714 12.68C1.67495 12.2694 1.66939 11.794 1.66759 10.8562L1.66748 9.1433C1.66903 8.20543 1.67399 7.73011 1.68621 7.31949L1.69151 7.15775C1.69815 6.97088 1.70648 6.78655 1.7169 6.56433C1.75786 5.67683 1.89815 5.07266 2.1044 4.54141C2.3162 3.9928 2.60231 3.52822 3.06551 3.06503C3.5287 2.60183 3.99398 2.31641 4.5419 2.10391C5.07315 1.89766 5.67731 1.75808 6.56481 1.71641C6.78703 1.70652 6.97136 1.69844 7.15824 1.6919L7.31997 1.68666C7.7306 1.67446 8.20591 1.6689 9.14375 1.6671L10.8567 1.66699ZM10.0002 5.83308C7.69781 5.83308 5.83356 7.69935 5.83356 9.99972C5.83356 12.3021 7.69984 14.1664 10.0002 14.1664C12.3027 14.1664 14.1669 12.3001 14.1669 9.99972C14.1669 7.69732 12.3006 5.83308 10.0002 5.83308ZM10.0002 7.49974C11.381 7.49974 12.5002 8.61863 12.5002 9.99972C12.5002 11.3805 11.3813 12.4997 10.0002 12.4997C8.6195 12.4997 7.50023 11.3809 7.50023 9.99972C7.50023 8.61897 8.61908 7.49974 10.0002 7.49974ZM14.3752 4.58308C13.8008 4.58308 13.3336 5.04967 13.3336 5.62403C13.3336 6.19841 13.8002 6.66572 14.3752 6.66572C14.9496 6.66572 15.4169 6.19913 15.4169 5.62403C15.4169 5.04967 14.9488 4.58236 14.3752 4.58308Z"
                                  fill=""
                                />
                              </svg>
                            )}
                          </a>
                        ) : null,
                      )}
                    </div>
                  </div>

                  {/* co-hosts */}
                  {event.hosts.length !== 0 && (
                    <>
                      {event.hosts.map((host: any) => (
                        <div key={host._id} className="flex items-center gap-3">
                          <Link
                            to={`/user/${host?.username}`}
                            className="flex items-center gap-3"
                          >
                            {host?.profilePic || host?.picture ? (
                              <img
                                src={
                                  host.profilePic
                                    ? `${mediaUrl}/user_profile_pics/${host.profilePic}`
                                    : host.picture
                                }
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
                          </Link>

                          {/* social link of co-hosts */}
                          <div className="flex items-center order-2 gap-2 grow xl:order-3 justify-end">
                            {host?.social_links?.map((item: any) =>
                              item.url ? (
                                <a
                                  key={item._id}
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener"
                                  className="flex h-7 w-7 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-400 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                                >
                                  {/* FACEBOOK */}
                                  {item.platform === "facebook" && (
                                    <svg
                                      className="fill-current"
                                      width="18"
                                      height="18"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z" />
                                    </svg>
                                  )}

                                  {/* X / TWITTER */}
                                  {item.platform === "x" && (
                                    <svg
                                      className="fill-current"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875ZM14.2033 16.475H15.7308L5.87078 3.43833H4.23162L14.2033 16.475Z" />
                                    </svg>
                                  )}

                                  {/* LINKEDIN */}
                                  {item.platform === "linkedin" && (
                                    <svg
                                      className="fill-current"
                                      width="18"
                                      height="18"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z" />
                                    </svg>
                                  )}

                                  {/* INSTAGRAM */}
                                  {item.platform === "instagram" && (
                                    <svg
                                      className="fill-current"
                                      width="18"
                                      height="18"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M10.8567 1.66699C11.7946 1.66854 12.2698 1.67351 12.6805 1.68573L12.8422 1.69102C13.0291 1.69766 13.2134 1.70599 13.4357 1.71641C14.3224 1.75738 14.9273 1.89766 15.4586 2.10391C16.0078 2.31572 16.4717 2.60183 16.9349 3.06503C17.3974 3.52822 17.6836 3.99349 17.8961 4.54141C18.1016 5.07197 18.2419 5.67753 18.2836 6.56433C18.2935 6.78655 18.3015 6.97088 18.3081 7.15775L18.3133 7.31949C18.3255 7.73011 18.3311 8.20543 18.3328 9.1433L18.3335 9.76463C18.3336 9.84055 18.3336 9.91888 18.3336 9.99972L18.3335 10.2348L18.333 10.8562C18.3314 11.794 18.3265 12.2694 18.3142 12.68L18.3089 12.8417C18.3023 13.0286 18.294 13.213 18.2836 13.4351C18.2426 14.322 18.1016 14.9268 17.8961 15.458C17.6842 16.0074 17.3974 16.4713 16.9349 16.9345C16.4717 17.397 16.0057 17.6831 15.4586 17.8955C14.9273 18.1011 14.3224 18.2414 13.4357 18.2831C13.2134 18.293 13.0291 18.3011 12.8422 18.3076L12.6805 18.3128C12.2698 18.3251 11.7946 18.3306 10.8567 18.3324L10.2353 18.333C10.1594 18.333 10.0811 18.333 10.0002 18.333H9.76516L9.14375 18.3325C8.20591 18.331 7.7306 18.326 7.31997 18.3137L7.15824 18.3085C6.97136 18.3018 6.78703 18.2935 6.56481 18.2831C5.67801 18.2421 5.07384 18.1011 4.5419 17.8955C3.99328 17.6838 3.5287 17.397 3.06551 16.9345C2.60231 16.4713 2.3169 16.0053 2.1044 15.458C1.89815 14.9268 1.75856 14.322 1.7169 13.4351C1.707 13.213 1.69892 13.0286 1.69238 12.8417L1.68714 12.68C1.67495 12.2694 1.66939 11.794 1.66759 10.8562L1.66748 9.1433C1.66903 8.20543 1.67399 7.73011 1.68621 7.31949L1.69151 7.15775C1.69815 6.97088 1.70648 6.78655 1.7169 6.56433C1.75786 5.67683 1.89815 5.07266 2.1044 4.54141C2.3162 3.9928 2.60231 3.52822 3.06551 3.06503C3.5287 2.60183 3.99398 2.31641 4.5419 2.10391C5.07315 1.89766 5.67731 1.75808 6.56481 1.71641C6.78703 1.70652 6.97136 1.69844 7.15824 1.6919L7.31997 1.68666C7.7306 1.67446 8.20591 1.6689 9.14375 1.6671L10.8567 1.66699ZM10.0002 5.83308C7.69781 5.83308 5.83356 7.69935 5.83356 9.99972C5.83356 12.3021 7.69984 14.1664 10.0002 14.1664C12.3027 14.1664 14.1669 12.3001 14.1669 9.99972C14.1669 7.69732 12.3006 5.83308 10.0002 5.83308ZM10.0002 7.49974C11.381 7.49974 12.5002 8.61863 12.5002 9.99972C12.5002 11.3805 11.3813 12.4997 10.0002 12.4997C8.6195 12.4997 7.50023 11.3809 7.50023 9.99972C7.50023 8.61897 8.61908 7.49974 10.0002 7.49974ZM14.3752 4.58308C13.8008 4.58308 13.3336 5.04967 13.3336 5.62403C13.3336 6.19841 13.8002 6.66572 14.3752 6.66572C14.9496 6.66572 15.4169 6.19913 15.4169 5.62403C15.4169 5.04967 14.9488 4.58236 14.3752 4.58308Z"
                                        fill=""
                                      />
                                    </svg>
                                  )}
                                </a>
                              ) : null,
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Guests Section */}
              {event.guests_count !== 0 && (
                <div className="space-y-3">
                  <p className="font-medium border-b border-gray-300 pb-1 w-full">
                    {event?.guests_count} Going
                  </p>

                  {/* <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {event.guests.slice(0, 5).map((guest) =>
                        guest.profilePic || guest.picture ? (
                          <img
                            key={guest._id}
                            src={`${
                              guest.profilePic
                                ? `${mediaUrl}/user_profile_pics/${guest.profilePic}`
                                : guest.picture
                            } `}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            key={guest._id}
                            className={`w-8 h-8 font-bold rounded-full flex items-center justify-center  text-white border border-white dark:border-gray-800 transition-all ${getAvatarColor(
                              guest.name,
                            )}`}
                            title={guest.name}
                          >
                            {guest.name[0]?.toUpperCase()}
                          </div>
                        ),
                      )}
                    </div>
                    {event.guests.length > 5 && (
                      <span className="text-md text-gray-400">
                        +{event?.guests?.length - 5} Others
                      </span>
                    )}
                  </div> */}

                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {Array.from({
                        length: Math.min(event?.guests_count ?? 0, 5),
                      }).map((_, index) => (
                        <div
                          key={index}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border border-white dark:border-gray-800 ${
                            avatarBgColors[index % avatarBgColors.length]
                          }`}
                        >
                          <Icons.User size={16} className="text-white" />
                        </div>
                      ))}
                    </div>

                    {(event?.guests_count ?? 0) > 5 && (
                      <span className="text-md text-gray-400">
                        +{(event?.guests_count ?? 0) - 5} Others
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:block">
              {(() => {
                const matched = eventCategory.find(
                  (e) => e.value === event.event_category,
                );

                if (!matched) return null;

                const Icon = Icons[
                  matched.icon as keyof typeof Icons
                ] as LucideIcon;

                return (
                  <Badge
                    className="flex items-center gap-1.5 py-1.5 text-gray-500"
                    variant={"secondary"}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    <span>{matched.label}</span>
                  </Badge>
                );
              })()}
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="col-span-12 md:col-span-7 space-y-8">
            {/* Event Title + Info */}
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold">{event?.title}</h1>

              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-3">
                  {event.start_at && (
                    <div className="flex items-center gap-4 rounded-xl">
                      {/* Date Badge */}
                      <div className="icon_bg">
                        <Calendar
                          className={"w-5 h-5"}
                          style={{ color: event?.brand_color || "#6b21a8" }}
                        />
                      </div>
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
                    </div>
                  )}
                </p>
                <p className="flex items-center gap-4">
                  <div className="icon_bg">
                    {event?.location_type === "Offline" ? (
                      <MapPin
                        className={`w-5 h-5`}
                        style={{
                          color: event?.brand_color || "#6b21a8",
                        }}
                      />
                    ) : (
                      <Globe
                        className={`w-5 h-5`}
                        style={{
                          color: event?.brand_color || "#6b21a8",
                        }}
                      />
                    )}
                  </div>
                  <span className="flex-1 break-words">
                    {event?.location ||
                      (event?.location_type == "Virtual" && "Virtual / Online") || event?.location_type}
                  </span>
                </p>
              </div>
            </div>

            {/* Registration Card */}
            <Card className="w-full pt-0 dark:bg-gray-800">
              {/* Registration Header */}
              <p className="bg-[#f1f1f1] dark:bg-gray-700 py-3 rounded-t-lg border-t px-4 text-gray-700 dark:text-gray-200 text-base font-medium flex items-center justify-between">
                Registration
                {event.is_closed == "closed" && (
                  <Badge variant={"destructive"}>Closed</Badge>
                )}
              </p>

              <CardContent className="space-y-4 p-0">
                {/* Approval Section */}
                {event?.approval && (
                  <div className="border-b border-gray-300 dark:border-gray-700 pb-4 w-full px-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <p className="text-base font-semibold">
                        Approval Required
                      </p>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your registration is subject to approval by the host.
                    </p>
                  </div>
                )}

                {/* Registration CTA */}
                <div className="px-4 space-y-4">
                  <p className="text-md dark:text-gray-300">
                    Welcome! to join event, please register below.
                  </p>

                  {/* Ticket Prices */}

                  <RadioGroup
                    value={selectedTicketId}
                    onValueChange={(v) => setSelectedTicketId(v)}
                    className="space-y-3"
                  >
                    {event?.ticket_price?.map((tkt: ITicket) => {
                      const isSoldOut = tkt.slots !== null && tkt.slots <= 0;

                      return (
                        <div
                          key={tkt._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isSoldOut) setSelectedTicketId(tkt._id);
                          }}
                          className={`relative w-full rounded-lg flex flex-col p-3 border transition-all ${
                            isSoldOut
                              ? "bg-gray-100 cursor-not-allowed opacity-60"
                              : selectedTicketId === tkt._id
                                ? "bg-[#f1f1f1] shadow-md cursor-pointer"
                                : "bg-white hover:shadow-md cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-5">
                            <div className="flex-1 space-y-2">
                              <h3 className="text-md font-semibold text-gray-900 flex gap-2 items-center">
                                {tkt.name}
                                <Icons.Info
                                  className="h-4 w-4"
                                  style={{
                                    color: event?.brand_color || "#6b21a8",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setToggleTicketInfo(true);
                                    setTicketInfo(tkt);
                                  }}
                                />
                              </h3>

                              {tkt.description && (
                                <p className="text-gray-800 text-[12px] eading-snug break-words">
                                  {tkt.description}
                                </p>
                              )}

                              <span className="block text-sm font-semibold text-gray-800">
                                {tkt.price} {tkt.currency}
                              </span>

                              {isSoldOut && (
                                <span className="text-xs font-semibold text-red-500">
                                  Sold out
                                </span>
                              )}
                            </div>

                            <RadioGroupItem
                              id={tkt._id}
                              value={tkt._id}
                              disabled={isSoldOut}
                              className="hidden"
                            />

                            <div
                              className={`w-5 h-5 flex items-center justify-center rounded-[4px] border transition-all`}
                              style={{
                                borderColor:
                                  selectedTicketId === tkt._id && !isSoldOut
                                    ? event?.brand_color || "#6b21a8"
                                    : "#cecece",
                              }}
                            >
                              {selectedTicketId === tkt._id && !isSoldOut && (
                                <Check
                                  className="w-4 h-4"
                                  style={{
                                    color: event?.brand_color || "#6b21a8",
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>

                  <p className="text-red-500 text-sm text-end">
                    {event.capacity !== null && event.capacity <= 0
                      ? "Sold out"
                      : event.capacity !== null && event.capacity <= 10
                        ? `Only ${event.capacity} tickets left`
                        : ""}
                  </p>

                  <button
                    className={`w-full text-sm font-normal disabled:opacity-50 disabled:text-white disabled:cursor-not-allowed py-3 rounded-md text-white ${
                      event.brand_color ? "brand_button" : ""
                    }`}
                    style={{
                      backgroundColor: event?.brand_color || "#59168b",
                    }}
                    disabled={shouldDisableJoin}
                    onClick={() => setOpen(true)}
                  >
                    {event?.approval ? "Request to Join" : "Register"}
                  </button>

                  {/* Ticket Info modal */}
                  {toggleTicketInfo && ticketInfo && (
                    <Dialog
                      open={toggleTicketInfo}
                      onOpenChange={() => setToggleTicketInfo(false)}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {ticketInfo.name}
                          </h3>
                        </DialogHeader>

                        <div className="space-y-4 text-sm">
                          {ticketInfo.description && (
                            <p className="text-gray-700">
                              {ticketInfo.description}
                            </p>
                          )}

                          {ticketInfo.ticket_details && (
                            <div
                              className="text-gray-900 text-[13px] p-3 leading-relaxed bg-[#f1f1f1] rounded-md"
                              dangerouslySetInnerHTML={{
                                __html: ticketInfo.ticket_details,
                              }}
                            />
                          )}

                          <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-900">
                            <div className="flex items-center gap-2">
                              <Icons.TicketMinus className="h-4 w-4" />{" "}
                              Available Tickets:{" "}
                              <strong className="text-gray-900">
                                {ticketInfo.slots ?? "Unlimited"}
                              </strong>
                            </div>

                            <span className="text-sm font-semibold">
                              {ticketInfo.price} {ticketInfo.currency}
                            </span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* About Event */}
            <div className="space-y-4">
              <p className="font-medium border-b border-gray-300 pb-1 w-full">
                About Event
              </p>
              <div
                className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed prose prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: eventDescription }}
              />
            </div>

            {/* Location */}
            {event.location && (
              <div className="space-y-4">
                <p className="font-medium border-b border-gray-300 pb-1 w-full">
                  Location
                </p>
                <p className="text-sm text-gray-700">{event?.location}</p>
                <div className="w-full">
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      event?.location,
                    )}&output=embed`}
                    width="100%"
                    height="250"
                    style={{ border: 0, borderRadius: "14px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            )}

            {/* Guests */}
            <div className="space-y-7 block md:hidden">
              {/* Hosted By */}
              <div className="space-y-3">
                <p className="font-medium border-b border-gray-300 pb-1 w-full">
                  Hosted by
                </p>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      to={`/user/${event.organizer?.username}`}
                      className="flex items-center gap-3"
                    >
                      {event.organizer?.profilePic ||
                      event.organizer?.picture ? (
                        <img
                          src={`${
                            event.organizer.profilePic
                              ? `${mediaUrl}/user_profile_pics/${event.organizer.profilePic}`
                              : event.organizer.picture
                          }`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                            event.organizer?.name || "",
                          )}`}
                        >
                          {event.organizer?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <p className="font-medium">{event.organizer?.name}</p>
                    </Link>

                    {/* social link */}
                    <div className="flex items-center order-2 gap-2 grow xl:order-3 justify-end">
                      {event.organizer?.social_links?.map((item: any) =>
                        item.url ? (
                          <a
                            key={item._id}
                            href={item.url}
                            target="_blank"
                            rel="noopener"
                            className="flex h-7 w-7 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-400 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                          >
                            {/* FACEBOOK */}
                            {item.platform === "facebook" && (
                              <svg
                                className="fill-current"
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z" />
                              </svg>
                            )}

                            {/* X / TWITTER */}
                            {item.platform === "x" && (
                              <svg
                                className="fill-current"
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875ZM14.2033 16.475H15.7308L5.87078 3.43833H4.23162L14.2033 16.475Z" />
                              </svg>
                            )}

                            {/* LINKEDIN */}
                            {item.platform === "linkedin" && (
                              <svg
                                className="fill-current"
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z" />
                              </svg>
                            )}

                            {/* INSTAGRAM */}
                            {item.platform === "instagram" && (
                              <svg
                                className="fill-current"
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.8567 1.66699C11.7946 1.66854 12.2698 1.67351 12.6805 1.68573L12.8422 1.69102C13.0291 1.69766 13.2134 1.70599 13.4357 1.71641C14.3224 1.75738 14.9273 1.89766 15.4586 2.10391C16.0078 2.31572 16.4717 2.60183 16.9349 3.06503C17.3974 3.52822 17.6836 3.99349 17.8961 4.54141C18.1016 5.07197 18.2419 5.67753 18.2836 6.56433C18.2935 6.78655 18.3015 6.97088 18.3081 7.15775L18.3133 7.31949C18.3255 7.73011 18.3311 8.20543 18.3328 9.1433L18.3335 9.76463C18.3336 9.84055 18.3336 9.91888 18.3336 9.99972L18.3335 10.2348L18.333 10.8562C18.3314 11.794 18.3265 12.2694 18.3142 12.68L18.3089 12.8417C18.3023 13.0286 18.294 13.213 18.2836 13.4351C18.2426 14.322 18.1016 14.9268 17.8961 15.458C17.6842 16.0074 17.3974 16.4713 16.9349 16.9345C16.4717 17.397 16.0057 17.6831 15.4586 17.8955C14.9273 18.1011 14.3224 18.2414 13.4357 18.2831C13.2134 18.293 13.0291 18.3011 12.8422 18.3076L12.6805 18.3128C12.2698 18.3251 11.7946 18.3306 10.8567 18.3324L10.2353 18.333C10.1594 18.333 10.0811 18.333 10.0002 18.333H9.76516L9.14375 18.3325C8.20591 18.331 7.7306 18.326 7.31997 18.3137L7.15824 18.3085C6.97136 18.3018 6.78703 18.2935 6.56481 18.2831C5.67801 18.2421 5.07384 18.1011 4.5419 17.8955C3.99328 17.6838 3.5287 17.397 3.06551 16.9345C2.60231 16.4713 2.3169 16.0053 2.1044 15.458C1.89815 14.9268 1.75856 14.322 1.7169 13.4351C1.707 13.213 1.69892 13.0286 1.69238 12.8417L1.68714 12.68C1.67495 12.2694 1.66939 11.794 1.66759 10.8562L1.66748 9.1433C1.66903 8.20543 1.67399 7.73011 1.68621 7.31949L1.69151 7.15775C1.69815 6.97088 1.70648 6.78655 1.7169 6.56433C1.75786 5.67683 1.89815 5.07266 2.1044 4.54141C2.3162 3.9928 2.60231 3.52822 3.06551 3.06503C3.5287 2.60183 3.99398 2.31641 4.5419 2.10391C5.07315 1.89766 5.67731 1.75808 6.56481 1.71641C6.78703 1.70652 6.97136 1.69844 7.15824 1.6919L7.31997 1.68666C7.7306 1.67446 8.20591 1.6689 9.14375 1.6671L10.8567 1.66699ZM10.0002 5.83308C7.69781 5.83308 5.83356 7.69935 5.83356 9.99972C5.83356 12.3021 7.69984 14.1664 10.0002 14.1664C12.3027 14.1664 14.1669 12.3001 14.1669 9.99972C14.1669 7.69732 12.3006 5.83308 10.0002 5.83308ZM10.0002 7.49974C11.381 7.49974 12.5002 8.61863 12.5002 9.99972C12.5002 11.3805 11.3813 12.4997 10.0002 12.4997C8.6195 12.4997 7.50023 11.3809 7.50023 9.99972C7.50023 8.61897 8.61908 7.49974 10.0002 7.49974ZM14.3752 4.58308C13.8008 4.58308 13.3336 5.04967 13.3336 5.62403C13.3336 6.19841 13.8002 6.66572 14.3752 6.66572C14.9496 6.66572 15.4169 6.19913 15.4169 5.62403C15.4169 5.04967 14.9488 4.58236 14.3752 4.58308Z"
                                  fill=""
                                />
                              </svg>
                            )}
                          </a>
                        ) : null,
                      )}
                    </div>
                  </div>

                  {/* co-hosts */}
                  {event.hosts.length !== 0 && (
                    <>
                      {event.hosts.map((host: any) => (
                        <div key={host._id} className="flex items-center gap-3">
                          <Link
                            to={`/user/${host?.username}`}
                            className="flex items-center gap-3"
                          >
                            {host?.profilePic || host?.picture ? (
                              <img
                                src={
                                  host.profilePic
                                    ? `${mediaUrl}/user_profile_pics/${host.profilePic}`
                                    : host.picture
                                }
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
                          </Link>

                          {/* social link of co-hosts */}
                          <div className="flex items-center order-2 gap-2 grow xl:order-3 justify-end">
                            {host?.social_links?.map((item: any) =>
                              item.url ? (
                                <a
                                  key={item._id}
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener"
                                  className="flex h-7 w-7 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-400 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                                >
                                  {/* FACEBOOK */}
                                  {item.platform === "facebook" && (
                                    <svg
                                      className="fill-current"
                                      width="18"
                                      height="18"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z" />
                                    </svg>
                                  )}

                                  {/* X / TWITTER */}
                                  {item.platform === "x" && (
                                    <svg
                                      className="fill-current"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875ZM14.2033 16.475H15.7308L5.87078 3.43833H4.23162L14.2033 16.475Z" />
                                    </svg>
                                  )}

                                  {/* LINKEDIN */}
                                  {item.platform === "linkedin" && (
                                    <svg
                                      className="fill-current"
                                      width="18"
                                      height="18"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z" />
                                    </svg>
                                  )}

                                  {/* INSTAGRAM */}
                                  {item.platform === "instagram" && (
                                    <svg
                                      className="fill-current"
                                      width="18"
                                      height="18"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M10.8567 1.66699C11.7946 1.66854 12.2698 1.67351 12.6805 1.68573L12.8422 1.69102C13.0291 1.69766 13.2134 1.70599 13.4357 1.71641C14.3224 1.75738 14.9273 1.89766 15.4586 2.10391C16.0078 2.31572 16.4717 2.60183 16.9349 3.06503C17.3974 3.52822 17.6836 3.99349 17.8961 4.54141C18.1016 5.07197 18.2419 5.67753 18.2836 6.56433C18.2935 6.78655 18.3015 6.97088 18.3081 7.15775L18.3133 7.31949C18.3255 7.73011 18.3311 8.20543 18.3328 9.1433L18.3335 9.76463C18.3336 9.84055 18.3336 9.91888 18.3336 9.99972L18.3335 10.2348L18.333 10.8562C18.3314 11.794 18.3265 12.2694 18.3142 12.68L18.3089 12.8417C18.3023 13.0286 18.294 13.213 18.2836 13.4351C18.2426 14.322 18.1016 14.9268 17.8961 15.458C17.6842 16.0074 17.3974 16.4713 16.9349 16.9345C16.4717 17.397 16.0057 17.6831 15.4586 17.8955C14.9273 18.1011 14.3224 18.2414 13.4357 18.2831C13.2134 18.293 13.0291 18.3011 12.8422 18.3076L12.6805 18.3128C12.2698 18.3251 11.7946 18.3306 10.8567 18.3324L10.2353 18.333C10.1594 18.333 10.0811 18.333 10.0002 18.333H9.76516L9.14375 18.3325C8.20591 18.331 7.7306 18.326 7.31997 18.3137L7.15824 18.3085C6.97136 18.3018 6.78703 18.2935 6.56481 18.2831C5.67801 18.2421 5.07384 18.1011 4.5419 17.8955C3.99328 17.6838 3.5287 17.397 3.06551 16.9345C2.60231 16.4713 2.3169 16.0053 2.1044 15.458C1.89815 14.9268 1.75856 14.322 1.7169 13.4351C1.707 13.213 1.69892 13.0286 1.69238 12.8417L1.68714 12.68C1.67495 12.2694 1.66939 11.794 1.66759 10.8562L1.66748 9.1433C1.66903 8.20543 1.67399 7.73011 1.68621 7.31949L1.69151 7.15775C1.69815 6.97088 1.70648 6.78655 1.7169 6.56433C1.75786 5.67683 1.89815 5.07266 2.1044 4.54141C2.3162 3.9928 2.60231 3.52822 3.06551 3.06503C3.5287 2.60183 3.99398 2.31641 4.5419 2.10391C5.07315 1.89766 5.67731 1.75808 6.56481 1.71641C6.78703 1.70652 6.97136 1.69844 7.15824 1.6919L7.31997 1.68666C7.7306 1.67446 8.20591 1.6689 9.14375 1.6671L10.8567 1.66699ZM10.0002 5.83308C7.69781 5.83308 5.83356 7.69935 5.83356 9.99972C5.83356 12.3021 7.69984 14.1664 10.0002 14.1664C12.3027 14.1664 14.1669 12.3001 14.1669 9.99972C14.1669 7.69732 12.3006 5.83308 10.0002 5.83308ZM10.0002 7.49974C11.381 7.49974 12.5002 8.61863 12.5002 9.99972C12.5002 11.3805 11.3813 12.4997 10.0002 12.4997C8.6195 12.4997 7.50023 11.3809 7.50023 9.99972C7.50023 8.61897 8.61908 7.49974 10.0002 7.49974ZM14.3752 4.58308C13.8008 4.58308 13.3336 5.04967 13.3336 5.62403C13.3336 6.19841 13.8002 6.66572 14.3752 6.66572C14.9496 6.66572 15.4169 6.19913 15.4169 5.62403C15.4169 5.04967 14.9488 4.58236 14.3752 4.58308Z"
                                        fill=""
                                      />
                                    </svg>
                                  )}
                                </a>
                              ) : null,
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Going Section */}
              {event.guests_count !== 0 && (
                <div className="space-y-3">
                  <p className="font-medium border-b border-gray-300 pb-1 w-full">
                    {event?.guests_count} Going
                  </p>

                  {/* <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {event.guests.slice(0, 5).map((guest) =>
                        guest.profilePic || guest?.picture ? (
                          <img
                            key={guest._id}
                            src={`${guest.profilePic
                                ? `${mediaUrl}/user_profile_pics/${guest.profilePic}`
                                : guest.picture
                              } `}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            key={guest._id}
                            className={`w-8 h-8 font-bold rounded-full flex items-center justify-center  text-white border border-white dark:border-gray-800 transition-all ${getAvatarColor(
                              guest.name
                            )}`}
                            title={guest.name}
                          >
                            {guest.name[0]?.toUpperCase()}
                          </div>
                        )
                      )}
                    </div>
                    {event.guests.length > 5 && (
                      <span className="text-md text-gray-400">
                        +{event?.guests?.length - 5} Others
                      </span>
                    )}
                  </div> */}

                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {Array.from({
                        length: Math.min(event?.guests_count ?? 0, 5),
                      }).map((_, index) => (
                        <div
                          key={index}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border border-white dark:border-gray-800 ${
                            avatarBgColors[index % avatarBgColors.length]
                          }`}
                        >
                          <Icons.User size={16} className="text-white" />
                        </div>
                      ))}
                    </div>

                    {(event?.guests_count ?? 0) > 5 && (
                      <span className="text-md text-gray-400">
                        +{(event?.guests_count ?? 0) - 5} Others
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="block md:hidden">
                {(() => {
                  const matched = eventCategory.find(
                    (e) => e.value === event.event_category,
                  );

                  if (!matched) return null;

                  const Icon = Icons[
                    matched.icon as keyof typeof Icons
                  ] as LucideIcon;

                  return (
                    <Badge
                      className="flex items-center gap-1.5 py-1.5 text-gray-500"
                      variant={"secondary"}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      <span>{matched.label}</span>
                    </Badge>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <RegistrationForm
          isOpen={isOpen}
          onClose={() => setOpen(false)}
          ticket={selectedTicket!}
          event={event}
          fetchEvent={fetchEvent}
        />
      )}
    </>
  );
};

export default Exp_EventDetails;
