import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { Badge } from "../../components/ui/badge";
import moment from "moment";

interface TransactionDetailProps {
  selectedTransaction: any;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetail = ({
  selectedTransaction,
  isOpen,
  onClose,
}: TransactionDetailProps) => {
  if (!selectedTransaction) return null;

  const txt = selectedTransaction;

  const isUSD = txt.booking?.payment_details?.currency === "USD";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">
            Transaction Details
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 text-sm px-4 pb-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Status</span>
            <Badge
              variant="outline"
              className={`capitalize ${
                txt.status === "completed"
                  ? "border-green-500 text-green-600"
                  : txt.status === "pending"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-red-500 text-red-600"
              }`}
            >
              {txt.status}
            </Badge>
          </div>

          {/* Transaction ID */}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-medium">{txt.transaction_id}</span>
          </div>

          {/* User Info */}
          {txt?.booking && (
            <div className="border-t pt-4 space-y-2">
              <p className="font-semibold">User Details</p>
              <div className="flex justify-between">
                <span>Name</span>
                <span>{txt?.booking?.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Email</span>
                <span>{txt?.booking?.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone</span>
                <span>{txt?.booking?.user?.phone}</span>
              </div>
            </div>
          )}

          {/* Amount Info */}
          {txt.mode == "withdraw" ? (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Withdrawl Amount</span>
                <span>₹{txt.gross_amount?.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="border-t pt-4 space-y-2">
              <p className="font-semibold">Amount Breakdown</p>
              <div className="flex justify-between">
                <span>Gross Amount</span>
                <span>₹{txt.gross_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Charges{" "}
                  <span className="text-[12px] text-gray-500">
                    (Platform + PG)
                  </span>
                </span>
                <span className="text-red-500">
                  ₹{txt.total_fee?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-base">
                <span>Net Amount</span>
                <span>₹{txt.net_amount?.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Price breakdown for USD */}
          {isUSD && (
            <div className="border rounded-md p-3 bg-muted/30">
              <details>
                <summary className="cursor-pointer font-medium text-sm">
                  View Breakdown
                </summary>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Customer Paid (USD)</span>
                    <span>
                      ${(txt.booking?.payment_details?.amount / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Converted Amount (INR)</span>
                    <span>₹{txt.gross_amount?.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>PG Charges</span>
                    <span>
                      ₹
                      {(
                        (txt.booking?.payment_details?.fee +
                          txt.booking?.payment_details?.tax) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>PF Charges</span>
                    <span>
                      ₹
                      {(
                        Number(txt.total_fee) -
                        Number(
                          (txt.booking?.payment_details?.fee +
                            txt.booking?.payment_details?.tax) /
                            100,
                        )
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Total Charges</span>
                    <span className="text-red-500">
                      ₹{txt.total_fee?.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Net Amount</span>
                    <span className="text-green-600">
                      ₹{txt.net_amount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* Type */}
          <div className="flex justify-between border-t pt-4">
            <span>Type</span>
            <span
              className={`capitalize font-medium ${
                txt.type === "debit" ? "text-red-500" : "text-green-600"
              }`}
            >
              {txt.type}
            </span>
          </div>

          {/* Mode */}
          <div className="flex justify-between">
            <span>Mode</span>
            <Badge variant={"outline"} className="capitalize text-[13px]">
              {txt.mode}
            </Badge>
          </div>

          {txt.mode === "withdraw" && txt.status === "completed" && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Order Id</span>
                <span>{txt.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Id</span>
                <span>{txt.payment_id}</span>
              </div>
            </div>
          )}

          {/* Method */}
          <div className="flex justify-between">
            <span>Payment Method</span>
            <span className="capitalize">
              {txt?.booking?.payment_details?.method}{" "}
              {txt?.booking?.payment_details?.wallet
                ? ` (${txt.booking.payment_details.wallet})`
                : ""}
            </span>
          </div>

          {/* Date */}
          {txt.mode === "withdraw" && txt.status === "completed" ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Request Date</span>
                <span>{moment(txt.createdAt).format("DD MMM, YYYY")}</span>
              </div>
              <div className="flex justify-between">
                <span>Settelment Date</span>
                <span>{moment(txt.updatedAt).format("DD MMM, YYYY")}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <span>Date</span>
              <span>
                {moment(txt.createdAt).format("DD MMM YYYY, hh:mm A")}
              </span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TransactionDetail;
