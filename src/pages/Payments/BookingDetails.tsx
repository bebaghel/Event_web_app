import { X, Calendar, User, Ticket, CreditCard } from "lucide-react";
import moment from "moment";

type BookingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
};

export const BookingDetails = ({
  isOpen,
  onClose,
  booking,
}: BookingDialogProps) => {
  if (!isOpen || !booking) return null;

  const {
    tin,
    status,
    booking_date,
    event,
    user,
    ticket_info,
    final_price,
    payment_details,
    registration_answers,
    is_booked_by_organizer,
  } = booking;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50">
      <div className="fixed right-0 h-full bg-white w-full sm:w-[50%] lg:w-[35%] xl:w-[30%] shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Booking Details</h2>
          </div>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 hover:text-black" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <p className="text-sm">
              Ticket Number: <span className="font-semibold">{tin}</span>
            </p>
          </div>

          {/* Event Info */}
          <p className="font-medium">For {event?.title}</p>

          {/* User Info */}
          <Section title="User" icon={<User className="h-4 w-4" />}>
            <InfoRow label="Name" value={user?.name} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Phone" value={user?.phone} />
            <InfoRow
              label="Registered on"
              value={moment(booking_date).format("DD MMM, YYYY")}
            />
            <div className="flex justify-between items-center text-gray-500">
              Status
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  status === "Booked"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {status}
              </span>
            </div>
          </Section>

          {/* Ticket Info */}
          <Section title="Ticket" icon={<Ticket className="h-4 w-4" />}>
            <InfoRow label="Ticket Name" value={ticket_info?.name || "Free"} />
            <InfoRow
              label="Price"
              value={`${ticket_info?.currency || ""} ${final_price}`}
            />
            <InfoRow
              label="Booked By Organizer"
              value={is_booked_by_organizer ? "Yes" : "No"}
            />
          </Section>

          {/* Payment Info */}
          {payment_details && (
            <Section title="Payment" icon={<CreditCard className="h-4 w-4" />}>
              <InfoRow label="Status" value={payment_details.status} />
              <InfoRow label="Method" value={payment_details.method} />
              <InfoRow label="Order ID" value={payment_details.order_id} />
              <InfoRow label="Payment ID" value={payment_details.id} />
            </Section>
          )}

          {/* Registration Answers */}
          <Section title="Registration Answers">
            {registration_answers?.length ? (
              <div className="space-y-3">
                {registration_answers.map((ans: any) => (
                  <div
                    key={ans._id}
                    className="p-3 rounded-md bg-gray-50 border"
                  >
                    <p className="text-sm font-medium text-gray-700">
                      {ans.ques}
                    </p>
                    <p className="text-sm text-gray-600">{ans.answer || "—"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No answers provided</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};

/* ---------- Reusable UI helpers ---------- */

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
      {icon}
      {title}
    </div>
    <div className="text-sm">{children}</div>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex justify-between gap-4 space-y-1">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 text-right">{value || "—"}</span>
  </div>
);
