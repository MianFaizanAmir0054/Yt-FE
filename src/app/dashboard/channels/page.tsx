"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Youtube,
  MoreVertical,
  Trash2,
  Edit,
  Loader2,
  ExternalLink,
  Palette,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  useGetChannelsQuery,
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
} from "@/lib/store/api/channelsApi";
import { Channel } from "@/lib/schemas";
import { z } from "zod";

// Form schema for channel creation/editing
const ChannelFormSchema = z.object({
  name: z.string().min(1, "Channel name is required"),
  youtubeChannelId: z.string().optional(),
  youtubeHandle: z.string().optional(),
  description: z.string().optional(),
  defaultAspectRatio: z.enum(["9:16", "16:9", "1:1"]),
  brandColors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
  }),
});

type ChannelFormInput = z.infer<typeof ChannelFormSchema>;

export default function ChannelsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  // RTK Query hooks
  const {
    data: channelsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetChannelsQuery({});

  const [deleteChannel] = useDeleteChannelMutation();
  const { isLoading: isCreating } = useCreateChannelMutation()[1];
  const { isLoading: isUpdating } = useUpdateChannelMutation()[1];

  const channels = channelsData?.channels || [];
  const isInitialLoading = isLoading && !channelsData;

  const handleDelete = async (channelId: string) => {
    if (!confirm("Are you sure you want to delete this channel?")) return;
    try {
      await deleteChannel(channelId).unwrap();
    } catch (err) {
      console.error("Failed to delete channel:", err);
    }
  };

  const openEdit = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsEditOpen(true);
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-lg font-semibold">Failed to load channels</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {(error as { data?: { error?: string } })?.data?.error || "Something went wrong. Please try again."}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Channels
            {isFetching && <Loader2 className="inline-block w-5 h-5 ml-2 animate-spin text-purple-400" />}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your YouTube channels
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Channel</DialogTitle>
              <DialogDescription>
                Add a YouTube channel to create content for.
              </DialogDescription>
            </DialogHeader>
            <ChannelForm
              onSuccess={() => setIsCreateOpen(false)}
              isCreating={isCreating}
            />
          </DialogContent>
        </Dialog>
      </div>

      {channels.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Youtube className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No channels yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first YouTube channel to start creating content.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <Card key={channel._id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={channel.thumbnailUrl || undefined} />
                      <AvatarFallback
                        style={{ backgroundColor: channel.brandColors?.primary || "#6366f1" }}
                        className="text-white"
                      >
                        {channel.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{channel.name}</CardTitle>
                      {channel.youtubeHandle && (
                        <CardDescription className="flex items-center gap-1">
                          {channel.youtubeHandle}
                          <ExternalLink className="w-3 h-3" />
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(channel)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(channel._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {channel.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {channel.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{channel.defaultAspectRatio}</Badge>
                  <div className="flex items-center gap-1">
                    <Palette className="w-3 h-3 text-muted-foreground" />
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: channel.brandColors?.primary || "#6366f1" }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: channel.brandColors?.secondary || "#818cf8" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) setSelectedChannel(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
            <DialogDescription>
              Update channel settings.
            </DialogDescription>
          </DialogHeader>
          {selectedChannel && (
            <ChannelForm
              channel={selectedChannel}
              onSuccess={() => {
                setIsEditOpen(false);
                setSelectedChannel(null);
              }}
              isUpdating={isUpdating}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ChannelFormProps {
  channel?: Channel;
  onSuccess: () => void;
  isCreating?: boolean;
  isUpdating?: boolean;
}

function ChannelForm({ channel, onSuccess, isCreating, isUpdating }: ChannelFormProps) {
  const [createChannel] = useCreateChannelMutation();
  const [updateChannel] = useUpdateChannelMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ChannelFormInput>({
    resolver: zodResolver(ChannelFormSchema),
    mode: "onChange",
    defaultValues: channel ? {
      name: channel.name,
      youtubeChannelId: channel.youtubeChannelId || "",
      youtubeHandle: channel.youtubeHandle || "",
      description: channel.description || "",
      defaultAspectRatio: channel.defaultAspectRatio as "9:16" | "16:9" | "1:1",
      brandColors: channel.brandColors,
    } : {
      name: "",
      youtubeChannelId: "",
      youtubeHandle: "",
      description: "",
      defaultAspectRatio: "9:16",
      brandColors: {
        primary: "#6366f1",
        secondary: "#818cf8",
        accent: "#c7d2fe",
      },
    },
  });

  const brandColors = watch("brandColors");

  const onSubmit = async (data: ChannelFormInput) => {
    try {
      if (channel) {
        await updateChannel({ id: channel._id, data }).unwrap();
      } else {
        await createChannel(data).unwrap();
      }
      onSuccess();
    } catch (err) {
      console.error("Failed to save channel:", err);
    }
  };

  const saving = isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Channel Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="My Tech Channel"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="youtubeChannelId">YouTube Channel ID</Label>
            <Input
              id="youtubeChannelId"
              {...register("youtubeChannelId")}
              placeholder="UC..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtubeHandle">YouTube Handle</Label>
            <Input
              id="youtubeHandle"
              {...register("youtubeHandle")}
              placeholder="@mychannel"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Channel description..."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Brand Colors</Label>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Primary</Label>
              <input
                type="color"
                value={brandColors.primary}
                onChange={(e) => setValue("brandColors.primary", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Secondary</Label>
              <input
                type="color"
                value={brandColors.secondary}
                onChange={(e) => setValue("brandColors.secondary", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Accent</Label>
              <input
                type="color"
                value={brandColors.accent}
                onChange={(e) => setValue("brandColors.accent", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={saving || !isValid}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {channel ? "Save Changes" : "Create Channel"}
        </Button>
      </DialogFooter>
    </form>
  );
}
