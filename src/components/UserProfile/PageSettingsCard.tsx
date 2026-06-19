import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { updatePageConfig } from "../../services/services";
import { toast } from "sonner";
import { mediaUrl } from "../../constants";

export default function PageSettingsCard({ user, fetchUser }: any) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const page_settings = user?.page_settings || {};

  const [form, setForm] = useState({
    title: page_settings.title || "",
    about: page_settings.about || "",
    // theme_color: page_settings.theme_color || "#59168b",
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (logo) formData.append("logo", logo);
    if (banner) formData.append("banner", banner);
    formData.append("title", form.title);
    formData.append("about", form.about);
    // formData.append("theme_color", form.theme_color);

    try {
      const res = await updatePageConfig(formData);

      if (res.data.status) {
        toast.success("Page updated successfully");
        closeModal();
        fetchUser();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Failed to update page");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="mt-5 p-5 border bg-white border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6"
        style={{ position: "relative" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Page Settings
          </h3>
          <button
            onClick={openModal}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Logo
            </p>
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              {page_settings?.logo ? (
                <img
                  src={`${mediaUrl}/page_settings/${page_settings.logo}`}
                  alt="logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src="/event-buddi-whitelogo.png"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Banner
            </p>
            <div className="w-auto h-20 overflow-hidden border border-gray-200 dark:border-gray-800">
              {page_settings?.banner ? (
                <img
                  src={`${mediaUrl}/page_settings/${page_settings.banner}`}
                  alt="logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src="/event-buddi-whitelogo.png"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Title
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {page_settings.title || "-"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              About
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {page_settings.about || "-"}
            </p>
          </div>

          {/* <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Theme Color
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {page_settings.theme_color || "-"}
            </p>
          </div> */}
        </div>
      </div>

      {/* MODAL */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px]">
        <form className="p-6 space-y-4" onSubmit={handleSave}>
          <h4 className="text-xl font-semibold">Edit Page</h4>

          <div className="space-y-2">
            <Label>Logo</Label>
            <Input
              type="file"
              onChange={(e) => setLogo(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label>Banner</Label>
            <Input
              type="file"
              onChange={(e) => setBanner(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>About</Label>
            <Input
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
            />
          </div>

          {/* <div className="space-y-2">
            <Label>Theme Color</Label>
            <Input
              type="color"
              value={form.theme_color}
              onChange={(e) =>
                setForm({ ...form, theme_color: e.target.value })
              }
            />
          </div> */}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
