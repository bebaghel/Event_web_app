import Button from "../../components/ui/button/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useState } from "react";
import { createBooking, getUsers } from "../../services/services";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

type AdminDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddGuestForm = ({ isOpen, onClose }: AdminDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    pageId: "",
  });
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  let fetchTimeout: any = null;

  // handle personal info input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      pageId: "",
    });
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
      role: user.role || "",
      //   pageId: padeId || "",
      pageId: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.email) {
      return toast.error("Please enter guest email address");
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    try {
      setLoading(true);
      const res = await createBooking(payload);

      if (res.data.status) {
        handleClose();
        toast.success("Guest added");
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
      <DialogContent className="bg-white text-gray-900 rounded-lg h-[95vh] flex flex-col p-0">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <DialogHeader>
            <DialogTitle>Add Guest</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col space-y-2 my-4 relative">
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

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="name">
                Full Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
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

            {/* Admin Role */}
            <div className="flex flex-col space-y-2">
              <Label>
                Role<span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="border-t bg-white px-6 py-4">
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
