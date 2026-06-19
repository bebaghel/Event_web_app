import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { useState } from "react";
import { generateApiKey } from "../../services/services";
import { toast } from "sonner";
import moment from "moment";
import { Copy } from "lucide-react";

export default function UserApiKey({ user, fetchUser }: any) {
  const [loading, setLoading] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  const handleSave = async () => {
    setLoading(true);

    try {
      const res = await generateApiKey();

      if (res.data.status) {
        sessionStorage.setItem("user", JSON.stringify(res.data.response));
        toast.success(res.data.message);
        closeModal();
        fetchUser();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error updating account information:", error);
      toast.error("Failed to generate api key.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (user?.api_key) {
      navigator.clipboard.writeText(user.api_key);
      toast.success("API Key copied to clipboard");
    }
  };

  return (
    <>
      <div
        className="mt-5 p-5 border bg-white border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6"
        style={{ position: "relative" }}
      >
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Api Key
            </h3>
            <button
              onClick={openModal}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              Generate Api Key
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Api Key
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 flex items-center gap-3">
                {user?.api_key || "-"}{" "}
                {user?.api_key && (
                  <Copy
                    className="h-4 w-4 cursor-pointer"
                    onClick={handleCopyKey}
                  />
                )}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Api Key Generated
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.api_key_createdAt
                  ? moment(user.api_key_createdAt).format("DD MMM, YYYY")
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="flex flex-col">
            <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-1 mt-10 md:mt-12 lg:mt-5">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Generate New API Key
              </h3>
              <p className="my-3 text-sm text-gray-500 dark:text-gray-400">
                Keep it secure and do not share it with others. Old one will not
                work anymore.
              </p>
            </div>
            <div className="flex items-center gap-3 px-2 justify-end">
              {/* <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button> */}
              <Button size="sm" onClick={handleSave} disabled={loading}>
                Accept
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
