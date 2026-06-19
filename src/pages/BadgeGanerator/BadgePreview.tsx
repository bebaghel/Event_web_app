import React, { forwardRef } from "react";
import { TemplateElement } from "../BadgeGanerator/BadgeGanerator";
import QRCode from "react-qr-code";
import { Download } from "lucide-react";
import { Button } from "../../components/ui/button";
import { mediaUrl } from "../../constants";

interface Props {
  elements: TemplateElement[];
  setElements: React.Dispatch<React.SetStateAction<TemplateElement[]>>;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  template: { id: string; src: string };
  logoFile?: File | null;
  downloadSampleBadge: () => void;
  downloadAllBadges: () => Promise<void>;
  loading: boolean;
  qrValue: string;
}

const PREVIEW_W = 340;
const PREVIEW_H = 567;

const BadgePreview = forwardRef<HTMLDivElement, Props>(
  (
    {
      elements,
      activeId,
      setActiveId,
      setElements,
      template,
      logoFile,
      downloadSampleBadge,
      downloadAllBadges,
      loading,
      qrValue,
    },
    ref,
  ) => {
    const startDrag = (id: string, e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.dataset?.resizeHandle === "true") return;
      const el = elements.find((x) => x.id === id);
      if (!el) return;
      const startX = e.clientX;
      const startY = e.clientY;
      const initialX = el.x;
      const initialY = el.y;
      const move = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        setElements((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, x: initialX + dx, y: initialY + dy }
              : item,
          ),
        );
      };
      const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    };

    // const startResize = (id: string, e: React.MouseEvent) => {
    //   e.stopPropagation();
    //   const startY = e.clientY;
    //   const el = elements.find((el) => el.id === id);
    //   if (!el) return;
    //   const initialSize = el.fontSize;
    //   const move = (ev: MouseEvent) => {
    //     const diff = ev.clientY - startY;
    //     setElements((prev) =>
    //       prev.map((item) =>
    //         item.id === id
    //           ? { ...item, fontSize: Math.max(20, initialSize + diff) }
    //           : item,
    //       ),
    //     );
    //   };
    //   const up = () => {
    //     window.removeEventListener("mousemove", move);
    //     window.removeEventListener("mouseup", up);
    //   };
    //   window.addEventListener("mousemove", move);
    //   window.addEventListener("mouseup", up);
    // };

    const startSmartResize = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();

      const el = elements.find((el) => el.id === id);
      if (!el) return;

      const startX = e.clientX;
      const startY = e.clientY;

      const initialWidth = el.width ?? 180; // ✅ FIX
      const initialFontSize = el.fontSize ?? 24;

      const move = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        setElements((prev) =>
          prev.map((item) => {
            if (item.id !== id) return item;

            return {
              ...item,
              width: Math.max(80, initialWidth + dx),
              fontSize: Math.max(12, initialFontSize + dy * 0.25),
            };
          }),
        );
      };

      const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    };

    return (
      <div className="flex flex-col flex-1 items-center w-full">
        <h2 className="text-2xl font-bold pb-4 text-center">Badge Preview</h2>
        <div
          ref={ref}
          className="relative overflow-hidden bg-cover bg-center"
          style={{
            width: PREVIEW_W,
            height: PREVIEW_H,
            backgroundImage: `url(${template.src})`,
          }}
        >
          {elements
            .filter((el) => el.enabled !== false)
            .map((el) => {
              const isActive = activeId === el.id;
              return (
                <div
                  key={el.id}
                  data-el-id={el.id}
                  onMouseDown={(e) => startDrag(el.id, e)}
                  onClick={() => setActiveId(el.id)}
                  style={{
                    position: "absolute",
                    top: el.y,
                    left: el.x,
                    width: el.width,
                    transform: "translate(-50%, 0)",
                    color: el.color,
                    fontSize: el.fontSize,
                    fontWeight: el.bold ? "bold" : "normal",
                    fontStyle: el.italic ? "italic" : "normal",
                    textDecoration: el.underline ? "underline" : "none",
                    fontFamily: el.fontFamily || "Arial",
                    textAlign: el.align || "center",
                    cursor: "move",
                    userSelect: "none",
                    padding: "2px 6px",
                    border: isActive ? "2px dashed #7c3aed" : "none",
                    borderRadius: 6,
                    background: isActive
                      ? "rgba(255,255,255,0.3)"
                      : "transparent",
                    zIndex: isActive ? 10 : 1,
                  }}
                >
                  {el.id === "logo" ? (
                    <div
                      style={{
                        width: el.fontSize,
                        height: el.fontSize,
                        backgroundColor: el.backgroundColor || "transparent",
                        borderRadius: `${el.borderRadius ?? 50}%`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 6,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                      }}
                    >
                      <img
                        src={
                          // If new uploaded logo
                          logoFile
                            ? URL.createObjectURL(logoFile)
                            : // If saved template with logoSrc
                              el.logoSrc
                              ? `${mediaUrl}${el.logoSrc}`
                              : // Default placeholder
                                "/event-buddi-logo.png"
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: `${el.borderRadius ?? 50}%`,
                          pointerEvents: "none",
                        }}
                        alt="logo"
                      />
                    </div>
                  ) : el.id === "qr" ? (
                    <div data-qr-container className="p-4 bg-white">
                      <QRCode value={qrValue} size={el.fontSize} />
                    </div>
                  ) : (
                    el.text
                  )}
                  {isActive && (
                    <div
                      data-resize-handle="true"
                      onMouseDown={(e) => startSmartResize(el.id, e)}
                      style={{
                        width: 12,
                        height: 12,
                        background: "white",
                        border: "1px solid #888",
                        position: "absolute",
                        right: -6,
                        bottom: -6,
                        cursor: "nwse-resize",
                        zIndex: 20,
                      }}
                    />
                  )}
                </div>
              );
            })}
        </div>
        <div className="mt-5 space-x-5">
          <Button onClick={downloadSampleBadge} variant="outline" size="sm">
            <Download size={18} />
            <span>Sample Badge</span>
          </Button>
          <Button onClick={downloadAllBadges} size="sm" disabled={loading}>
            <Download size={18} />
            <span>{loading ? "Generating..." : "All Badges"}</span>
          </Button>
        </div>
      </div>
    );
  },
);

export default BadgePreview;
