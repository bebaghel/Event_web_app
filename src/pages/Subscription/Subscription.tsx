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
  check_subscription_payment,
  get_subscription,
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
import { RefreshCcw, Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import Pagination from "../../components/shared/Pagination";
import { toast } from "sonner";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [spinIcon, setSpinIcon] = useState<string | null>(null);

  const [searchType, setSearchType] = useState<
    "subs_id" | "order_id" | "payment_id"
  >("subs_id");
  const [searchValue, setSearchValue] = useState("");

  const initialFilters = {
    limit: "10",
    status: "",
    subs_id: "",
    order_id: "",
    payment_id: "",
  };

  const [filters, setFilters] = useState(initialFilters);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const fetchSubscriptions = async () => {
    const payload = {
      userId: user?._id,
      limit: Number(filters.limit),
      page,
      status: filters.status,
      subs_id: filters.subs_id,
      order_id: filters.order_id,
      payment_id: filters.payment_id,
    };
    try {
      const res = await get_subscription(payload);
      if (res.data.status) {
        const data = res.data.response;
        setSubscriptions(data.subscriptions);
        setTotalPages(data.totalPages);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckPaymentStatus = async (order_id: string) => {
    setSpinIcon(order_id);
    const payload = {
      order_id,
    };

    try {
      const res = await check_subscription_payment(payload);
      if (res.data.status) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSpinIcon(null);
      fetchSubscriptions();
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [filters, page]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white flex items-center flex-wrap gap-2 justify-between mb-5 md:mb-7">
                My Subscriptions
                <div className="flex items-center gap-4 md:gap-2 flex-wrap">
                  {/* SEARCH TYPE */}
                  <Select
                    value={searchType}
                    onValueChange={(
                      val: "subs_id" | "order_id" | "payment_id",
                    ) => {
                      setSearchType(val);
                      setSearchValue("");
                    }}
                  >
                    <SelectTrigger className="w-full md:w-[150px] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subs_id">Sub Id</SelectItem>
                      <SelectItem value="order_id">Order Id</SelectItem>
                      <SelectItem value="payment_id">Payment Id</SelectItem>
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

                        // Reset filters when input is cleared
                        if (!value.trim()) {
                          setFilters((prev) => ({
                            ...prev,
                            subs_id: "",
                            order_id: "",
                            payment_id: "",
                          }));

                          setPage(1);
                        }
                      }}
                      placeholder={
                        searchType === "subs_id"
                          ? "Enter Subscription Id"
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
                          subs_id: searchType === "subs_id" ? searchValue : "",
                          order_id:
                            searchType === "order_id" ? searchValue : "",
                          payment_id:
                            searchType === "payment_id" ? searchValue : "",
                        });
                      }}
                    >
                      <Search />
                    </Button>
                    {/* <Button size={"sm"}>
                    <Download />
                  </Button> */}
                  </div>
                </div>
              </h2>
            </div>
            {/* Sales Table */}
            <Card className="dark:bg-gray-800">
              <CardContent>
                <Table className="text-gray-800 dark:text-gray-200">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscription Id</TableHead>
                      <TableHead>Order Id</TableHead>
                      <TableHead>Payment Id</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount (₹)</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {subscriptions.length == 0 ? (
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
                            <p>No subscriptions</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {subscriptions.map((item: any) => (
                          <TableRow key={item._id}>
                            <TableCell className="font-medium">
                              #{item.subs_id}
                            </TableCell>
                            <TableCell>
                              {item.order_details?.id || "-"}
                            </TableCell>
                            <TableCell>
                              {item.payment_details?.id || "-"}
                            </TableCell>
                            <TableCell>{item?.plan}</TableCell>
                            <TableCell>{item?.final_price}</TableCell>
                            <TableCell className="capitalize">
                              {item?.billing_cycle}
                            </TableCell>
                            <TableCell className="flex items-center gap-1">
                              <span
                                className={`px-2 py-1 text-xs rounded-md capitalize ${item?.status === "active"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    : item.status === "pending"
                                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                  }`}
                              >
                                {item?.status}
                              </span>
                              <span>
                                {item?.status !== "active" && (
                                  <RefreshCcw
                                    className={`h-3 w-3 cursor-pointer ${spinIcon == item?.order_details?.id &&
                                      "animate-spin text-gray-400 pointer-events-none"
                                      }`}
                                    onClick={() =>
                                      handleCheckPaymentStatus(
                                        item?.order_details?.id,
                                      )
                                    }
                                  />
                                )}
                              </span>
                            </TableCell>
                            <TableCell>
                              {moment(item?.start_date).format("DD MMM, YYYY")}
                            </TableCell>
                            <TableCell>
                              {moment(item?.expiry_date).format("DD MMM, YYYY")}
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
        </>
      )}
    </>
  );
}
