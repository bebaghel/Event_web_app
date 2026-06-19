import { useEffect, useState } from "react";
import { getAvatarColor } from "../../utils/avatarColor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { getMembers, getUsers } from "../../services/services";
import moment from "moment";
import Loading from "../loading";
import { mediaUrl } from "../../constants";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import Pagination from "../../components/shared/Pagination";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import SearchSelect from "../../components/shared/SearchSelect";
import DatePicker from "../../components/shared/Date";
import { Label } from "../../components/ui/label";
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

import { Check, Funnel, X } from "lucide-react";
import { searchGuests } from "../../services/services";

export type RelatedUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  profilePic?: string;
  picture?: string;
};

export type Member = {
  _id: string;
  guest: object;
  createdAt: string;
  updatedAt: string;
  user: string;
};

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setloading] = useState(true);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [users, setUsers] = useState<RelatedUser[]>([]);
  const [openUserBox, setOpenUserBox] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedGuest, setSelectedGuest] =
    useState<RelatedUser | null>(null);

  const initialFilters = {
    limit: "10",
    date: "",
    fromDate: "",
    toDate: "",
    guest: "",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const fetchMembers = async () => {
    setloading(true);
    const payload = {
      user: user?._id,
      guest: filters.guest,
      limit: Number(filters.limit),
      page,
      date: filters.date,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    };

    try {
      const res = await getMembers(payload);

      if (res.data.status) {
        const data = res.data.response;
        setMembers(data.userRelation);
        setTotalPages(data.totalPages);
        setloading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [filters, page]);

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
            res.data.response.map((u: RelatedUser) => [u._id, u])
          ).values()
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

  const isFilterApplied = () => {
    return filters.date || filters.fromDate || filters.toDate || filters.guest;
  };
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="dark:bg-gray-900 transition-all">
          <div className=" mb-2 md:mb-6">
            <h2 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white flex items-center justify-between mb-5 md:mb-7">
              Guests
              <div className="flex items-center gap-2">
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
                {/* <Button size="sm">
                  <Download className="h-4 w-4" />
                </Button> */}
              </div>
            </h2>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length == 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-5 text-[1rem]"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <img
                            src="/event-buddi-whitelogo.png"
                            alt="bg"
                            className="h-20 w-20"
                          />
                          <p>No members</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {members?.map((person: any) => (
                        <TableRow
                          key={person?._id}
                          className="text-nowrap border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          <TableCell className="py-4 flex items-center gap-3 font-medium text-gray-900 dark:text-white">
                            {person?.guest?.profilePic ||
                              person?.guest?.picture ? (
                              <img
                                key={person?.guest?._id}
                                src={`${person?.guest?.profilePic
                                  ? `${mediaUrl}/user_profile_pics/${person?.guest?.profilePic}`
                                  : person?.guest?.picture
                                  } `}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                                  person?.guest?.name
                                )}`}
                              >
                                {person?.guest?.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            {person?.guest?.name}
                          </TableCell>

                          <TableCell className="text-gray-600 dark:text-gray-300">
                            {person?.guest?.email}
                          </TableCell>

                          <TableCell className="text-gray-600 dark:text-gray-300">
                            {person?.guest?.phone || "-"}
                          </TableCell>

                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {moment(person?.createdAt).format("DD MMM, YYYY")}
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
        </div>
      )}

      <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
        <DialogContent className=" bg-white">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* User Search */}
            <div className="space-y-2">
              <Label>Name/Email</Label>

              {/* <SearchSelect
                value={tempFilters.guest}
                placeholder="Search guests..."
                onChange={(val) =>
                  setTempFilters((f) => ({ ...f, guest: val }))
                }
                fetchData={async (q) => {
                  const res = await getUsers({ search: q, limit: 10 });
                  return res.data.response;
                }}
              /> */}
              <Popover open={openUserBox} onOpenChange={setOpenUserBox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {selectedGuest
                      ? selectedGuest.name
                      : "Search guests..."}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="p-0">
                  <Command>
                    <div className="relative">
                      <CommandInput
                        placeholder="Search guests..."
                        value={userSearch}
                        onValueChange={setUserSearch}
                        className="pr-8"
                      />

                      {userSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserSearch("");
                            setUsers([]);
                            setSelectedGuest(null);

                            setTempFilters({
                              ...tempFilters,
                              guest: "",
                            });
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <CommandEmpty>
                      {userSearch
                        ? "No guest found"
                        : "Search guest by name"}
                    </CommandEmpty>

                    <CommandGroup>
                      {users.map((usr) => {
                        const isSelected =
                          selectedGuest?._id === usr._id;

                        return (
                          <CommandItem
                            key={usr._id}
                            value={`${usr.name} ${usr.email}`}
                            onSelect={() => {
                              setTempFilters({
                                ...tempFilters,
                                guest: usr._id,
                              });

                              setSelectedGuest(usr);

                              setUserSearch(usr.name);

                              setOpenUserBox(false);
                            }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {usr.name}
                              </span>

                              <span className="text-xs text-gray-500">
                                {usr.email}
                              </span>
                            </div>

                            {isSelected && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Status */}
            {/* <div className="space-y-2">
              <Label>Mobile</Label>
              <Input type="tel" placeholder="Enter guest mobile" />
            </div> */}

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
    </>
  );
}
