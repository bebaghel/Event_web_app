import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  MapPin,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { getEvents } from "../../services/services";
import { mediaUrl } from "../../constants";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import { Card, CardContent } from "../../components/ui/card";
import moment from "moment";
import Loading from "../loading";
import { Button } from "../../components/ui/button";
import AppBottomNav from "../../layout/AppBottomNav";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../../components/ui/hover-card";
import { Badge } from "../../components/ui/badge";
import { IGuest } from "../Explore-Events/Exp_EventDetails";
import { toast } from "sonner";

interface EventItem {
  _id: number;
  title: string;
  start_at: string;
  location: string;
  event_id: string;
  image?: string;
  ticket_type: string;
  ticket_price: number;
  approval: boolean;
  end_at: string;
  location_type: string;
  guests: IGuest[];
  hosts: IGuest[];
  is_closed: string;
  guests_count?: number;
}

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [value, onChange] = useState<Value>(new Date());

  const navigate = useNavigate();

  const [pageSize, setPageSize] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const fetchEvents = async (pageNo = 1) => {
    if (!hasMore && pageNo !== 1) return;

    setLoading(true);

    const payload = { organizer: user?._id, pageSize: pageNo, limit: 10 };
    try {
      const res = await getEvents(payload);
      if (res.data.status) {
        const newEvents = res.data.response;

        setEvents((prev) =>
          pageNo === 1 ? newEvents : [...prev, ...newEvents]
        );
        setHasMore(res.data.pagination.hasMore);
        setPageSize(pageNo);
      }
    } catch (error: any) {
      console.error("Failed to load events:", error);
      toast.error(error?.response?.data?.message || error?.message || "Can't get events please wait")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(1);
  }, []);

  const eventDates = events.map((ev) =>
    moment(ev.start_at).format("YYYY-MM-DD")
  );

  const getEventsByDate = (date: Date) => {
    const formatted = moment(date).format("YYYY-MM-DD");
    return events.filter(
      (ev) => moment(ev.start_at).format("YYYY-MM-DD") === formatted
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        hasMore &&
        !loading
      ) {
        fetchEvents(pageSize + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pageSize, hasMore, loading]);

  const renderEvents = () => (
    <div className="space-y-4 ">
      {events.map((ev) => (
        <Link to={`detail/${ev?.event_id}`} className="block">
          <Card
            key={ev._id}
            className="overflow-hidden border dark:border-gray-700 hover:shadow-md transition dark:bg-gray-800 cursor-pointer p-2"
          >
            <CardContent className="grid grid-cols-12 gap-4 px-2 md:pt-2 md:px-4">
              {/* LEFT SIDE */}
              <div className="col-span-12 sm:col-span-7 md:col-span-9 order-2 md:order-1 flex flex-col">
                <h3 className="text-md md:text-lg font-semibold text-gray-900 dark:text-white">
                  {ev.title}
                </h3>

                <div className="mt-3 space-y-3 text-gray-600 dark:text-gray-300 text-sm">
                  {/* Date */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-900 text-white shadow-md">
                      <CalendarIcon size={16} />
                    </div>
                    <p className="text-md">
                      {moment(ev.start_at).format("DD MMM, YYYY")}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-900 text-white shadow-md">
                      <MapPin size={16} />
                    </div>
                    <p className="text-md break-words flex-1">
                      {ev.location || ev?.location_type}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE – IMAGE */}
              <div className="col-span-12 sm:col-span-5 md:col-span-3 order-1 md:order-2">
                <img
                  src={`${mediaUrl}/event_images/${ev.image}`}
                  alt={ev.title}
                  className="w-full h-full object-cover rounded-md shadow-sm"
                />
              </div>

              {/* FULL-WIDTH BOTTOM  */}
              <div className="col-span-12 order-3 w-full bg-white py-3 rounded-b-lg flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* LEFT */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
                  {/* ROW 1 */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                        ev.ticket_type === "Free"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {ev.ticket_type.toUpperCase()}
                    </span>

                    <span className="h-1 w-1 bg-gray-400 rounded-full" />

                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {ev?.guests_count} Registrations
                    </span>
                  </div>

                  {/* ROW 2 */}
                  <div className="flex flex-wrap items-center gap-2">
                    {ev?.hosts?.some((co) => co === user?._id) && (
                      <>
                        <span className="h-1 w-1 bg-gray-400 rounded-full hidden sm:block" />

                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          Co-host
                        </span>
                      </>
                    )}

                    {ev.is_closed == "closed" && (
                      <>
                        <span className="h-1 w-1 bg-gray-400 rounded-full" />
                        <Badge variant="destructive">Closed</Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <Link
                  to={`detail/${ev?.event_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full sm:w-auto bg-purple-900 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-800 flex items-center justify-center gap-1"
                >
                  <span>Manage</span>
                  <ArrowRight className="h-3 w-3 mt-0.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}

      {loading && events.length > 0 && (
        <div className="flex justify-center py-6">
          <Loading />
        </div>
      )}

      {/* {!hasMore && events.length > 0 && (
        <p className="text-center text-sm text-gray-500 py-6">No more events</p>
      )} */}
    </div>
  );

  return (
    <>
      {loading && events.length === 0 ? (
        <Loading />
      ) : (
        <>
          {!loading && events.length == 0 ? (
            <div className="h-[70vh] w-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="/event-buddi-whitelogo.png"
                  alt="bg"
                  className="h-30 w-30"
                />
                <p className="font-normal text-lg">
                  Create your first event with Assist Buddi Event
                </p>
                <Link to="add">
                  <Button>Create Event</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4 md:mb-6 ">
                <h1 className="text-lg md:text-2xl font-semibold">
                  Manage Events
                </h1>
                <Link to="add">
                  <Button>Create Event</Button>
                </Link>
              </div>

              {/* Layout */}

              <div className="grid grid-cols-12 gap-4 lg:gap-10 mb-20">
                <div className="col-span-12 md:col-span-8 w-full overflow-x-hidden">
                  {renderEvents()}
                </div>

                <div className="md:col-span-4 hidden md:flex flex-col gap-2 items-end justify-end h-fit">
                  <div className="flex items-center justify-between w-full mb-2 bg-white shadow p-4 rounded-lg">
                    <div>Calendar</div>
                    <div className="flex items-center gap-3">
                      <p className="event-dot mt-4"></p>
                      <p>Your Events</p>
                    </div>
                  </div>
                  <div className="w-full">
                    <Calendar
                      onChange={onChange}
                      value={value}
                      className={"p-2 w-full m-0"}
                      tileClassName={({ date, view }) => {
                        if (view === "month") {
                          const formatted = moment(date).format("YYYY-MM-DD");
                          if (eventDates.includes(formatted)) {
                            return "event-dot";
                          }
                        }
                        return "";
                      }}
                      tileContent={({ date, view }) => {
                        if (view !== "month") return null;

                        const formatted = moment(date).format("YYYY-MM-DD");
                        const dayEvents = getEventsByDate(date);

                        // Check past date
                        const today = moment().format("YYYY-MM-DD");
                        const isPast = moment(formatted).isBefore(today, "day");

                        return (
                          <>
                            {isPast && dayEvents.length == 0 ? (
                              ""
                            ) : (
                              <HoverCard openDelay={100} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <div
                                    className="absolute inset-0 w-full h-full cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </HoverCardTrigger>

                                <HoverCardContent
                                  side="right"
                                  className="w-72 p-4 shadow-xl rounded-lg"
                                >
                                  <h3 className="font-semibold mb-3 flex w-full justify-between items-center">
                                    {moment(date).format("DD MMM YYYY")}
                                    {!isPast && (
                                      <div className="relative group">
                                        <Button
                                          size={"icon-sm"}
                                          variant={"secondary"}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate("add", {
                                              state: { date: formatted },
                                            });
                                          }}
                                          className="p-0"
                                        >
                                          <Plus className="h-2 w-2" />
                                        </Button>

                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                          Create Event
                                        </div>
                                      </div>
                                    )}
                                  </h3>

                                  {dayEvents.length === 0 && !isPast ? (
                                    <div className="flex flex-col items-center gap-4">
                                      <img
                                        src="/event-buddi-whitelogo.png"
                                        alt="bg"
                                        className="h-8 w-8"
                                      />
                                      <p className="text-xs">No events</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      {dayEvents.map((ev) => (
                                        <>
                                          <Link
                                            to={`detail/${ev.event_id}`}
                                            key={ev._id}
                                            className="block px-3 py-2 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <p className="font-medium text-sm line-clamp-2">
                                              {ev.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {ev.location}
                                            </p>
                                          </Link>
                                        </>
                                      ))}
                                    </div>
                                  )}
                                </HoverCardContent>
                              </HoverCard>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <AppBottomNav />
    </>
  );
};

export default EventsPage;
