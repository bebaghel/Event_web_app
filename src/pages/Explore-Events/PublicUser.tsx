import React, { useEffect, useState } from "react";
import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { format } from "date-fns";
import { Link, useParams } from "react-router";
import { getEvents, getUserByUsername } from "../../services/services";
import { mediaUrl } from "../../constants";
import Loading from "../loading";
import { getAvatarColor } from "../../utils/avatarColor";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { SocialLink } from "../../components/UserProfile/UserMetaCard";
import moment from "moment";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";

type IOrganizer = {
  name: string;
  email: string;
  phone: string;
  profilePic?: string;
  picture: string;
};

type IUser = {
  name: string;
  username: string;
  profilePic?: string;
  picture: string;
  bio: string;
  social_links: SocialLink[];
  hosted_events: any[];
  createdAt: string;
  _id: string;
};

type IGuest = {
  _id: string;
  name: string;
  profilePic: string;
  picture: string;
};

type ITicket = {
  name: string;
  price: number;
  description: string;
  currency: string;
};

type Event = {
  _id: number;
  event_id: string;
  title: string;
  time: string;
  location: string;
  organizer: IOrganizer;
  name: string;
  image?: string;
  ticket_type: string;
  ticket_price: ITicket[];
  is_public: boolean;
  approval: boolean;
  start_at: string;
  end_at: string;
  guests: IGuest[];
  capacity: string;
  description?: string;
  location_type?: string;
  event_category?: string;
  guests_count?: number;
  is_closed: string;
};

