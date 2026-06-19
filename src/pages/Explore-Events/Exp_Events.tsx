import React, { useEffect, useState } from "react";
import { MapPin, Calendar, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { format } from "date-fns";
import { Link } from "react-router";
import { getAllPages, getEvents } from "../../services/services";
import { mediaUrl } from "../../constants";
import Loading from "../loading";
import { Helmet } from "react-helmet-async";
import categoryData from "../../config/event_category.json";
import * as Icons from "lucide-react";

type IOrganizer = {
  name: string;
  email: string;
  phone: string;
  profilePic?: string;
  picture: string;
};

type IGuest = {
  _id: string;
  name: string;
  profilePic: string;
  picture: string;
};

export type ITicket = {
  _id: string;
  name: string;
  price: number;
  description: string;
  currency: string;
  ticket_details: string;
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
};

type CategoryJSON = {
  label: string;
  value: string;
  icon: string; // icon name as string
};

// const user = JSON.parse(sessionStorage.getItem("user") || "null");
const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [communities, setCommunities] = useState<any>([]);

  const [pageSize, setPageSize] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchEvents = async (evt_cate = "", pageNo = 1) => {
    if (!hasMore && pageNo !== 1) return;

    setLoading(true);

    const payload = {
      is_public: true,
      is_closed: "open",
      event_category: evt_cate,
      pageSize: pageNo,
      limit: 5,
      todayOrLater: true,
    };
    try {
      const res = await getEvents(payload);
      if (res.data.status) {
        const newEvents = res.data.response;
        setEvents((prev) =>
          pageNo === 1 ? newEvents : [...prev, ...newEvents],
        );

        setHasMore(res.data.pagination.hasMore);
        setPageSize(pageNo);
      } else {
        console.warn("API status false:", res.data.message);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunities = async () => {
    try {
      const payload = {
        is_public: true,
      };
      const res = await getAllPages(payload);
      if (res.data.status) {
        setCommunities(res.data.response.pages);
      }
    } catch (error) {
      console.log("fetchCommunities error", error);
    }
  };

  const allCategory = {
    name: "All Events",
    icon: (
      <img
        src="/event-buddi-logo.png"
        alt="All Events"
        className="w-6 h-6 object-contain"
      />
    ),
    value: "",
  };

  // Existing mapped categories
  const mappedCategories = categoryData.map((item: CategoryJSON) => {
    const IconComponent = (Icons as any)[item.icon];
    return {
      name: item.label,
      icon: IconComponent ? (
        <IconComponent className="w-6 h-6 text-purple-600" />
      ) : (
        <MoreHorizontal className="w-6 h-6 text-purple-600" />
      ),
      value: item.value,
    };
  });

  // Final list including "All Events"
  const categories = [allCategory, ...mappedCategories];

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setEvents([]);
    setPageSize(1);
    setHasMore(true);
    fetchEvents(category, 1);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        hasMore &&
        !loading
      ) {
        fetchEvents(selectedCategory, pageSize + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pageSize, hasMore, loading, selectedCategory]);

  useEffect(() => {
    fetchEvents("", 1);
    fetchCommunities();
  }, []);

  if (loading && events.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

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

      {/* Events */}
      <div className="transition-all max-w-3xl mx-auto">
        <div className="mb-0">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Explore
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Events That Match Your Passion
          </p>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scrollable-x">
            {categories.map((item, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(item.value)}
                className={`aspect-square min-w-[75px] md:min-w-[110px] rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                  selectedCategory === item.value ||
                  (item.value === "" && selectedCategory === null)
                    ? "border-1 border-purple-900 shadow-md shadow-purple-200/50 dark:shadow-purple-900/40"
                    : "border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-md hover:shadow-purple-200/40 dark:hover:shadow-purple-900/20"
                }
               bg-white dark:bg-gray-900`}
              >
                <div className="p-2 md:p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
                  {React.cloneElement(item.icon, {
                    className:
                      "w-4 h-4 md:w-6 md:h-6 text-purple-900 dark:text-purple-400",
                  })}
                </div>
                <span className="mx-2 md:text-xs text-[10px] font-semibold text-gray-700 dark:text-gray-200 md:mt-2">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {!loading && events.length === 0 ? (
          <div className="h-[70vh] w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <img
                src="/event-buddi-whitelogo.png"
                alt="No Events"
                className="h-30 w-30"
              />
              <p className="font-normal text-lg text-gray-700 dark:text-gray-300 text-center">
                No Events
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {events.map((event) => (
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
                            {event.location_type == "Offline" ? (
                              <MapPin className=" w-3 h-3 md:w-5 md:h-5 icon_color" />
                            ) : (
                              <Icons.Globe className=" w-3 h-3 md:w-5 md:h-5 icon_color" />
                            )}
                          </div>
                          {event?.location_type == "Offline"
                            ? event?.location || "Offline"
                            : "Virtual / Online"}
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
                                src={`${guest?.profilePic
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
                        </div> */}
                        {/* {event.guests.length > 5 && (
                          <span className="text-sm text-gray-400 -ml-1">
                            +{event?.guests?.length - 5} Others
                          </span>
                        )} */}
                        <span className="h-1 w-1 bg-gray-400 rounded-full" />
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {event?.guests_count} Registrations
                        </span>
                      </div>
                    </div>

                    {/* RIGHT - IMAGE */}
                    <div className="order-1 md:order-2 mb-2 md:mb-0 col-span-12 md:col-span-4 flex justify-center">
                      {event.image ? (
                        <img
                          src={`${mediaUrl}/event_images/${event.image}`}
                          alt={event.title}
                          loading={"lazy"}
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

            {loading && events.length > 0 && (
              <div className="flex justify-center py-6">
                <Loading />
              </div>
            )}

            {/* {!hasMore && events.length > 0 && (
              <div className="text-center text-sm text-gray-400 py-6">
                No more events
              </div>
            )} */}
          </div>
        )}
      </div>

      {/* COMMUNITY SECTION */}
      {communities.length !== 0 && (
        <div className="my-20 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10 px-4 text-center sm:text-left">
            <h2 className="text-2xl text-center md:text-3xl font-bold text-gray-900 dark:text-white">
              Communities
            </h2>
            {/* <p className="text-center mt-1 text-sm text-gray-500 dark:text-gray-400">
              Join communities and connect with like-minded people.
            </p> */}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {communities.map((community: any) => (
              <Link
                to={`/page/${community?.page_username}`}
                key={community._id}
                className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-sm transition"
              >
                {/* Organizer */}
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    {community.logo ? (
                      <img
                        src={`${mediaUrl}/page_images/${community.logo}`}
                        className={`w-10 h-10 rounded-full flex items-center justify-center object-cover`}
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm text-white bg-purple-600`}
                      >
                        {community.owner?.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {community.owner?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Community Organizer
                    </p>
                  </div>
                </div>

                {/* Community Name */}
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition">
                  {community?.name}
                </h3>

                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                  {community?.stats?.total_events} Events
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default EventsPage;
