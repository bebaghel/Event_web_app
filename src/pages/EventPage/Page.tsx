import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { CalendarPlus, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { deletePage, getAllPages } from "../../services/services";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import Loading from "../loading";
import { mediaUrl } from "../../constants";
import moment from "moment";
import DeleteConfirm from "../../components/shared/DeleteConfirm";
import { IEvent } from "../Explore-Events/Exp_EventDetails";

interface PageStats {
  total_events: number;
  total_attendees: number;
  total_views: number;
}

export interface EventPage {
  _id: string;
  owner: string;
  name: string;
  page_username: string;
  logo?: string;
  banner?: string;
  about?: string;
  category?: string;
  events: IEvent[];
  is_public: boolean;
  is_blocked: boolean;
  subscribers: any[];
  subscribers_count: number;
  stats: PageStats;
  createdAt: string;
  updatedAt: string;
  location: string;
  social_links: [];
}

export default function PagesDashboard() {
  const [pages, setPages] = useState<EventPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const [openDelete, setOpenDelete] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const fetchPages = async () => {
    const payload = {
      user: user?._id,
    };
    try {
      const res = await getAllPages(payload);
      // console.log(res);
      if (res.data.status) {
        setPages(res.data.response.pages || []);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const filteredPages = pages.filter((page) => {
    if (activeTab === "public") return page.is_public;
    if (activeTab === "private") return !page.is_public;
    return true;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const copyPageUrl = (username: string) => {
    const url = `${window.location.origin}/page/${username}`;
    navigator.clipboard.writeText(url);
    toast.success("Page URL copied to clipboard");
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      const res = await deletePage(pageId);
      if (res.data.status) {
        toast.success(res.data.message);
        setOpenDelete(false);
        fetchPages();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete page");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (pages.length === 0) {
    return (
      <div className="h-[70vh] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/event-buddi-whitelogo.png"
            alt="bg"
            className="h-30 w-30"
          />
          <p className="text-muted-foreground">
            Create your first event page to start organizing and sharing events
          </p>
          <Link to="create">
            <Button size="sm" className="gap-2">
              Create Your First Page
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-start sm:items-center gap-4 mb-8">
        {/* <div>
          <h1 className="text-lg md:text-2xl font-semibold">Community Pages</h1>
        </div> */}
        {/* Tabs */}
        <div>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="all">All Pages</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Link to="create">
          <Button size={"sm"}>Create Page</Button>
        </Link>
      </div>

      {/* Pages Grid */}
      <>
        {filteredPages.length == 0 ? (
          <div className="h-[70vh] w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <img
                src="/event-buddi-whitelogo.png"
                alt="bg"
                className="h-30 w-30"
              />
              <p className="font-normal text-lg">No pages found</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page) => (
              <Card
                key={page._id}
                className="overflow-hidden hover:shadow-lg transition-shadow p-0"
              >
                {/* Banner */}
                <div className="relative h-52 w-full">
                  {page.banner ? (
                    <img
                      src={`${mediaUrl}/page_images/${page.banner}`}
                      alt={`${page.name} banner`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-600" />
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={page.is_public ? "default" : "secondary"}>
                      {page.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                </div>

                {/* Logo & Title */}
                <div className="relative px-4 pt-2">
                  <div className="absolute -top-10 left-6">
                    <Avatar className="h-20 w-20 border-4 border-background">
                      <AvatarImage
                        src={`${mediaUrl}/page_images/${page.logo}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-lg bg-primary/10">
                        {getInitials(page.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="pt-8 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{page.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        @{page.page_username}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => copyPageUrl(page.page_username)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <Link to={`update/${page._id}`}>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Page
                          </DropdownMenuItem>
                        </Link>
                        {/* <Link to={`/page/${page.page_username}`}>
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Page
                          </DropdownMenuItem>
                        </Link> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setOpenDelete(true);
                            setPageId(page?._id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Page
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4 pt-0">
                  {/* <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {page.stats.total_events}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Events
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {page.stats.total_attendees}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Attendees
                      </div>
                    </div>
                  </div> */}

                  {page.about && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {page.about}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Created{" "}
                      <strong>
                        {moment(page.createdAt).format("DD MMM, YYYY")}
                      </strong>
                    </span>
                    <span>{page.subscribers_count} Subscribers</span>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link
                      to={`/page/${page.page_username}`}
                      className="w-full"
                      target="_blank"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Page
                      </Button>
                    </Link>
                    <Link
                      to={`/creator/events/add`}
                      state={{ page_id: page?._id }}
                      className="w-full"
                    >
                      <Button size="sm" className="w-full gap-2">
                        <CalendarPlus className="h-4 w-4" />
                        Create Event
                      </Button>
                    </Link>
                    {/* <Link to={`/pages/${page._id}/manage`}>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link> */}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </>

      <DeleteConfirm
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        message="Are you sure you want to delete this page?"
        onConfirm={() => handleDeletePage(pageId!)}
      />
    </>
  );
}
