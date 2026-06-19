import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, RefreshCcw } from "lucide-react";
import logo from "/event-buddi-logo.png";
import { Textarea } from "../../components/ui/textarea";
import { chatAi } from "../../services/services";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../../components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

type AIContentProps = {
  isOpen: boolean;
  onClose: () => void;
  onInsert?: (text: string) => void;
};

const LoadingText = () => {
  const [loadingText, setLoadingText] = useState("Generating...");
  const loadingMessages = [
    "Generating...",
    "Thinking...",
    "Processing...",
    "Creating...",
    "Analyzing...",
  ];
  let counter = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText(loadingMessages[counter]);
      counter = (counter + 1) % loadingMessages.length;
    }, 1000); // Changes text every 1 second

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return <div>{loadingText}</div>;
};

const DrawerPortal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const elRef = useRef<HTMLElement | null>(null);
  if (!elRef.current) {
    const existing = document.getElementById("ai-drawer-root");
    elRef.current = (existing ?? document.createElement("div")) as HTMLElement;
    elRef.current.id = "ai-drawer-root";
  }

  useEffect(() => {
    const root = document.body;
    if (!document.getElementById("ai-drawer-root"))
      root.appendChild(elRef.current!);
    return () => {
      // keep root for future uses, but clean up only if you created it newly (optional)
      // root.removeChild(elRef.current!);
    };
  }, []);

  return createPortal(children, elRef.current);
};

const AIContent: React.FC<AIContentProps> = ({ isOpen, onClose, onInsert }) => {
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const [reply, setReply] = useState("");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const session = localStorage.getItem("sessionId");

  useEffect(() => {
    if (!session) {
      const id = uuidv4();
      setSessionId(id);
      localStorage.setItem("sessionId", id);
    } else {
      setSessionId(session);
    }
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // click outside to close (overlay click)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    const payload = { prompt, session_id: sessionId };
    setLoading(true);
    try {
      const res = await chatAi(payload);
      console.log(res);
      if (res.data.status) {
        setReply(res.data.response.reply);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Focus first focusable element when opened
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      const el = drawerRef.current?.querySelector(
        "textarea, button, input"
      ) as HTMLElement | null;
      el?.focus();
    }, 150);
    return () => clearTimeout(t);
  }, [isOpen]);

  return (
    <DrawerPortal>
      {/* overlay + drawer */}
      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[1100] ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          onMouseDown={handleOverlayClick}
          className={`absolute inset-0 transition-opacity duration-300 ${
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Drawer panel */}
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          className={`fixed top-0 right-0 h-full w-full max-w-xl transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{ boxShadow: "0 -6px 30px rgba(13, 17, 23, 0.2)" }}
        >
          <div className="h-full flex flex-col bg-white">
            {/* HEADER */}
            <div className="px-6 py-4 flex items-center justify-between bg-white/90 backdrop-blur-sm border-b">
              <div className="flex items-center gap-1">
                <img src={logo} alt="Assist Buddi Event" className="h-5" />
                <h3 className="text-xl font-semibold text-purple-900">
                  Assist Buddi Event AI
                </h3>
              </div>

              <button
                aria-label="Close"
                onClick={onClose}
                className="p-2 rounded-md hover:bg-gray-100 transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                Write your event details below. Our AI will help you generate
                high-quality descriptions, messages, and content instantly.
              </p>

              <div className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder="Describe the event details you want the AI to generate…"
                />

                <div className="flex gap-4 items-center justify-end">
                  <Button onClick={handleGenerate} disabled={loading}>
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </Button>

                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setPrompt("");
                      setReply("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">
                    AI Output
                  </span>
                </div>

                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed min-h-[120px]">
                  {reply ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {reply}
                    </ReactMarkdown>
                  ) : (
                    <span className="text-gray-400 italic">
                      {loading ? (
                        <LoadingText />
                      ) : (
                        " AI generated content will appear here…"
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 bg-white border-t flex justify-between gap-3">
              {/* <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button> */}

              <Button
                variant={"link"}
                onClick={handleGenerate}
                className="text-purple-900 text-xs font-medium hover:underline"
              >
                <RefreshCcw /> Regenerate
              </Button>

              <Button onClick={() => onInsert?.(reply)}>Insert</Button>
            </div>
          </div>
        </div>
      </div>
    </DrawerPortal>
  );
};

export default AIContent;
