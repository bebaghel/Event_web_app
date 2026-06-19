import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { updateUser } from "../../services/services";
import { mediaUrl } from "../../constants";
import { User } from "lucide-react";

export type IUser = {
  _id?: string;
  name?: string;
  email?: string;
  username?: string;
  phone?: string;
  bio?: string;
  profilePic?: string;
  picture?: string; // google auth etc
  social_links?: { platform: string; url: string }[];
};

type ModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  fetchUser: () => void;
  user: IUser;
};

type IForm = {
  name: string;
  email: string;
  phone: string;
  username: string;
  bio: string;
  social_links: { platform: string; url: string }[];
  profilePic: string | File;
};

const SOCIAL_PLATFORMS = ["facebook", "x", "linkedin", "instagram"];

const normalizeSocialLinks = (
  links: any
): { platform: string; url: string }[] => {
  if (!Array.isArray(links) || links.length === 0) {
    return SOCIAL_PLATFORMS.map((p) => ({ platform: p, url: "" }));
  }
  // Check if all elements are objects with 'platform' and 'url'
  const isValid = links.every(
    (link) =>
      typeof link === "object" &&
      link !== null &&
      "platform" in link &&
      "url" in link
  );
  if (!isValid) {
    return SOCIAL_PLATFORMS.map((p) => ({ platform: p, url: "" }));
  }
  return links;
};

const UpdateUserModal = ({
  isOpen,
  closeModal,
  fetchUser,
  user,
}: ModalProps) => {
  const id = user?._id;
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [errors, setErrors] = useState<any>({});

  const [form, setForm] = useState<IForm>({
    name: user?.name || "",
    email: user?.email || "",
    username: user?.username || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    social_links: normalizeSocialLinks(user?.social_links), // Use the helper here
    profilePic: `${mediaUrl}/user_profile_pics/${user?.profilePic}`,
  });

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm({ ...form, profilePic: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle Social Link Changes
  const handleSocialLinkChange = (platform: string, value: string) => {
    const newSocialLinks = form.social_links.map((link) =>
      link.platform === platform ? { ...link, url: value } : link
    );
    setForm({ ...form, social_links: newSocialLinks });
  };

  // Handle Text Inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    // Name
    if (!form.name.trim()) {
      toast.error("Full name is required");
      return false;
    }

    if (form.name.trim().length < 3) {
      toast.error("Name must be at least 3 characters");
      return false;
    }

    // Username
    if (!form.username.trim()) {
      toast.error("Username is required");
      return false;
    }

    if (!/^[a-zA-Z0-9._]+$/.test(form.username)) {
      toast.error(
        "Username can only contain letters, numbers, . and _"
      );
      return false;
    }

    if (form.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return false;
    }

    // Email
    if (!form.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
    ) {
      toast.error("Invalid email address");
      return false;
    }

    // Phone
    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }
    // Bio
    if (form.bio.length > 300) {
      toast.error("Bio cannot exceed 300 characters");
      return false;
    }

    // Social Links
    for (const link of form.social_links) {
      if (link.url && !/^https?:\/\/.+/i.test(link.url)) {
        toast.error(`Enter valid ${link.platform} URL`);
        return false;
      }
    }

    return true;
  };

  // Save Data
  // const handleSave = async () => {
  //   setLoading(true);
  //   const formData = new FormData();
  //   formData.append("name", form.name);
  //   formData.append("email", form.email);
  //   formData.append("username", form.username);
  //   formData.append("phone", form.phone);
  //   formData.append("bio", form.bio);
  //   formData.append("social_links", JSON.stringify(form.social_links));

  //   if (form.profilePic instanceof File) {
  //     formData.append("profilePic", form.profilePic);
  //   }

  //   try {
  //     const res = await updateUser(id!, formData);

  //     if (res.data.status) {
  //       sessionStorage.setItem("user", JSON.stringify(res.data.response));
  //       toast.success("User information updated successfully.");
  //       closeModal();
  //       fetchUser();
  //     }
  //   } catch (error: any) {
  //     console.error("Error updating user:", error);
  //     toast.error(
  //       error.response?.data?.message ||
  //       error?.message ||
  //       "Failed to update user information."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("username", form.username);
    formData.append("phone", form.phone);
    formData.append("bio", form.bio);
    formData.append("social_links", JSON.stringify(form.social_links));

    if (form.profilePic instanceof File) {
      formData.append("profilePic", form.profilePic);
    }

    try {
      const res = await updateUser(id!, formData);

      if (res.data.status) {
        sessionStorage.setItem("user", JSON.stringify(res.data.response));
        toast.success("User information updated successfully.");
        closeModal();
        fetchUser();
      }
    } catch (error: any) {
      console.error("Error updating user:", error);

      toast.error(
        error.response?.data?.message ||
        error?.message ||
        "Failed to update user information."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[700px] m-4 mt-20 md:mt-0 h-screen"
    >
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Profile
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update your details to keep your profile up-to-date.
          </p>
        </div>

        <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            {/* Profile Picture Upload */}
            <div className="mb-8 flex items-center gap-4 flex-wrap">
              <div className="relative">
                {user.profilePic || user.picture ? (
                  <img
                    src={
                      preview
                        ? preview
                        : user.profilePic
                          ? `${mediaUrl}/user_profile_pics/${user?.profilePic}`
                          : user.picture
                    }
                    alt="Profile"
                    className="md:w-20 md:h-20 w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                  />
                ) : (
                  <div className="md:w-20 md:h-20 w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700">
                    <User className="h-20 w-20 " />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Upload Profile Picture</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Personal Info */}
            <div className="mt-5">
              <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                Personal Information
              </h5>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="space-y-2 col-span-2 lg:col-span-1">
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2 col-span-2 lg:col-span-1">
                  <Label>Username</Label>
                  <Input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    required
                  />

                </div>

                <div className="space-y-2 col-span-2 lg:col-span-1">
                  <Label>Email Address</Label>
                  <Input
                    type="text"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                  />

                </div>

                <div className="space-y-2 col-span-2 lg:col-span-1">
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    name="phone"
                    maxLength={10}
                    value={form.phone}
                    // onChange={handleInputChange}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setForm({ ...form, phone: value });
                    }}
                    placeholder="Enter your phone number"
                  />

                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h5 className="my-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                Social Links
              </h5>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input
                    type="url"
                    placeholder="Paste your url here"
                    value={
                      form.social_links.find(
                        (link) => link.platform === "facebook"
                      )?.url || ""
                    }
                    onChange={(e) =>
                      handleSocialLinkChange("facebook", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>X.com</Label>
                  <Input
                    type="url"
                    placeholder="Paste your url here"
                    value={
                      form.social_links.find((link) => link.platform === "x")
                        ?.url || ""
                    }
                    onChange={(e) =>
                      handleSocialLinkChange("x", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Linkedin</Label>
                  <Input
                    type="url"
                    placeholder="Paste your url here"
                    value={
                      form.social_links.find(
                        (link) => link.platform === "linkedin"
                      )?.url || ""
                    }
                    onChange={(e) =>
                      handleSocialLinkChange("linkedin", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input
                    type="url"
                    placeholder="Paste your url here"
                    value={
                      form.social_links.find(
                        (link) => link.platform === "instagram"
                      )?.url || ""
                    }
                    onChange={(e) =>
                      handleSocialLinkChange("instagram", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={loading}
              className={loading ? "opacity-50 cursor-not-allowed" : ""}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UpdateUserModal;
