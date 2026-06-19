import { ArrowUp, Download, Funnel, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog";
import { useEffect, useState } from "react";
import {
  exportTransactions,
  getAllTransaction,
  getUserById,
  getWithdraw,
} from "../../services/services";
import moment from "moment";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import Loading from "../loading";
import Pagination from "../../components/shared/Pagination";
import DatePicker from "../../components/shared/Date";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router";
import TransactionDetail from "./TransactionDetail";

export default function PayoutHistory() {
  const [user, setUser] = useState<any>({});
  const [transactions, setTransactions] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchType, setSearchType] = useState<"txt_id" | "reference">(
    "txt_id",
  );
  const [searchValue, setSearchValue] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const initialFilters = {
    limit: "10",
    booking: "",
    status: "",
    mode: "",
    type: "",
    date: "",
    fromDate: "",
    toDate: "",
    txt_id: "",
    reference: "",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [transLoading, setTransLoading] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await getUserById(loggedInUser._id);
      if (res.data.status) {
        const data = res.data.response;
        setUser(data);
        setWithdrawAmount(data.current_balance.toFixed(2));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransaction = async () => {
    setTransLoading(true);
    const payload = {
      user: loggedInUser._id,
      page,
      limit: Number(filters.limit),
      txt_id: filters.txt_id,
      type: filters.type,
      mode: filters.mode,
      status: filters.status,
      date: filters.date,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      reference: filters.reference,
    };
    try {
      const res = await getAllTransaction(payload);
      if (res.data.status) {
        const data = res.data.response;
        setTransactions(data.transactions);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTransLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!loggedInUser?.account_details) {
      setIsOpen(false);
      navigate("/creator/profile");
      return toast.error("Please add you account details");
    }

    if (!withdrawAmount) return toast.error("Enter a valid amount");

    setLoading(true);
    const payload = {
      id: loggedInUser._id,
      withdrawal_amount: Number(withdrawAmount),
    };
    try {
      const res = await getWithdraw(payload);
      if (res.data.status) {
        toast.success(res.data.message);
        setIsOpen(false);
        setWithdrawAmount("");
        fetchUser();
        fetchTransaction();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
        error?.response?.message ||
        "Can't withdraw please try again later",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchTransaction();
  }, [filters, page]);

  const isFilterApplied = () => {
    return filters.date || filters.fromDate || filters.toDate || filters.type || filters.status || filters.mode;
  };

  const handleExportTransaction = async () => {
    setIsExporting(true);
    const payload = {
      user: loggedInUser._id,
      page,
      limit: Number(filters.limit),
      txt_id: filters.txt_id,
      type: filters.type,
       mode: filters.mode,
      status: filters.status,
      date: filters.date,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      reference: filters.reference,
    };
    try {
      const res = await exportTransactions(payload);
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
      <div className=" space-y-8 transition-all">
        <h1 className="text-lg flex-wrap md:text-2xl font-semibold text-gray-900 dark:text-white flex items-center justify-between mb-5 gap-4 md:gap-0 md:mb-7">
          Transactions & Payouts
          <Button size="sm" onClick={() => setIsOpen(true)}>
            <ArrowUp className="w-4 h-4" /> Payout
          </Button>
        </h1>

        {/* Settlement Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-300">
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="font-bold text-xl dark:text-green-400">
              ₹{user?.current_balance?.toFixed(2) || 0}
            </CardContent>
          </Card>

          <Card className="shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-300">
                Last Settelment
              </CardTitle>
            </CardHeader>
            <CardContent className="font-bold text-xl text-green-600 dark:text-white">
              ₹{user?.last_settelment?.toFixed(2) || 0}
            </CardContent>
          </Card>

          <Card className="shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-300">
                Manual Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="font-bold text-xl dark:text-white">
              ₹{user?.self_collected_amount?.toFixed(2) || 0}
            </CardContent>
          </Card>

          <Card className="shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-300">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="font-bold text-xl dark:text-white">
              ₹{user?.total_earning?.toFixed(2) || 0}
            </CardContent>
          </Card>
        </div>

        {/* Settlement History Table */}
        <Card className="shadow-sm dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white flex items-center gap-3 justify-between flex-wrap">
              <p> Transactions History</p>

              <div className="flex items-center gap-4 md:gap-2 flex-wrap">
                {/* SEARCH TYPE */}
                <Select
                  value={searchType}
                  onValueChange={(val: "txt_id" | "reference") => {
                    setSearchType(val);
                    setSearchValue("");
                  }}
                >
                  <SelectTrigger className="w-full md:w-[150px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="txt_id">Transaction ID</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                  </SelectContent>
                </Select>

                {/* SEARCH INPUT */}
                <div className="flex items-center gap-2">
                  <Input
                    type="search"
                    value={searchValue}
                    // onChange={(e) => setSearchValue(e.target.value)}
                    onChange={(e) => {
                      const value = e.target.value;

                      setSearchValue(value);

                      // Reset filters when search input is cleared
                      if (!value.trim()) {
                        setFilters((prev) => ({
                          ...prev,
                          txt_id: "",
                          reference: "",
                        }));

                        setPage(1);
                      }
                    }}
                    placeholder={
                      searchType === "txt_id"
                        ? "Enter transaction id"
                        : "Enter reference id"
                    }
                    className="w-full md:w-[180px] bg-white"
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
                        txt_id: searchType === "txt_id" ? searchValue : "",
                        reference:
                          searchType === "reference" ? searchValue : "",
                      });
                    }}
                  >
                    <Search />
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant={isFilterApplied() ? "default" : "outline"}
                  onClick={() => setOpenFilterDialog(true)}
                  className="w-full md:w-auto"
                >
                  <Funnel className="w-4 h-4" /> Filters
                </Button>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  onClick={handleExportTransaction}
                  disabled={isExporting}
                >
                  <Download /> {isExporting ? "Exporting" : "Export"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          {transLoading ? (
            <Loading />
          ) : (
            <>
              {transactions.length == 0 ? (
                <div className="flex flex-col items-center gap-4">
                  <img
                    src="/event-buddi-whitelogo.png"
                    alt="bg"
                    className="h-20 w-20"
                  />
                  <p>No transactions</p>
                </div>
              ) : (
                <>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="text-md">
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Amount (₹)</TableHead>
                          <TableHead>Fee (₹)</TableHead>
                          <TableHead>Net Amount (₹)</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {transactions.map((txt: any) => (
                          <TableRow
                            key={txt?._id}
                            className="hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => {
                              setDetailOpen(true);
                              setSelectedTransaction(txt);
                            }}
                          >
                            <TableCell className="font-medium">
                              {txt?.transaction_id}
                            </TableCell>
                            <TableCell>
                              {txt?.reference || txt?.payment_id || "-"}
                            </TableCell>
                            <TableCell>
                              {txt?.gross_amount?.toFixed(2)}
                            </TableCell>
                            <TableCell>{txt?.total_fee?.toFixed(2)}</TableCell>
                            <TableCell>{txt?.net_amount?.toFixed(2)}</TableCell>
                            <TableCell
                              className={`capitalize ${txt?.type == "debit"
                                  ? "text-red-500"
                                  : "text-green-700"
                                }`}
                            >
                              {txt?.type}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-xs capitalize ${txt?.status === "completed"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                  }`}
                              >
                                {txt?.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {moment(txt?.createdAt).format("DD MMM, YYYY")}
                            </TableCell>
                          </TableRow>
                        ))}
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
                </>
              )}
            </>
          )}
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw your money</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <div className="space-y-3">
              <Label htmlFor="withdrawAmount">Enter withdrawal amount</Label>
              <Input
                id="withdrawAmount"
                value={withdrawAmount}
                placeholder="Amount"
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="text-black"
                type="number"
                inputMode="numeric"
              />
            </div>
          </DialogDescription>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handleWithdraw} disabled={loading}>
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                defaultValue={filters.status}
                onValueChange={(val) =>
                  setTempFilters({ ...tempFilters, status: val })
                }
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={tempFilters.type}
                onValueChange={(val) =>
                  setTempFilters({ ...tempFilters, type: val })
                }
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mode */}
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select
                value={tempFilters.mode}
                onValueChange={(val) =>
                  setTempFilters({ ...tempFilters, mode: val })
                }
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="withdraw">Withdraw</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Select
                value={tempFilters.date}
                onValueChange={(val) =>
                  setTempFilters({ ...tempFilters, date: val })
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
            {tempFilters.date === "custom-range" && (
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
              size="sm"
              variant={"outline"}
              onClick={() => {
                setFilters(initialFilters);
                setTempFilters(initialFilters);
                setOpenFilterDialog(false);
                setPage(1);
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
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

      <TransactionDetail
        selectedTransaction={selectedTransaction}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
