import React from "react";
import {
  Plus,
  X,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { TemplateElement } from "../BadgeGanerator/BadgeGanerator";
import { Button } from "../../components/ui/button";
import { mediaUrl } from "../../constants";
import { Switch } from "../../components/ui/switch";
import QRCode from "react-qr-code";

interface Props {
  mainTemplates: { id: string; src: string; name?: string }[];
  moreTemplates: { id: string; src: string; name?: string }[];
  savedTemplates: any[];
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  handleTemplateSelect: (id: string) => void;
  showMoreModal: boolean;
  setShowMoreModal: (v: boolean) => void;
  showBgInfoModal: boolean;
  setShowBgInfoModal: (v: boolean) => void;
  handleUploadTemplate: (f?: File) => void;
  handleUploadLogo: (f?: File) => void;
  PREVIEW_W: number;
  PREVIEW_H: number;
  BADGE_W_MM: number;
  BADGE_H_MM: number;
  elements: TemplateElement[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  setElements: React.Dispatch<React.SetStateAction<TemplateElement[]>>;
  addElement: () => void;
  removeElement: (id: string) => void;
  downloadAllBadges: () => void;
  saveTemplate: () => void;
  selectedEvent: any;
}

const TemplateSetting: React.FC<Props> = ({
  mainTemplates,
  moreTemplates,
  savedTemplates,
  selectedTemplateId,
  setSelectedTemplateId,
  handleTemplateSelect,
  showMoreModal,
  setShowMoreModal,
  showBgInfoModal,
  setShowBgInfoModal,
  handleUploadTemplate,
  handleUploadLogo,
  PREVIEW_W,
  PREVIEW_H,
  BADGE_W_MM,
  BADGE_H_MM,
  elements,
  activeId,
  setActiveId,
  setElements,
  addElement,
  removeElement,
  saveTemplate,
  selectedEvent,
}) => {
  const activeElement = elements.find((el) => el.id === activeId);
  const isLogoActive = activeElement?.id === "logo";
  const [activeTab, setActiveTab] = React.useState<"saved" | "more">("more");

  const cycleAlign = (id: string) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;

        const nextAlign =
          el.align === "left"
            ? "center"
            : el.align === "center"
              ? "right"
              : "left";

        return {
          ...el,
          align: nextAlign,
        };
      }),
    );
  };

  const handleFieldClick = (id: string) => {
    setActiveId(id);
  };

  return (
    <div className="w-full p-4 bg-white flex flex-col gap-4 overflow-y-auto no-scrollbar">
      <h3 className="text-lg font-semibold">Template Settings</h3>
      {/* TEMPLATE SELECTOR */}
      <div className="flex gap-3 pb-2">
        {mainTemplates.map((t) => (
          <div
            key={t.id}
            className={`flex-shrink-0 w-16 h-28 rounded border cursor-pointer ${
              selectedTemplateId === t.id
                ? "border-purple-500"
                : "border-gray-300"
            }`}
            style={{
              backgroundImage: `url(${t.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={() => setSelectedTemplateId(t.id)}
          />
        ))}
        <button
          className="flex-shrink-0 w-16 h-28 rounded border border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer"
          onClick={() => setShowMoreModal(true)}
        >
          More
        </button>
      </div>

      {/* More / Saved Templates Modal */}
      {showMoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded p-6 w-full max-w-5xl h-[80vh] overflow-y-auto">
            <button
              onClick={() => setShowMoreModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              <X />
            </button>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setActiveTab("more")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "more"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                More Templates
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "saved"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                My Templates
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {(activeTab === "saved" ? savedTemplates : moreTemplates).map(
                (t) => {
                  const isSaved = activeTab === "saved";
                  const bgSrc = isSaved
                    ? `${mediaUrl}/badge_images/${t.background}`
                    : t.src;

                  const tElements =
                    isSaved && "elements" in t && Array.isArray(t.elements)
                      ? t.elements
                      : moreTemplates; // fallback for static

                  return (
                    <div
                      key={t._id || t.id}
                      className={`w-full h-52 rounded border cursor-pointer relative overflow-hidden ${
                        selectedTemplateId === (t._id || t.id)
                          ? "border-purple-500 border-2"
                          : "border-gray-300"
                      }`}
                      style={{
                        backgroundImage: `url(${bgSrc})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      onClick={() => handleTemplateSelect(t._id || t.id)}
                    >
                      {tElements
                        .filter((el: TemplateElement) => el.enabled !== false)
                        .map((el: TemplateElement) => (
                          <div
                            key={el.id}
                            className="absolute"
                            style={{
                              top: `${(el.y / PREVIEW_H) * 100}%`,
                              left: `${(el.x / PREVIEW_W) * 100}%`,
                              transform: "translate(-50%, -50%)",
                              color: el.color,
                              fontSize: `${el.fontSize / 4}px`, // Scaled for thumbnail
                              fontWeight: el.bold ? "bold" : "normal",
                              fontStyle: el.italic ? "italic" : "normal",
                              textDecoration: el.underline
                                ? "underline"
                                : "none",
                              fontFamily: el.fontFamily || "Arial",
                              textAlign: "center",
                              width: el.width ? `${el.width / 4}px` : "auto",
                            }}
                          >
                            {el.id === "qr" ? (
                              <div style={{ width: "40px", height: "40px" }}>
                                <QRCode value="QR" size={40} />
                              </div>
                            ) : el.id === "logo" ? (
                              <img
                                src={
                                  isSaved && el.logoSrc
                                    ? `${mediaUrl}${el.logoSrc}`
                                    : "/event-buddi-logo.png"
                                }
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: `${el.borderRadius ?? 50}%`,
                                  objectFit: "cover",
                                }}
                                alt="logo"
                              />
                            ) : (
                              el.text || el.label
                            )}
                          </div>
                        ))}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      )}
      {/* UPLOAD BG + LOGO */}
      <div className="flex gap-2 items-center flex-wrap">
        <div>
          <button
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm"
            onClick={() => setShowBgInfoModal(true)}
          >
            <Upload size={16} />
            Background
          </button>
          {showBgInfoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-white/40 backdrop-blur-md"
                onClick={() => setShowBgInfoModal(false)}
              />
              <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-1">
                  Upload Background
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Recommended size for best results
                </p>
                <div className="flex justify-center mb-4">
                  <div
                    className="relative border-2 border-dashed rounded-lg bg-gray-50 w-[240px] flex items-center justify-center"
                    style={{ aspectRatio: `${PREVIEW_W} / ${PREVIEW_H}` }}
                  >
                    <span className="text-xs text-gray-500 text-center px-2">
                      {BADGE_W_MM} × {BADGE_H_MM} mm
                      <br />
                      ID Card Size
                    </span>
                  </div>
                </div>
                <input
                  id="upload-bg"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    handleUploadTemplate(f || undefined);
                    e.currentTarget.value = "";
                    setShowBgInfoModal(false);
                  }}
                />
                <div className="flex gap-3 justify-end">
                  <button
                    className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                    onClick={() => setShowBgInfoModal(false)}
                  >
                    Cancel
                  </button>
                  <label
                    htmlFor="upload-bg"
                    className="cursor-pointer px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Select Image
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          <input
            id="upload-logo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              handleUploadLogo(f || undefined);
              e.currentTarget.value = "";
            }}
          />
          <label
            htmlFor="upload-logo"
            className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-100 text-sm"
          >
            <Upload size={16} />
            Upload Logo
          </label>
        </div>
      </div>
      {/* FIELDS LIST */}
      <div className="border-t pt-3 space-y-4">
        {/* Default Fields */}
        <div>
          <h4 className="font-semibold mb-2">Default Fields</h4>
          <div className="space-y-2">
            {elements
              .filter((el) => !el.isCustom)
              .map((el) => {
                const isActive = activeId === el.id;
                return (
                  <div
                    key={el.id}
                    className={`border p-2 rounded cursor-pointer ${
                      isActive ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleFieldClick(el.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{el.label}</span>
                      <Switch
                        checked={!!el.enabled}
                        onCheckedChange={(checked) => {
                          setElements((prev) =>
                            prev.map((item) =>
                              item.id === el.id
                                ? { ...item, enabled: checked }
                                : item,
                            ),
                          );
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {isActive && !["logo", "qr"].includes(el.id) && (
                      <div
                        className="mt-3 p-2 border rounded space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-wrap gap-2 items-center">
                          <input
                            type="number"
                            min={10}
                            max={300}
                            className="border rounded w-16 px-2 py-1"
                            value={el.fontSize}
                            onChange={(e) =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, fontSize: +e.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                          <button
                            className={`px-2 py-1 border rounded ${
                              el.bold ? "bg-gray-200" : ""
                            }`}
                            onClick={() =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, bold: !item.bold }
                                    : item,
                                ),
                              )
                            }
                          >
                            B
                          </button>
                          <button
                            className={`px-2 py-1 border rounded ${
                              el.italic ? "bg-gray-200" : ""
                            }`}
                            onClick={() =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, italic: !item.italic }
                                    : item,
                                ),
                              )
                            }
                          >
                            I
                          </button>
                          <button
                            className={`px-2 py-1 border rounded ${
                              el.underline ? "bg-gray-200" : ""
                            }`}
                            onClick={() =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, underline: !item.underline }
                                    : item,
                                ),
                              )
                            }
                          >
                            U
                          </button>

                          <button
                            className="p-2 border rounded hover:bg-gray-100"
                            onClick={() => cycleAlign(el.id)}
                            title="Change alignment"
                          >
                            {el.align === "left" ? (
                              <AlignLeft size={16} />
                            ) : el.align === "center" ? (
                              <AlignCenter size={16} />
                            ) : (
                              <AlignRight size={16} />
                            )}
                          </button>

                          <input
                            type="color"
                            className="w-8 h-8 border rounded"
                            value={el.color || "#000000"}
                            onChange={(e) =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, color: e.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                          <select
                            className="border rounded px-2 py-1"
                            value={el.fontFamily || "Arial"}
                            onChange={(e) =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, fontFamily: e.target.value }
                                    : item,
                                ),
                              )
                            }
                          >
                            <option>Arial</option>
                            <option>Georgia</option>
                            <option>Verdana</option>
                            <option>Courier New</option>
                            <option>Times New Roman</option>
                          </select>
                        </div>
                        {el.id === "eventTitle" ? (
                          <input
                            type="text"
                            className="border w-full p-2 rounded"
                            value={el.text}
                            onChange={(e) =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, text: e.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                        ) : el.id === "name" || el.id === "delegates" ? (
                          <input
                            type="text"
                            className="border w-full p-2 rounded bg-gray-100 cursor-not-allowed"
                            value={el.text}
                            disabled
                          />
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
        {/* Custom Fields */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Custom Fields</h4>
            <button
              onClick={addElement}
              className="p-1 rounded hover:bg-gray-100"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {elements
              .filter((el) => el.isCustom)
              .map((el) => {
                const isActive = activeId === el.id;
                return (
                  <div
                    key={el.id}
                    className={`border p-2 rounded cursor-pointer ${
                      isActive ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleFieldClick(el.id)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Custom Field</span>
                      <X
                        size={16}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(el.id);
                        }}
                      />
                    </div>
                    {isActive && (
                      <div
                        className="p-2 border rounded space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          className="border w-full p-2 rounded"
                          placeholder="Enter text"
                          value={el.text}
                          onChange={(e) =>
                            setElements((prev) =>
                              prev.map((item) =>
                                item.id === el.id
                                  ? { ...item, text: e.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                        <div className="flex gap-2 flex-wrap items-center">
                          <input
                            type="number"
                            min={10}
                            className="border rounded w-16 px-2 py-1"
                            value={el.fontSize}
                            onChange={(e) =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, fontSize: +e.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                          <button
                            className={`px-2 py-1 border rounded ${
                              el.bold ? "bg-gray-200" : ""
                            }`}
                            onClick={() =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, bold: !item.bold }
                                    : item,
                                ),
                              )
                            }
                          >
                            B
                          </button>
                          <button
                            className={`px-2 py-1 border rounded ${
                              el.italic ? "bg-gray-200" : ""
                            }`}
                            onClick={() =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, italic: !item.italic }
                                    : item,
                                ),
                              )
                            }
                          >
                            I
                          </button>
                          <button
                            className={`px-2 py-1 border rounded ${
                              el.underline ? "bg-gray-200" : ""
                            }`}
                            onClick={() =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, underline: !item.underline }
                                    : item,
                                ),
                              )
                            }
                          >
                            U
                          </button>
                          <select
                            className="border rounded px-2 py-1"
                            value={el.fontFamily || "Arial"}
                            onChange={(e) =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, fontFamily: e.target.value }
                                    : item,
                                ),
                              )
                            }
                          >
                            <option value="Arial">Arial</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Times New Roman">
                              Times New Roman
                            </option>
                          </select>
                          <input
                            type="color"
                            value={el.color || "#000000"}
                            onChange={(e) =>
                              setElements((prev) =>
                                prev.map((item) =>
                                  item.id === el.id
                                    ? { ...item, color: e.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
        {/* LOGO SETTINGS */}
        {isLogoActive && (
          <div
            style={{
              marginTop: 20,
              borderTop: "1px solid #eee",
              paddingTop: 10,
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span>Background</span>
              <input
                type="color"
                value={activeElement.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  setElements((prev) =>
                    prev.map((el) =>
                      el.id === "logo"
                        ? { ...el, backgroundColor: e.target.value }
                        : el,
                    ),
                  )
                }
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <span>Border Radius</span>
              <input
                type="range"
                min={0}
                max={50}
                value={activeElement.borderRadius ?? 50}
                onChange={(e) =>
                  setElements((prev) =>
                    prev.map((el) =>
                      el.id === "logo"
                        ? { ...el, borderRadius: Number(e.target.value) }
                        : el,
                    ),
                  )
                }
              />
            </div>
          </div>
        )}
      </div>
      {/* ACTIONS */}
      <div className="flex flex-col gap-3 mt-5">
        <Button
          onClick={saveTemplate}
          className="w-full"
          disabled={!selectedEvent}
        >
          Save Template
        </Button>
      </div>
    </div>
  );
};

export default TemplateSetting;
