import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Toaster } from "sonner";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { googleClientId } from "./constants.ts";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <>
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
        <AppWrapper>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </AppWrapper>
      </ThemeProvider>
    </GoogleOAuthProvider>
    <Toaster position="top-right" richColors />
  </>
);
