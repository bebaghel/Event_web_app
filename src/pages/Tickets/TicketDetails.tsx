import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { checkPaymentStatus, getBookingByTin } from "../../services/services";
import Loading from "../loading";
import { Button } from "../../components/ui/button";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { toast } from "sonner";
import moment from "moment";
import QRCode from "react-qr-code";
import { mediaUrl } from "../../constants";

export default function TicketDetails() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const tin = searchParams.get("t"); // Get from query param

  // const template = searchParams.get("template");

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<any>(null);

  const [confPayment, setConfPayment] = useState(false);
  const [isCheck, setIsCheck] = useState(false);

  const ticketRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const fetchTicketDetails = async () => {
    if (!tin) return;
    try {
      const res = await getBookingByTin(tin);
      if (res.data.status) {
        const data = res.data.response;
        if (data.status == "Booked") {
          setConfPayment(true);
        }
        setTicket(res.data.response);
      }
    } catch (err: any) {
      console.log(err);
      toast.error(err?.message);
      if (err.status == 404) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    const element = ticketRef.current;

    // Capture the ticket as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
    });
    const imgData = canvas.toDataURL("image/jpeg");

    // Create a PDF (portrait A4)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
    pdf.save(`Ticket_${ticket?.tin}.pdf`);
  };

  const handleCheckPayment = async () => {
    setIsCheck(true);
    const payload = {
      order_id: ticket?.order_details?.id,
    };
    try {
      const res = await checkPaymentStatus(payload);
      console.log(res);
      if (res.data.status) {
        toast.success(res.data.message);
        fetchTicketDetails();
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsCheck(false);
    }
  };

  // console.log(ticketRef.current.getBoundingClientRect());

  useEffect(() => {
    fetchTicketDetails();
  }, [tin]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className=" justify-center">
          {confPayment ? (
            <div className="flex justify-center  ">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-md overflow-hidden">
                {eventId != "evt-XIH3223LLIA" && (
                  <div ref={ticketRef} className="pb-4">
                    {/* Header Tag */}
                    <div className="px-6 pt-6">
                      {/* <div className="flex items-center justify-between">
                        <img
                          src={`${mediaUrl}/event_images/${ticket.event?.image}`}
                          alt="logo"
                          className="w-14 h-14 object-contain rounded-md"
                        />
                      </div> */}
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-md text-gray-600 font-semibold">
                        TICKET
                      </span>

                      <h2 className="text-xl font-bold mt-3 text-gray-900">
                        {ticket.event?.title}
                      </h2>

                      <p className="text-sm text-gray-600 mt-2">
                        {moment(ticket.event?.start_at).format(
                          "DD MMM YYYY • hh:mm A",
                        )}
                        <br />
                        {ticket.event?.location}
                      </p>
                    </div>

                    {ticket.is_approved && (
                      <>
                        {/* Divider */}
                        <div className="my-4 border-t"></div>
                        {/* QR Code */}
                        <div className="flex justify-center">
                          <QRCode value={ticket.tin} className="h-46" />
                        </div>
                      </>
                    )}

                    {/* Divider */}
                    <div className="my-4 border-t"></div>

                    {/* Guest Info */}
                    <div className="px-6 pb-4 grid grid-cols-2 gap-y-3 text-sm">
                      <div>
                        <p className="text-gray-500">Guest</p>
                        <p className="font-medium text-gray-900">
                          {ticket?.user?.name}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-gray-500">Status</p>
                        <p className="font-semibold">
                          {ticket?.is_approved ? "Approved" : "Pending"}
                        </p>
                      </div>

                      {ticket?.ticket_info && (
                        <div>
                          <p className="text-gray-500">Ticket</p>
                          <p className="text-gray-900 font-medium">
                            {ticket?.ticket_info
                              ? `1×` + " " + ticket?.ticket_info?.name
                              : "Free"}
                          </p>
                        </div>
                      )}

                      {ticket?.meta && (
                        <div>
                          <p className="text-gray-500">Ticket</p>
                          <p className="text-gray-900 font-medium">
                            {`${ticket.meta?.guest_count} ×` +
                              " " +
                              ticket.meta?.ticket_type}
                          </p>
                        </div>
                      )}

                      <div className="text-right mt-5">
                        <p className="font-semibold text-green-600">
                          {ticket?.is_checked_in && "Checked In"}
                        </p>
                      </div>
                    </div>

                    {ticket.ticket_info && (
                      <div className="px-6 space-y-4 mb-2">
                        <div className="border-t border-gray-200"></div>
                        {/* Description */}
                        <div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {ticket.ticket_info?.description}
                          </p>
                        </div>
                        {/* Price Box */}
                        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-500 font-semibold">
                            Ticket Price
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {ticket.ticket_info?.price}{" "}
                            {ticket.ticket_info?.currency}
                          </p>
                        </div>
                      </div>
                    )}

                    {ticket?.event?.location_type == "Virtual" && (
                      <div className="px-6 md:px-30 w-full">
                        {ticket?.event?.virtual_link ? (
                          <Link to={ticket.event.virtual_link} target="_blank">
                            <Button className="w-full">
                              Join Virtual Event
                            </Button>
                          </Link>
                        ) : (
                          <Button className="w-full" disabled>
                            Join Virtual Event
                          </Button>
                        )}
                      </div>
                    )}
                    <p className="text-center text-xs mt-6 text-gray-400">
                      Assist Buddi Event © {new Date().getFullYear()} — powered
                      by{" "}
                      <a
                        href="https://www.assistbuddi.com/"
                        target="_blank"
                        className="text-blue-800"
                      >
                        Assist Buddi
                      </a>
                    </p>
                  </div>
                )}

                {eventId == "evt-XIH3223LLIA" && (
                  <>
                    <div className="px-2 py-6 ">
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-md text-gray-600 font-semibold">
                        TICKET / PASS
                      </span>

                      <h2 className="text-xl font-bold mt-3 text-gray-900">
                        {ticket.event?.title}
                      </h2>

                      <p className="text-sm text-gray-600 mt-2">
                        {moment(ticket.event?.start_at).format(
                          "DD MMM YYYY • hh:mm A",
                        )}
                        <br />
                        {ticket.event?.location}
                      </p>
                    </div>
                    <div
                      ref={ticketRef}
                      className="relative pb-4"
                      style={{
                        position: "relative",
                        width: "100%",
                        // maxWidth: "400px",
                        aspectRatio: "2 / 3",
                      }}
                    >
                      <img
                        src={`/images/assets/bb_temp.png`}
                        className="w-full h-auto"
                        alt="Ticket Template"
                        // style={{
                        //   width: "400px",
                        //   height: "600px",
                        //   objectFit: "cover",
                        // }}
                      />

                      {/* QR Code Overlay */}
                      <div
                        className="absolute top-[53%] md:top-[54%]"
                        style={{
                          left: "49.3%",
                          transform: "translate(-50%, -50%)",
                          width: "41%",
                        }}
                      >
                        <QRCode
                          value={ticket.tin}
                          className="w-full h-auto"
                          bgColor="#ffffff"
                        />
                      </div>

                      {/* Ticket Holder Name */}
                      <div
                        className="absolute top-[68%] md:top-[70%] text-nowrap text-center font-semibold px-3 py-1 rounded-md flex flex-col bg-white"
                        style={{
                          left: "50%",
                          transform: "translateX(-50%)",
                          // width: "100%",
                          fontSize: "16px",
                          color: "#000",
                          lineHeight: "1.3",
                        }}
                      >
                        {ticket?.user?.name || "Guest"}
                        {ticket.meta?.ticket_type && (
                          <span
                            style={{ fontSize: "12px" }}
                            className="text-gray-600"
                          >
                            {ticket.meta?.ticket_type}
                          </span>
                        )}
                      </div>

                      <p className="text-center text-xs mt-4 text-gray-400">
                        Assist Buddi Event © {new Date().getFullYear()} —
                        powered by{" "}
                        <a
                          href="https://www.assistbuddi.com/"
                          target="_blank"
                          className="text-blue-800"
                        >
                          Assist Buddi
                        </a>
                      </p>
                    </div>
                  </>
                )}

                {/* Footer Buttons */}
                {ticket.is_approved &&
                  ticket?.event?.location_type !== "Virtual" && (
                    <div className="px-6 py-4">
                      <Button onClick={handleDownload} className="w-full">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <div>
              <div className="h-[70vh] w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <img
                    src="/event-buddi-whitelogo.png"
                    alt="bg"
                    className="h-30 w-30"
                  />
                  <p className="font-normal text-lg">
                    {ticket?.order_details
                      ? "Ticket not confirmed yet, please wait if payment is done."
                      : "Ticket not booked yet, if payment done try to reload/refresh page in sometime."}
                  </p>

                  {ticket?.order_details && (
                    <Button onClick={handleCheckPayment} disabled={isCheck}>
                      {isCheck ? "Checking" : "Check Status"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
