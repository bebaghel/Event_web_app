import { CalendarPlus, ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router";
import {
  Users,
  Tags,
  QrCode,
  Wallet,
  Smartphone,
  ClipboardList,
  IdCard,
  TrendingUp,
  PenTool,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  const handleGetStarted = () => {
    if (user) {
      navigate("/creator/events/add");
    } else {
      navigate("/signin");
    }
  };
  return (
    <>
      {/* HERO SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 items-center justify-between mb-12 ">
        {/* Left Section */}
        <div className="order-2 md:order-1 mt-0">
          <h1 className="text-3xl md:text-5xl lg:text-5xl  font-bold leading-tight text-gray-900 dark:text-white">
            Create, Promote & Manage{" "}
            <span className="text-purple-900">Events</span> Effortlessly
          </h1>

          <p className="mt-5 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
            Assist Buddi Event  helps you organize registrations, track attendees,
            manage check-ins, sell tickets, and monitor payouts — all in one
            place.
          </p>

          <div className="mt-8 flex gap-4 text-nowrap w-full">
            <button
              onClick={handleGetStarted}
              className="flex items-center gap-2 bg-purple-900 hover:bg-purple-800 text-white px-4 py-2 md:px-6 md:py-3 font-medium rounded-lg transition text-sm"
            >
              <CalendarPlus className="h-5 w-5" /> Get Started Free
            </button>

            <Link
              to="/explore-events"
              className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 md:px-6 md:py-3  font-medium rounded-lg text-gray-800 dark:text-gray-200 transition text-sm"
            >
              Explore Events <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* ✅ Trusted badges */}
          <p className="mt-6 mb-4 text-sm text-gray-500 dark:text-gray-400">
            Trusted by creators, organizers & communities worldwide
          </p>

          <p className="inline-flex gap-3 text-sm font-semibold text-gray-600 mb-2 border border-purple-300 rounded-full px-3 py-2 bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="h-5 w-5 text-purple-900 animate-pulse drop-shadow-[0_0_8px_rgba(147,51,234,0.9)]"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>
            Powered by AI
          </p>
        </div>

        {/* Right Section */}
        <div className="order-1 md:order-2 mb-5 md:mb-0 md:ps-5">
          <img
            src="/images/assets/event_buddi_hero.gif"
            alt="Assist Buddi Event  Hero"
            className="h-full w-full"
            style={{ borderRadius: "10%" }}
          />
        </div>
      </section>

      {/* WHAT IS Assist Buddi Event  SECTION */}
      {/* <section className="relative mt-35">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid place-items-center text-center">
            <div>
              <span className="inline-flex items-center justify-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200">
                <Sparkles className="w-4 h-4" />
                What is Assist Buddi Event ?
              </span>

              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                A Smart, AI-Powered Event Ecosystem
              </h2>

              <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
                <strong>Assist Buddi Event </strong> is a modern event technology platform
                built to help creators, businesses, and communities plan,
                manage, and scale events with measurable outcomes.
              </p>

              <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
                From registrations and ticketing to check-ins, CRM, payments,
                and analytics — Assist Buddi Event  brings everything together in one
                intelligent ecosystem powered by automation and AI.
              </p>

              <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
                The name <strong>KRA (Key Result Areas)</strong> reflects our
                focus on performance, clarity, and real results — not just event
                execution.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* EVENTS SECTION */}
      <section className="md:pt-24 md:pb-10  dark:bg-gray-900">
        <div className=" space-y-24">
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <img
              src="/images/assets/event_buddi_smart_ticket.png"
              alt="Ticket Management"
              className="h-full w-full"
            />
            {/* <img
              src={img1}
              alt="Ticket Management"
              className="h-full"
            /> */}
            <div className="">
              <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Smart Ticketing & Payments
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Sell and manage tickets effortlessly. Set multiple ticket tiers,
                track real-time sales, and accept secure online payments
                directly through Assist Buddi Event.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Tags
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Dynamic pricing & discounts</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <QrCode
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>QR-based ticket</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Wallet
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>

                  <span>Instant payout tracking</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 2 - reversed layout */}
          <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1 ">
              <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Seamless Check-ins
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Simplify event entry with mobile or tablet scanning. Track
                real-time attendee flow and prevent duplicate check-ins with
                smart automation.
              </p>
              <ul className="mt-5 space-y-2 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <QrCode
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>QR scan check-ins</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Users
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Real-time guest tracking</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <IdCard
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Instant badge generation</span>
                </li>
              </ul>
            </div>
            {/* <img
              src="https://oveit.com/wp-content/uploads/2025/01/mobile-wallet-oveit-pay.png"
              alt="Checkin System"
              className="order-1 md:order-2 h-full"
            /> */}
            <img
              src="/images/assets/event_buddi_checkin.png"
              alt="Checkin System"
              className="order-1 md:order-2 h-full w-full"
            />
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* <img
              src={img3}
              alt="Smart Event CRM Dashboard"
              className="h-full"
            /> */}
            <img
              src="/images/assets/event_buddi_crm.png"
              alt="Smart Event CRM Dashboard"
              className="h-full w-full"
            />
            <div>
              <h2 className="text-2xl  lg:text-4xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Smart Event CRM
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Manage all your event relationships in one place. Assist Buddi Event’s
                CRM lets you capture leads, track attendees, and automate
                communications to build strong connections with your audience.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Users
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Centralized attendee database</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Tags
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Automated follow-ups & reminders</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <TrendingUp
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Advanced segmentation & insights</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1">
              <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold text-gray-900 dark:text-white">
                RSVP Management
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Simplify guest confirmations and stay informed about attendee
                intent. Assist Buddi Event tracks every RSVP and updates your event
                roster in real time.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <QrCode
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>One-click RSVP links</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Users
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Real-time confirmation tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Wallet
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Smart reminder notifications</span>
                </li>
              </ul>
            </div>
            <img
              src="/images/assets/event_buddi_rsvp.png"
              alt="RSVP Management Interface"
              className="h-full w-full order-1 md:order-2 "
            />
            {/* <img
              src={img4}
              alt="RSVP Management Interface"
              className="h-full order-1 md:order-2 "
            /> */}
          </div>

          {/* Feature 5 */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <img
              src="/images/assets/event_buddi_custom.png"
              alt="Custom Event Website Builder"
              className="h-full w-full"
            />
            {/* <img
              src={img5}
              alt="Custom Event Website Builder"
              className="h-full"
            /> */}
            <div>
              <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Custom Event Websites
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Create beautiful event landing pages without any coding.
                Customize themes, showcase schedules, and collect registrations
                directly from your own domain.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                {/* <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Laptop
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Drag-and-drop page builder</span>
                </li> */}
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <ClipboardList
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Built-in registration forms</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <TrendingUp
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>SEO & mobile optimized layouts</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1 ">
              <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Event Registration & Payments
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Streamline registration with secure payment integration and
                real-time attendee tracking — all within a single platform.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Wallet
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Multi-tier ticket options</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <QrCode
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Secure online payments</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Users
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Instant registration confirmations</span>
                </li>
              </ul>
            </div>
            <img
              src="/images/assets/event_buddi_registration.png"
              alt="Event Registration and Payments System"
              className="order-1 md:order-2 h-full w-full"
            />
            {/* <img
              src={img6}
              alt="Event Registration and Payments System"
              className="order-1 md:order-2 h-full"
            /> */}
          </div>

          {/* Feature 7 */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <img
              src="/images/assets/event_buddi_mob.png"
              alt="Mobile Event App Interface"
              className="h-full w-full"
            />
            {/* <img
              src={img7}
              alt="Mobile Event App Interface"
              className="h-full"
            /> */}
            <div>
              <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Mobile Event App
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Keep attendees engaged with a dedicated mobile app for your
                event. Provide real-time updates, schedules, and interactive
                features right in their hands.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Smartphone
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Event schedule & notifications</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Users
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Interactive attendee engagement</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <QrCode
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Live updates & announcements</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 8 */}
          <div className="grid md:grid-cols-2 gap-10 items-center mt-16">
            {/* LEFT SIDE – TEXT */}
            <div className="order-2 md:order-1">
              <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Create Events Instantly with AI
              </h2>

              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Save time by generating complete event plans in seconds. Our AI
                assistant helps you create event descriptions, schedules, ticket
                types, and more with just a simple prompt.
              </p>

              <ul className="mt-5 space-y-2 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Sparkles
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>AI-generated event descriptions</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <PenTool
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Auto-create schedules & agendas</span>
                </li>

                {/* <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Ticket
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Smart ticket type suggestions</span>
                </li> */}
              </ul>
            </div>

            {/* RIGHT SIDE – IMAGE */}
            <img
              src="/images/assets/ai-powered-home.png"
              alt="AI Event Creator"
              className="order-1 md:order-2 h-full w-full"
            />
          </div>

          {/* Feature 9 */}

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-2">
              <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Badge & ID Generation
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Instantly generate personalized badges and IDs for attendees
                with integrated QR codes and custom branding to ensure smooth
                check-ins.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <IdCard
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Automatic badge printing</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <QrCode
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>QR integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Tags
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Custom templates & layouts</span>
                </li>
              </ul>
            </div>

            <img
              src="/images/assets/eb_badge.png"
              alt="Event Registration and Payments System"
              className="h-full w-full order-1 md:order-1"
            />
          </div>

          {/* feature 10 */}

          <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1 ">
              <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Advanced Event Management
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Plan, coordinate, and manage all event operations efficiently —
                from vendor coordination to on-site logistics — with our
                integrated event management suite.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <ClipboardList
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>End-to-end planning tools</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Users
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Task & vendor tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <TrendingUp
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Real-time status monitoring</span>
                </li>
              </ul>
            </div>
            <img
              src="/images/assets/eb_advance.png"
              alt="Event Management Dashboard"
              className="h-full w-full order-1 md:order-2 "
            />
            {/* <img
              src={img8}
              alt="Event Management Dashboard"
              className="h-full order-1 md:order-2 "
            /> */}
          </div>

          {/* <div className="grid md:grid-cols-2 gap-10 items-center mt-20">

  <img
    src="/images/assets/event_ai_create.png"
    alt="AI Event Creation"
    className="order-1 h-full w-full rounded-xl shadow-lg"
  />


  <div className="order-2">
    <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold text-gray-900 dark:text-white">
      Create Events Instantly with AI
    </h2>

    <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
      Generate complete event setups in seconds. Let AI craft titles, 
      descriptions, schedules, and more — saving you hours of manual work.
    </p>

    <ul className="mt-5 space-y-2 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
      <li className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
          <Sparkles className="w-5 h-5 text-purple-900 dark:text-purple-100" />
        </div>
        <span>AI-Generated Event Titles & Descriptions</span>
      </li>

      <li className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
          <LayoutTemplate className="w-5 h-5 text-purple-900 dark:text-purple-100" />
        </div>
        <span>Auto-created Layouts & Schedules</span>
      </li>

      <li className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
          <Wand2 className="w-5 h-5 text-purple-900 dark:text-purple-100" />
        </div>
        <span>Smart Suggestions for Better Engagement</span>
      </li>
    </ul>

  </div>
</div> */}

          {/* <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1 ">
              <h2 className="text-2xl lg:text-5xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Smart Access Control
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Enable secure, contactless entry with QR or face recognition.
                Monitor entry logs and restrict unauthorized access with smart
                verification.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <ShieldCheck
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Contactless check-ins</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Users
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Real-time access logs</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <TrendingUp
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Multi-level security options</span>
                </li>
              </ul>
            </div>
            <img
              src="https://static.inevent.com/images/event-marketing-v2.webp"
              alt="Custom Event Website Builder"
              className="h-full order-1 md:order-2 "
            />
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <img
              src="https://www.eventact.com/Images/home/event-management.png"
              alt="RSVP Management Interface"
              className="h-full"
            />
            <div>
              <h2 className="text-2xl lg:text-5xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Intelligent RSVP System
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Use AI-powered tools to predict attendance, optimize follow-ups,
                and ensure higher participation with intelligent RSVP analytics.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <TrendingUp
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Predictive attendance forecasting</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Users
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Personalized follow-up automation</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <QrCode
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Real-time engagement insights</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1 ">
              <h2 className="text-2xl lg:text-5xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Sales & Payout Tracking
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Track your event’s financial performance with real-time
                reporting. Manage ticket sales, refunds, and payouts seamlessly
                within one dashboard.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <TrendingUp
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Real-time revenue reports</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Wallet
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Instant payout summaries</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <ShieldCheck
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Secure financial reconciliation</span>
                </li>
              </ul>
            </div>
            <img
              src="https://images.g2crowd.com/uploads/attachment/file/1325140/cm-event-management_2x.png"
              alt="Smart Event CRM Dashboard"
              className="h-full order-1 md:order-2"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <img
              src="https://www.esri.in/content/dam/distributor-share/esri-in/products/about-arcgis/overview-banner-screen-2-esri-india.png"
              alt="Real-time Analytics"
              className="h-full"
            />
            <div>
              <h2 className="text-2xl lg:text-5xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Real-time Analytics & Insights
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Gain valuable insights into ticket sales, attendance trends, and
                revenue performance. Assist Buddi Event’s analytics dashboard helps you
                visualize growth, track audience engagement, and optimize your
                future event strategies.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <TrendingUp
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Comprehensive performance dashboards</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Users
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Live attendee & engagement reports</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <QrCode
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>AI-driven event success insights</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1 ">
              <h2 className="text-2xl lg:text-5xl md:text-4xl font-bold text-gray-900 dark:text-white">
                AI-Powered Event Automation
              </h2>

              <p className="mt-4 text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                Assist Buddi Event  uses intelligent tools to automate reminders,
                predict attendance, and personalize guest engagement — so you
                can focus on creating memorable experiences.
              </p>

              <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-200 text-md lg:text-lg font-semibold">
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <TrendingUp
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Predictive RSVP tracking</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Mail
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Automated email campaigns</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                    <Users
                      className="w-5 h-5 text-purple-900 dark:text-purple-100"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Smart audience recommendations</span>
                </li>
              </ul>
            </div>
            <img
              src="https://images.ctfassets.net/t21gix3kzulv/5WjrhC242VpEpuDUjkn6QI/9e48b5423c30cb89bb7c159bd68bf1c2/ST-ui-graphic-event-overview-photo-001.png"
              alt="AI-Powered Event Automation"
              className="rounded-xl shadow-lg h-full order-1 md:order-2 "
            />
          </div> */}
        </div>
      </section>

      {/* <EventsPage /> */}
    </>
  );
}
