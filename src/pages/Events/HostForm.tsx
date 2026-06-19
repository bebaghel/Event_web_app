import Button from "../../components/ui/button/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useState } from "react";
import { createUser, getUsers } from "../../services/services";
import { toast } from "sonner";

type EventRegistrationDialogProps = {
  isOpen: boolean;
  event_id: string | null;
  onClose: () => void;
  fetchEvent: () => void;
};

export const HostForm = ({
  isOpen,
  onClose,
  event_id,
  fetchEvent,
}: EventRegistrationDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  let fetchTimeout: any = null;

  // handle personal info input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
    });
    setSearchResults([]);
    setShowDropdown(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const fetchUsers = async (email: string) => {
    const payload = { search: email, limit: 50 };

    try {
      const res = await getUsers(payload);
      if (res.data.status) {
        setSearchResults(res.data.response);
        setShowDropdown(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });

    if (fetchTimeout) clearTimeout(fetchTimeout);

    // Only search when 2+ characters typed
    if (value.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    fetchTimeout = setTimeout(() => {
      fetchUsers(value);
    }, 300);
  };

  const selectUser = (user: any) => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    if (!formData.email) {
      return toast.error("Please enter host email address");
    }
    if (!formData.name) {
      return toast.error("Please enter host name");
    }

    const payload = {
      hosted_events: event_id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    try {
      setLoading(true);
      const res = await createUser(payload);

      if (res.data.status) {
        handleClose();
        toast.success("Host added");
        fetchEvent();
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all" />
      <DialogContent className="bg-white text-gray-900 p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle>Add Host</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="email">
              Email<span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleEmailChange}
              autoComplete="on"
              required
            />
          </div>

          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-[8rem] left-0 w-[90%] mx-auto bg-white border rounded-lg shadow-md z-50 ms-5 ">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => selectUser(user)}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex flex-col last:border-none border-b"
                >
                  <span className="font-medium">{user.email}</span>
                  <span className="text-sm text-gray-600">{user.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Label htmlFor="name">
              Full Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="phone">
              Phone Number<span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              maxLength={15}
              required
            />
          </div>

          <DialogFooter className="mt-5">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
