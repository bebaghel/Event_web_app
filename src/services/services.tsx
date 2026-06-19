import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("guest_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Check 401
api.interceptors.response.use(
  (respone) => respone,

  (error) => {
    console.log(error);

    if (error?.status === 401) {
      sessionStorage.clear();
      localStorage.clear();
      if (!window.location.pathname.includes("/signin")) {
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  response: T;
}

export const sendOtp = async (payload: any) =>
  api.post(`/user/send-otp`, payload);

export const verifyOtp = async (payload: any) =>
  api.post(`/user/verify-otp`, payload);

export const verifyPin = async (payload: any) =>
  api.post(`/user/verify-pin`, payload);

export const resetUserPin = async (payload: any) =>
  api.post(`/user/reset-pin`, payload);

export const updateUser = async (id: string, payload: any) =>
  api.post(`/user/update/${id}`, payload);

export const createUser = async (payload: any) =>
  api.post(`/user/create`, payload);

export const generateApiKey = async () => api.post(`/user/api-key`);

export const getUserById = async (id: string) => api.post(`/user/single/${id}`);

export const getUserByUsername = async (username: string) =>
  api.post(`/user/profile/${username}`);

export const getUsers = async (payload: any) => api.post(`/user/all`, payload);

export const googleLogin = async (payload: any) =>
  api.post(`/user/auth/google`, payload);

export const updatePageConfig = async (payload: any) =>
  api.post(`/user/update-page`, payload);

// Events
export const getEvents = async (payload: any) => api.post(`/events`, payload);

export const getEventsWithLessData = async (payload: any) =>
  api.post(`/events/less-data`, payload);

export const getEventById = async (event_id: any) =>
  api.get(`/events/${event_id}`);

export const addEvent = async (payload: any) =>
  api.post(`/events/create`, payload);

export const updateEvent = async (id: string, payload: any) =>
  api.post(`/events/update/${id}`, payload);

// Booking
export const createBooking = async (payload: any) =>
  api.post(`/booking/book-event`, payload);

export const updateBooking = async (id: string, payload: any) =>
  api.post(`/booking/update/${id}`, payload);

export const getAllBooking = async (payload: any) =>
  api.post(`/booking`, payload);

export const getBookingsForEvent = async (payload: any) =>
  api.post(`/booking/getBookingsForEvent`, payload);

export const getBookingByTin = async (tin: string) =>
  api.get(`/booking/ticket`, { params: { t: tin } });

export const checkPaymentStatus = async (payload: any) =>
  api.post(`/booking/checkPayment`, payload);

export const guestAnalytics = async (payload: any) =>
  api.post(`/booking/guestAnalytics`, payload);

export const export_bookings = async (
  payload: any,
  config: any = {}
) =>
  api.post(`/booking/export_bookings`, payload, {
    ...config,
    responseType: "blob",
  });

// User Relation
export const getMembers = async (payload: any) =>
  api.post(`/userRelation`, payload);

export const searchGuests = async (payload: any) =>
  api.post(`/userRelation/searchGuests`, payload);


// Transaction
export const getAllTransaction = async (payload: any) =>
  api.post(`/transaction`, payload);

// Withdraw
export const getWithdraw = async (payload: any) =>
  api.post(`/withdraw`, payload);

// Open Ai
export const chatAi = async (payload: any) => api.post(`/ai/chat`, payload);

export const attachInEvent = async (payload: any) =>
  api.post(`/ai/attach`, payload);

// Subscription
export const get_subscription = async (payload: any) =>
  api.post(`/subscription/get`, payload);

export const take_subscription = async (payload: any) =>
  api.post(`/subscription/add`, payload);

export const check_subscription_payment = async (payload: any) =>
  api.post(`/subscription/checkPayment`, payload);

// Page
export const getAllPages = async (payload: any) =>
  api.post(`/page/all`, payload);

export const create_page = async (payload: any) =>
  api.post(`/page/create`, payload);

export const update_page = async (id: string, payload: any) =>
  api.post(`/page/update/${id}`, payload);

export const subscribe_page = async (id: string) =>
  api.post(`/page/subscribe/${id}`);

export const un_subscribe_page = async (id: string) =>
  api.post(`/page/un-subscribe/${id}`);

export const getPageById = async (id: string) => api.post(`/page/single/${id}`);

export const getPageByUsername = async (username: string) =>
  api.post(`/page/username/${username}`,);

export const deletePage = async (id: string) =>
  api.delete(`/page/delete/${id}`);

// Badge Template
export const saveBadgeTemplate = async (payload: any) =>
  api.post(`/badge-template/save`, payload);

export const getBadgeTemplates = async () => api.post(`/badge-template/all`);

// Exports
export const exportBookingData = async (payload: any) =>
  api.post(`/export/bookings`, payload);

export const exportTransactions = async (payload: any) =>
  api.post(`/export/transactions`, payload);
