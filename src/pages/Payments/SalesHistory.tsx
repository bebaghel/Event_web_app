import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  checkPaymentStatus,
  exportBookingData,
  getAllBooking,
  getEvents,
  searchGuests,
} from "../../services/services";
import Loading from "../loading";
import moment from "moment";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Download, Funnel, RefreshCcw, Search, X } from "lucide-react";
import { RelatedUser } from "../Members/Members";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../../components/ui/command";
import DatePicker from "../../components/shared/Date";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import Pagination from "../../components/shared/Pagination";
import { toast } from "sonner";
import { Label } from "../../components/ui/label";
import { BookingDetails } from "./BookingDetails";

export default function SalesHistory() {
  const [booking, setBooking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any>([]);
  const [users, setUsers] = useState<RelatedUser[]>([]);

  const [openUserBox, setOpenUserBox] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [spinIcon, setSpinIcon] = useState<string | null>(null);

  const [searchType, setSearchType] = useState<
    "tin" | "order_id" | "payment_id"
  >("tin");
  const [searchValue, setSearchValue] = useState("");
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<RelatedUser | null>(null);

  const initialFilters = {
    limit: "10",
    event: "",
    status: "",
    user: "",
    date: "",
    fromDate: "",
    toDate: "",
    tin: "",
    order_id: "",
    payment_id: "",
  };

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const fetchBooking = async () => {
    setBookingLoading(true);
    const payload = {
      organizer: user._id,
      limit: Number(filters.limit),
      page,
      event: filters.event,
      status: filters.status,
      user: filters.user,
      date: filters.date,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      tin: filters.tin,
      order_id: filters.order_id,
      payment_id: filters.payment_id,
    };
    try {
      const res = await getAllBooking(payload);
      if (res.data.status) {
        const data = res.data.response;
        // console.log(res.data.response.bookings);
        setBooking(data.bookings);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setBookingLoading(false);
    }
  };

  const fetchEvents = async () => {
    const payload = { organizer: user?._id };
    try {
      const res = await getEvents(payload);
      if (res.data.status) {
        setEvents(res.data.response);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (text = "") => {
    try {
      const payload = {
        search: text,
        limit: 20,
      };

      const res = await searchGuests(payload);

      if (res.data.status) {
        const uniqueUsers = Array.from(
          new Map(
            res.data.response.map((u: RelatedUser) => [u._id, u]),
          ).values(),
        ) as RelatedUser[];

        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!userSearch.trim()) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchUsers(userSearch);
    }, 400);

    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleCheckPaymentStatus = async (order_id: string) => {
    setSpinIcon(order_id);
    const payload = {
      order_id,
    };

    try {
      const res = await checkPaymentStatus(payload);
      if (res.data.status) {
        toast.success(res.data.message);
        fetchBooking();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSpinIcon(null);
    }
  };

  const isFilterApplied = () => {
    return (
      filters.date ||
      filters.fromDate ||
      filters.toDate ||
      filters.event ||
      filters.user ||
      filters.status
    );
  };

  useEffect(() => {
    fetchBooking();
  }, [filters, page]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (searchValue === "") {
      setFilters((prev) => ({
        ...prev,
        tin: "",
        order_id: "",
        payment_id: "",
      }));
    }
  }, [searchValue]);

  const handleExportBooking = async () => {
    setIsExporting(true);
    const payload = {
      organizer: user._id,
      limit: Number(filters.limit),
      page,
      event: filters.event,
      status: filters.status,
      user: filters.user,
      date: filters.date,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      tin: filters.tin,
      order_id: filters.order_id,
      payment_id: filters.payment_id,
    };
    try {
      const res = await exportBookingData(payload);
      if (res.data.status) {
        const { csv, fileName } = res.data.response;

        const blob = new Blob([csv], {
          type: "text/csv;charset=utf-8;",
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Can't export data try later");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white flex items-center flex-wrap gap-2 justify-between mb-5 md:mb-7">
            Event Bookings
            <div className="flex items-center gap-4 md:gap-2 flex-wrap">
              {/* SEARCH TYPE */}
              <Select
                value={searchType}
                onValueChange={(val: "tin" | "order_id" | "payment_id") => {
                  setSearchType(val);
                  setSearchValue("");
                }}
              >
                <SelectTrigger className="w-full md:w-[150px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tin">Ticket No</SelectItem>
                  <SelectItem value="order_id">Order Id</SelectItem>
                  <SelectItem value="payment_id">Payment Id</SelectItem>
                </SelectContent>
              </Select>

              {/* SEARCH INPUT */}
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={
                    searchType === "tin"
                      ? "Enter Ticket No"
                      : searchType === "order_id"
                        ? "Enter Order Id"
                        : "Enter Payment Id"
                  }
                  className="w-full md:w-[200px] bg-white"
                />

                {/* SEARCH BUTTON */}
                <Button
                  size="sm"
                  onClick={() => {
                    // if (!searchValue.trim()) {
                    //   return toast.error("Please enter valid value");
                    // }

                    setFilters({
                      ...filters,
                      tin: searchType === "tin" ? searchValue : "",
                      order_id: searchType === "order_id" ? searchValue : "",
                      payment_id:
                        searchType === "payment_id" ? searchValue : "",
                    });
                  }}
                >
                  <Search />
                </Button>
                <Button
                  size="sm"
                  variant={isFilterApplied() ? "default" : "outline"}
                  onClick={() => {
                    setTempFilters(filters);
                    setOpenFilterDialog(true);
                  }}
                >
                  <Funnel className="h-5 w-5" /> Filters
                </Button>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  onClick={handleExportBooking}
                  disabled={isExporting}
                >
                  <Download /> {isExporting ? "Exporting" : "Export"}
                </Button>
              </div>
            </div>
          </h2>
        </div>
        {/* Sales Table */}
        {bookingLoading ? (
          <Loading />
        ) : (
          <Card className="dark:bg-gray-800">
            <CardContent>
              <Table className="text-gray-800 dark:text-gray-200">
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket No</TableHead>
                    <TableHead>Order Id</TableHead>
                    <TableHead>Payment Id</TableHead>
                    <TableHead>Event Id</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {booking.length == 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="font-normal text-[1rem] text-center pt-10"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <img
                            src="/event-buddi-whitelogo.png"
                            alt="bg"
                            className="h-20 w-20"
                          />
                          <p>No Bookings</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {booking.map((item: any) => (
                        <TableRow key={item._id}>
                          <TableCell
                            className="font-medium text-blue-700 underline cursor-pointer"
                            onClick={() => {
                              setShowBookingDetails(true);
                              setSelectedBooking(item);
                            }}
                          >
                            #{item.tin}
                          </TableCell>
                          <TableCell>{item.order_details?.id || "-"}</TableCell>
                          <TableCell>
                            {item.payment_details?.id || "-"}
                          </TableCell>
                          <TableCell>{item.event?.event_id}</TableCell>
                          <TableCell>{item?.user?.name || "-"}</TableCell>
                          <TableCell className="px-4 py-3 font-semibold">
                            {item?.ticket_info
                              ? `${
                                  item?.ticket_info?.currency === "INR"
                                    ? "₹"
                                    : "$"
                                } ${item?.ticket_info?.price?.toFixed(2)} `
                              : "Free"}
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                            <span
                              className={`px-2 py-1 text-xs rounded-md ${
                                item?.status === "Booked"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : item.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {item.status}
                            </span>
                            <span>
                              {item?.status !== "Booked" && (
                                <RefreshCcw
                                  className={`h-3 w-3 cursor-pointer ${
                                    spinIcon == item?.order_details?.id &&
                                    "animate-spin text-gray-400 pointer-events-none"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCheckPaymentStatus(
                                      item?.order_details?.id,
                                    );
                                  }}
                                />
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            {moment(item?.createdAt).format("DD MMM, YYYY")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>

            <CardFooter>
              <Pagination
                page={page}
                totalPages={totalPages}
                limit={filters.limit}
                onLimitChange={(val) =>
                  setFilters((f) => ({ ...f, limit: val }))
                }
                onPageChange={(val) => setPage(val)}
              />
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Filters Dialog */}
      <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
        <DialogContent className="bg-white w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* User Search */}
            <div className="space-y-2">
              <Label>Select guest</Label>
              <Popover open={openUserBox} onOpenChange={setOpenUserBox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {tempFilters.user
                      ? users.find((u) => u._id === tempFilters.user)?.name
                      : "Search guests..."}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search guests..."
                      value={userSearch}
                      onValueChange={(text) => {
                        setUserSearch(text);
                        fetchUsers(text);
                      }}
                    />
                    <CommandEmpty>No guest found</CommandEmpty>

                    <CommandGroup>
                      {users.map((usr) => (
                        <CommandItem
                          key={usr._id}
                           value={`${usr.name} ${usr.email ?? ""}`}
                          onSelect={() => {
                            setTempFilters({
                              ...tempFilters,
                              user: usr._id,
                            });
                            setOpenUserBox(false);
                          }}
                        >
                          {usr?.name} ({usr?.email})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Event */}
            <div className="space-y-2">
              <Label>Event</Label>
              <Select
                value={tempFilters.event}
                onValueChange={(v) =>
                  setTempFilters({ ...tempFilters, event: v })
                }
              >
                <SelectTrigger className="bg-white  w-full min-w-0 overflow-hidden">
                  <SelectValue
                    placeholder="Select Event"
                    className="block truncate max-w-full"
                  />
                </SelectTrigger>
                <SelectContent className="max-w-[95vw]">
                  {events.map((ev: any) => (
                    <SelectItem
                      key={ev._id}
                      value={ev._id}
                      className="block max-w-full truncate"
                    >
                      {ev.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={tempFilters.status}
                onValueChange={(v) =>
                  setTempFilters({ ...tempFilters, status: v })
                }
              >
                <SelectTrigger className="bg-white w-full min-w-0 overflow-hidden whitespace-normal">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Booked">Booked</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Not Booked">Not Booked</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Select
                value={tempFilters.date}
                onValueChange={(v) =>
                  setTempFilters({ ...tempFilters, date: v })
                }
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                  <SelectItem value="last90days">Last 90 days</SelectItem>
                  <SelectItem value="custom-range">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {tempFilters.date == "custom-range" && (
              <div className="grid grid-cols-2 gap-3">
                <DatePicker
                  placeholder="From"
                  value={
                    tempFilters.fromDate ? new Date(tempFilters.fromDate) : null
                  }
                  onChange={(d) =>
                    setTempFilters({
                      ...tempFilters,
                      fromDate: moment(d).format("YYYY-MM-DD"),
                    })
                  }
                />
                <DatePicker
                  placeholder="To"
                  value={
                    tempFilters.toDate ? new Date(tempFilters.toDate) : null
                  }
                  onChange={(d) =>
                    setTempFilters({
                      ...tempFilters,
                      toDate: moment(d).format("YYYY-MM-DD"),
                    })
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFilters(initialFilters);
                setTempFilters(initialFilters);
                setSelectedGuest(null);
                setUserSearch("");
                setOpenFilterDialog(false);
              }}
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                setFilters(tempFilters);
                setOpenFilterDialog(false);
              }}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BookingDetails
        isOpen={showBookingDetails}
        booking={selectedBooking}
        onClose={() => setShowBookingDetails(false)}
      />
    </>
  );
}
