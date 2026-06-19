import { Link, useNavigate, useLocation } from "react-router";
import { User, LayoutDashboard, ArrowUpRight } from "lucide-react";

const AppBottomNav = () => {
  const token = sessionStorage.getItem("token");
  const location = useLocation();
  const isDetailPage = location.pathname.startsWith("/evt-");
  const path = location.pathname;
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (token) {
      navigate("/creator/events/add");
    } else {
      navigate("/signin");
    }
  };
  return (
    <>
      {!isDetailPage && (
        <div>
          {/* Bottom Navigation - Mobile Only */}
          <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 shadow-lg border-t md:hidden z-1">
            <div className="flex justify-around items-center py-3">
              {/* Explore Events */}
              <Link
                to="/explore-events"
                className={`flex flex-col items-center text-xs font-medium 
        ${
          path === "/explore-events"
            ? "text-purple-900"
            : "text-gray-700 dark:text-gray-300"
        }`}
              >
                <ArrowUpRight size={20} />
                <span>Explore</span>
              </Link>

              {/* Create Event */}
              <button
                onClick={handleNavigate}
                className={`flex flex-col items-center text-xs font-medium
        ${
          path.includes("/create")
            ? "text-purple-900"
            : "text-gray-700 dark:text-gray-300"
        }`}
              >
                <div className="flex items-center">
                  {/* <!-- Light Mode Logo --> */}
                  {/* <img
                  src="/event-buddi-logo.png"
                  className="h-6 me-1 dark:hidden"
                /> */}

                  {/* <!-- Dark Mode Logo --> */}
                  <img src="/logo_txt_color.png" className="h-6 me-1 " />
                </div>
                <span>Create Event</span>
              </button>

              {/* Profile or Sign In */}
              {token ? (
                <Link
                  to="/creator/events"
                  className={`flex flex-col items-center text-xs font-medium
          ${
            path === "/creator/events"
              ? "text-purple-900"
              : "text-gray-700 dark:text-gray-300"
          }`}
                >
                  <LayoutDashboard size={20} />
                  <span>Manage</span>
                </Link>
              ) : (
                <Link
                  to="/signin"
                  className={`flex flex-col items-center text-xs font-medium
          ${
            path === "/signin"
              ? "text-purple-900"
              : "text-gray-700 dark:text-gray-300"
          }`}
                >
                  <User size={20} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppBottomNav;
