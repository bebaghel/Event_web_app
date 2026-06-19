import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
// import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Events from "./pages/Events/Events";
import AddEvent from "./pages/Events/AddEvent";
import EventDetails from "./pages/Events/EventDetails";
import Members from "./pages/Members/Members";
import SalesHistory from "./pages/Payments/SalesHistory";
import PayoutHistory from "./pages/Payments/PayoutHistory";
import TicketDetails from "./pages/Tickets/TicketDetails";
import Exp_Events from "./pages/Explore-Events/Exp_Events";
import Evt_Page from "./pages/Explore-Events/Evt_Page";
import Exp_EventDetails from "./pages/Explore-Events/Exp_EventDetails";
import Layout from "./layout/Layout";
import Pricing from "./pages/Pricing/Pricing";
import Subscriptions from "./pages/Subscription/Subscription";
import PublicUser from "./pages/Explore-Events/PublicUser";
import Page from "./pages/EventPage/Page";
import CreatePage from "./pages/EventPage/CreatePage";
import BadgeGenerator from "./pages/BadgeGanerator/BadgeGanerator";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route index path="/" element={<Home />} />

            <Route path="/pricing" element={<Pricing />} />
            {/* Tickets */}
            <Route path="/ticket/:eventId" element={<TicketDetails />} />

            {/* Explore Events */}
            <Route path="/explore-events" element={<Exp_Events />} />
            <Route path="/user/:username" element={<PublicUser />} />
            <Route path="/page/:username" element={<Evt_Page />} />
            <Route path="/:id" element={<Exp_EventDetails />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            {/* Others Page */}
            <Route path="/creator/profile" element={<UserProfiles />} />

            {/* Events */}
            <Route path="/creator/events" element={<Events />} />
            <Route path="/creator/events/add" element={<AddEvent />} />
            <Route path="/creator/events/add/:id" element={<AddEvent />} />

            {/* Event Page */}
            <Route path="/creator/page" element={<Page />} />
            <Route path="/creator/page/create" element={<CreatePage />} />
            <Route path="/creator/page/update/:id" element={<CreatePage />} />

            {/* Badege Ganerator */}
            <Route path="/creator/badge" element={<BadgeGenerator />} />

            <Route
              path="/creator/events/detail/:id"
              element={<EventDetails />}
            />

            {/* Members */}
            <Route path="/creator/members" element={<Members />} />

            {/* Payments */}
            <Route path="/creator/bookings" element={<SalesHistory />} />
            <Route path="/creator/payouts" element={<PayoutHistory />} />

            {/* Subscriptions */}
            <Route path="/creator/subscriptions" element={<Subscriptions />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </>
  );
}