const PublicUser: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IUser>();

  const { username } = useParams();

  const today = moment().startOf("day");

  const upcomingEvents = events.filter((event) =>
    event.start_at ? moment(event.start_at).isSameOrAfter(today) : false,
  );

  const pastEvents = events.filter((event) =>
    event.start_at ? moment(event.start_at).isBefore(today) : false,
  );

  const fetchUser = async () => {
    if (!username) return toast.error("User not found");
    try {
      const res = await getUserByUsername(username);
      // console.log(res);
      if (res.data.status) {
        setUser(res.data.response);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || error?.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    const payload = {
      organizer: user?._id,
      is_public: true,
      // is_closed: "open",
      event_category: "",
    };
    try {
      const res = await getEvents(payload);
      if (res.data.status) {
        setEvents(res.data.response);
      } else {
        console.warn("API status false:", res.data.message);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchEvents();
    }
  }, [user]);
  if (loading) return <Loading />;

  return (
    <>
      <Helmet>
        <title>
          Assist Buddi Event | Discover Trending & Upcoming Events Near You |
          Explore Events
        </title>

        <meta
          name="description"
          content="Explore trending, popular, and upcoming events near you with Assist Buddi Event. Find concerts, workshops, festivals, exhibitions, community events, and more — all in one place."
        />

        <meta
          name="keywords"
          content="explore events, trending events, events near me, upcoming events, local events, concerts, workshops, festivals, exhibitions, event discovery, Assist Buddi Event"
        />

        {/* OpenGraph */}
        <meta
          property="og:title"
          content="Explore Events | Discover What's Happening Around You"
        />
        <meta
          property="og:description"
          content="Find exciting events near you — concerts, workshops, festivals, exhibitions, and more — curated by Assist Buddi Event."
        />
        <meta
          property="og:url"
          content="https://event.assistbuddi.com/explore"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://event.assistbuddi.com/og-image-explore.jpg"
        />

        {/* Twitter */}
        <meta
          name="twitter:title"
          content="Explore Events | Event Discovery by Assist Buddi Event"
        />
        <meta
          name="twitter:description"
          content="Discover top events happening around you — from concerts to workshops and more."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://event.assistbuddi.com/og-image-explore.jpg"
        />

        {/* Canonical */}
        <link rel="canonical" href="https://event.assistbuddi.com/explore" />
      </Helmet>

      <div className="transition-all max-w-3xl mx-auto">
        <div className="mb-0">
          <div className="w-full text-gray-800">
            {user ? (
              <div className="flex gap-4 items-start flex-wrap md:flex-nowrap">
                <div className="w-20 h-20 flex-shrink-0 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                  {user.profilePic || user.picture ? (
                    <img
                      src={
                        user.profilePic
                          ? `${mediaUrl}/user_profile_pics/${user.profilePic}`
                          : user.picture
                      }
                      alt={user?.name || "user"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src="/event-buddi-whitelogo.png"
                      className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800"
                    />
                  )}
                </div>

                <div className="">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    <div>
                      {user?.name}
                      <p className="text-sm text-gray-500 font-normal">
                        @{user?.username}
                      </p>
                    </div>
                  </h2>

                  {/* <p className="text-sm text-gray-500 mt-2">
                    {user?.hosted_events.length} Hosted
                  </p> */}
                  {user?.bio && (
                    <p className="mt-1 text-sm text-gray-500 font-normal">
                      {user?.bio}
                    </p>
                  )}

                  {/* social link */}
                  <div className="flex gap-3 text-sm mt-3">
                    {user?.social_links?.map((item: SocialLink) =>
                      item.url ? (
                        <a
                          key={item._id}
                          href={item.url}
                          target="_blank"
                          rel="noopener"
                          className="flex h-8 w-8 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
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
              </div>
            ) : (
              <div className="h-[70vh] w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <img
                    src="/event-buddi-whitelogo.png"
                    alt="No Events"
                    className="h-30 w-30"
                  />
                  <p className="font-normal text-lg text-gray-700 dark:text-gray-300 text-center">
                    User not found
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {user && (
          <div className="mt-10">
            <Tabs defaultValue="upcoming">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                {upcomingEvents.length === 0 ? (
                  <div className="h-[70vh] w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src="/event-buddi-whitelogo.png"
                        alt="No Events"
                        className="h-30 w-30"
                      />
                      <p className="font-normal text-lg text-gray-700 dark:text-gray-300 text-center">
                        No Upcoming Events
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {upcomingEvents.map((event) => (
                      <Card className="w-full border dark:border-gray-700 hover:shadow-md transition dark:bg-gray-800 cursor-pointer py-3 md:py-5 mt-5">
                        <Link
                          key={event._id}
                          to={`/${event.event_id}`}
                          className="block"
                        >
                          <CardContent className="grid grid-cols-12 gap-0 md:gap-5 px-3 md:px-5 py-0">
                            {/* LEFT - DETAILS */}
                            <div className="order-2 md:order-1 col-span-12 md:col-span-8 w-full">
                              <h3 className="text-1xl font-semibold text-gray-900 dark:text-white">
                                {event.title}
                              </h3>

                              <div className="mt-2 space-y-2 md:mt-4 md:space-y-3 text-gray-600 dark:text-gray-300 text-sm">
                                <p className="flex items-center gap-2 ">
                                  <div className="icon_bg">
                                    <Calendar className="w-3 h-3 md:w-5 md:h-5 icon_color" />
                                  </div>
                                  {event?.start_at
                                    ? format(
                                        new Date(event.start_at),
                                        "dd MMM yyyy, hh:mm a",
                                      )
                                    : "Date not available"}
                                </p>
                                <p className="flex items-center gap-2">
                                  <div className="icon_bg">
                                    <MapPin className=" w-3 h-3 md:w-5 md:h-5 icon_color" />
                                  </div>
                                  {event?.location
                                    ? event?.location
                                    : event?.location_type}
                                </p>
                              </div>

                              {/* Ticket Status + Guests */}
                              <div className="flex items-center gap-3 mt-3">
                                {event?.capacity !== null &&
                                Number(event.capacity) == 0 ? (
                                  <span className="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                    Sold Out
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                    Available
                                  </span>
                                )}
                                {/* Guest Avatars */}
                                {/* <div className="flex -space-x-2">
                                  {event.guests.slice(0, 5).map((guest) =>
                                    guest?.profilePic || guest?.picture ? (
                                      <img
                                        key={guest._id}
                                        src={`${
                                          guest?.profilePic
                                            ? `${mediaUrl}/user_profile_pics/${guest.profilePic}`
                                            : guest?.picture
                                        }`}
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div
                                        key={guest._id}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white border border-white dark:border-gray-800 ${getAvatarColor(
                                          guest?.name
                                        )}`}
                                        title={guest?.name}
                                      >
                                        {guest?.name[0]?.toUpperCase()}
                                      </div>
                                    )
                                  )}
                                </div>
                                {event.guests.length > 5 && (
                                  <span className="text-sm text-gray-400 -ml-1">
                                    +{event?.guests?.length - 5} Others
                                  </span>
                                )} */}
                                <span className="h-1 w-1 bg-gray-400 rounded-full" />
                                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  {event?.guests_count} Registrations
                                </span>
                                {event.is_closed == "closed" && (
                                  <Badge variant={"destructive"}>Closed</Badge>
                                )}
                              </div>
                            </div>

                            {/* RIGHT - IMAGE */}
                            <div className="order-1 md:order-2 mb-2 md:mb-0 col-span-12 md:col-span-4 flex justify-center">
                              {event.image ? (
                                <img
                                  src={`${mediaUrl}/event_images/${event.image}`}
                                  alt={event.title}
                                  className="min-h-[60%] h-full w-full aspect-square object-cover rounded-md md:aspect-square lg:aspect-auto lg:h-full"
                                />
                              ) : (
                                <div className="h-30 w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center md:aspect-square lg:aspect-auto lg:h-40">
                                  <span className="text-gray-500 text-xs">
                                    No Image
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="past">
                {pastEvents.length === 0 ? (
                  <div className="h-[70vh] w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src="/event-buddi-whitelogo.png"
                        alt="No Events"
                        className="h-30 w-30"
                      />
                      <p className="font-normal text-lg text-gray-700 dark:text-gray-300 text-center">
                        No Past Events
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {pastEvents.map((event) => (
                      <Card className="w-full border dark:border-gray-700 hover:shadow-md transition dark:bg-gray-800 cursor-pointer py-3 md:py-5 mt-5">
                        <Link
                          key={event._id}
                          to={`/${event.event_id}`}
                          className="block"
                        >
                          <CardContent className="grid grid-cols-12 gap-0 md:gap-5 px-3 md:px-5 py-0">
                            {/* LEFT - DETAILS */}
                            <div className="order-2 md:order-1 col-span-12 md:col-span-8 w-full">
                              <h3 className="text-1xl font-semibold text-gray-900 dark:text-white">
                                {event.title}
                              </h3>

                              <div className="mt-2 space-y-2 md:mt-4 md:space-y-3 text-gray-600 dark:text-gray-300 text-sm">
                                <p className="flex items-center gap-2 ">
                                  <div className="icon_bg">
                                    <Calendar className="w-3 h-3 md:w-5 md:h-5 icon_color" />
                                  </div>
                                  {event?.start_at
                                    ? format(
                                        new Date(event.start_at),
                                        "dd MMM yyyy, hh:mm a",
                                      )
                                    : "Date not available"}
                                </p>
                                <p className="flex items-center gap-2">
                                  <div className="icon_bg">
                                    <MapPin className=" w-3 h-3 md:w-5 md:h-5 icon_color" />
                                  </div>
                                  {event?.location
                                    ? event?.location
                                    : event?.location_type}
                                </p>
                              </div>

                              {/* Ticket Status + Guests */}
                              <div className="flex items-center gap-3 mt-3">
                                {event?.capacity !== null &&
                                Number(event.capacity) == 0 ? (
                                  <span className="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                    Sold Out
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                    Available
                                  </span>
                                )}
                                {/* Guest Avatars */}
                                {/* <div className="flex -space-x-2">
                                  {event.guests.slice(0, 5).map((guest) =>
                                    guest?.profilePic || guest?.picture ? (
                                      <img
                                        key={guest._id}
                                        src={`${
                                          guest?.profilePic
                                            ? `${mediaUrl}/user_profile_pics/${guest.profilePic}`
                                            : guest?.picture
                                        }`}
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div
                                        key={guest._id}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white border border-white dark:border-gray-800 ${getAvatarColor(
                                          guest?.name
                                        )}`}
                                        title={guest?.name}
                                      >
                                        {guest?.name[0]?.toUpperCase()}
                                      </div>
                                    )
                                  )}
                                </div>
                                {event.guests.length > 5 && (
                                  <span className="text-sm text-gray-400 -ml-1">
                                    +{event?.guests?.length - 5} Others
                                  </span>
                                )} */}
                                <span className="h-1 w-1 bg-gray-400 rounded-full" />
                                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  {event?.guests_count} Registrations
                                </span>
                                {event.is_closed == "closed" && (
                                  <Badge variant={"destructive"}>Closed</Badge>
                                )}
                              </div>
                            </div>

                            {/* RIGHT - IMAGE */}
                            <div className="order-1 md:order-2 mb-2 md:mb-0 col-span-12 md:col-span-4 flex justify-center">
                              {event.image ? (
                                <img
                                  src={`${mediaUrl}/event_images/${event.image}`}
                                  alt={event.title}
                                  className="min-h-[60%] h-full w-full aspect-square object-cover rounded-md md:aspect-square lg:aspect-auto lg:h-full"
                                />
                              ) : (
                                <div className="h-30 w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center md:aspect-square lg:aspect-auto lg:h-40">
                                  <span className="text-gray-500 text-xs">
                                    No Image
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </>
  );
};

export default PublicUser;
