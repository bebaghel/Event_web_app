import React, { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Globe, Loader2, Lock, Palette, Upload, X } from "lucide-react";
import { toast } from "sonner";
import eventCategory from "../../config/event_category.json";
import * as Icons from "lucide-react";
import { create_page, getPageById, update_page } from "../../services/services";
import { useNavigate, useParams } from "react-router";
import Loading from "../loading";
import { mediaUrl } from "../../constants";

type PageFormState = {
  name: string;
  page_username: string;
  about: string;
  category: string;
  is_public: boolean;
  theme_color: string;
  location: string;
  social_links: { platform: string; url: string }[];
};

const SOCIAL_PLATFORMS = ["facebook", "x", "linkedin", "instagram", "website"];

const CreatePage = () => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { id } = useParams();

  const [form, setForm] = useState<PageFormState>({
    name: "",
    page_username: "",
    about: "",
    category: "",
    is_public: true,
    theme_color: "",
    location: "",
    social_links: [
      { platform: "facebook", url: "" },
      { platform: "x", url: "" },
      { platform: "linkedin", url: "" },
      { platform: "instagram", url: "" },
      { platform: "website", url: "" },
    ],
  });

  const fetchPageById = async () => {
    setLoading(true);
    try {
      const res = await getPageById(id!);
      // console.log(res);
      if (res.data.status) {
        const data = res.data.response;
        setForm({
          ...data,
        });
        setLogoPreview(`${mediaUrl}/page_images/${data?.logo}` || "");
        setBannerPreview(`${mediaUrl}/page_images/${data?.banner}` || "");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load page");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPageById();
  }, [id]);

  // Handle logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be less than 5MB");
      return;
    }

    setLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  // Handle banner file upload
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Banner must be less than 10MB");
      return;
    }

    setBannerFile(file);
    const previewUrl = URL.createObjectURL(file);
    setBannerPreview(previewUrl);
  };

  // Remove logo
  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    if (logoRef.current) {
      logoRef.current.value = "";
    }
  };

  // Remove banner
  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview("");
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }
    if (bannerRef.current) {
      bannerRef.current.value = "";
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      page_username: "",
      about: "",
      category: "",
      is_public: true,
      theme_color: "",
      location: "",
      social_links: [],
    });

    removeLogo();
    removeBanner();
  };

  // Handle Social Link Changes
  const handleSocialLinkChange = (platform: string, value: string) => {
    const newSocialLinks = form.social_links.map((link) =>
      link.platform === platform ? { ...link, url: value } : link
    );
    setForm({ ...form, social_links: newSocialLinks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append form data
      formData.append("name", form.name);
      formData.append("page_username", form.page_username);
      formData.append("about", form.about);
      formData.append("category", form.category);
      formData.append("is_public", String(form.is_public));
      formData.append("theme_color", form.theme_color);
      formData.append("location", form.location);
      formData.append("social_links", JSON.stringify(form.social_links));

      // Append files if they exist
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      let res;
      if (id) {
        res = await update_page(id, formData);
      } else {
        res = await create_page(formData);
      }

      if (res.data.status) {
        toast.success(res.data.message);
        navigate("/creator/page");
        resetForm();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.message ||
          error.respone?.data.message ||
          "Failed to create event"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>
                    Logo
                    <span className="text-xs text-gray-500 ml-2">
                      Recommended: 200×200px, max 5MB
                    </span>
                  </Label>
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-20 h-20 rounded-lg object-cover border"
                        />
                        <div
                          className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 rounded-full text-white flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLogo();
                          }}
                        >
                          <X className="h-3 w-3" />
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="logo-upload"
                        className="cursor-pointer w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                      </label>
                    )}
                    <div className="flex-1">
                      <Input
                        ref={logoRef}
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      {logoPreview && (
                        <Label
                          htmlFor="logo-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                          <Upload className="h-4 w-4" />
                          Change Logo
                        </Label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="space-y-2">
                  <Label>
                    Banner
                    <span className="text-xs text-gray-500 ml-2">
                      Recommended: 1200×400px, max 10MB
                    </span>
                  </Label>
                  <div className="space-y-2">
                    <label
                      htmlFor="banner-upload"
                      className="cursor-pointer block"
                    >
                      {bannerPreview ? (
                        <div className="relative">
                          <img
                            src={bannerPreview}
                            alt="Banner preview"
                            className="w-full h-32 rounded-lg object-cover border"
                          />
                          <div
                            className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 rounded-full text-white flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBanner();
                            }}
                          >
                            <X className="h-3 w-3" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Click to upload banner
                          </span>
                        </div>
                      )}
                    </label>
                    <Input
                      ref={bannerRef}
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerUpload}
                    />
                    {bannerPreview && (
                      <Label
                        htmlFor="banner-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
                      >
                        <Upload className="h-4 w-4" />
                        Change Banner
                      </Label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Page Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Page Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  placeholder="e.g., Tech Summit 2024"
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="page_username">Page URL *</Label>
                <div className="flex items-center">
                  <Input
                    id="page_username"
                    name="page_username"
                    value={form.page_username}
                    placeholder="tech-summit-2024"
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        page_username: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Lowercase letters, numbers, and hyphens only. This will be
                  your page URL.
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex items-center">
                  <Input
                    id="location"
                    name="location"
                    value={form.location}
                    placeholder="Location"
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label>Category</Label>
                <div className="">
                  <Select
                    value={form.category}
                    name="category"
                    onValueChange={(value) => {
                      setForm({ ...form, category: value });
                    }}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Event Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventCategory.map((ev_ct, index) => {
                        const Icon = Icons[
                          ev_ct.icon as keyof typeof Icons
                        ] as LucideIcon;

                        return (
                          <SelectGroup key={index}>
                            <SelectItem
                              value={ev_ct.value}
                              className="flex items-center gap-2"
                            >
                              {Icon && <Icon size={16} />}
                              <span>{ev_ct.label}</span>
                            </SelectItem>
                          </SelectGroup>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  name="is_public"
                  value={form.is_public ? "public" : "private"}
                  onValueChange={(value) =>
                    setForm({ ...form, is_public: value === "public" })
                  }
                >
                  {/* CLOSED STATE → Only Public / Private */}
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue>
                      <div className="flex items-center gap-3 ">
                        {form.is_public ? <Globe /> : <Lock size={18} />}
                        <span className="text-md font-medium">
                          {form.is_public ? "Public" : "Private"}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      {/* PUBLIC OPTION */}
                      <SelectItem value="public" className="py-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Globe size={20} />
                            <span>Public</span>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            Your page is public and visible to everyone
                          </span>
                        </div>
                      </SelectItem>

                      {/* PRIVATE OPTION */}
                      <SelectItem value="private" className="py-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Lock size={18} />
                            <span>Private</span>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            Your page is private and only visible to you
                          </span>
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
                  <Label>Twitter</Label>
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

                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    type="url"
                    placeholder="Paste your url here"
                    value={
                      form.social_links.find(
                        (link) => link.platform === "website"
                      )?.url || ""
                    }
                    onChange={(e) =>
                      handleSocialLinkChange("website", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-2">
              <Label htmlFor="about">About Your Page</Label>
              <Textarea
                id="about"
                name="about"
                placeholder="Describe what your page is about, the types of events you host, etc."
                rows={4}
                value={form.about}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    about: e.target.value,
                  }))
                }
              />
            </div>

            {/* Color Picker */}
            {/* <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl py-3.5 px-4 md:py-0 shadow-sm flex justify-between  items-center gap-3">
                <div className="flex gap-3 items-center">
                  <Palette className="h-4 w-4" />
                  <span className="text-sm font-medium text-nowrap">
                    Brand Color
                  </span>
                </div>

                <div className="flex gap-3 items-center">
                  <span className="text-xs">{form.theme_color}</span>
                  <input
                    type="color"
                    name="theme_color"
                    value={form.theme_color}
                    onChange={(e) =>
                      setForm({ ...form, theme_color: e.target.value })
                    }
                    className="w-7 h-7 appearance-none cursor-pointer border-none p-0"
                  />
                </div>
              </div> */}

            {/* Form Actions */}

            <div className="flex gap-3 justify-end mt-10">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  navigate("/creator/page");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {id ? "Updating..." : "Creating..."}
                  </>
                ) : id ? (
                  "Update Page"
                ) : (
                  "Create Page"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePage;
