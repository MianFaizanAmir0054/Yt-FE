"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Users,
  MoreVertical,
  Trash2,
  Loader2,
  Building2,
  UserPlus,
  Eye,
  AlertCircle,
  Edit,
  Link2,
  X,
  Mail,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useAddChannelsToWorkspaceMutation,
  useRemoveChannelFromWorkspaceMutation,
  useInviteMemberMutation,
  useGetWorkspaceMembersQuery,
  useRemoveMemberMutation,
  useUpdateMemberMutation,
} from "@/lib/store/api/workspacesApi";
import { useGetChannelsQuery } from "@/lib/store/api/channelsApi";
import { Workspace, UserRef, ChannelRef, Channel } from "@/lib/schemas";
import { z } from "zod";

// Form schemas
const WorkspaceFormSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
});

const InviteFormSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["admin", "editor", "viewer"]),
});

type WorkspaceFormInput = z.infer<typeof WorkspaceFormSchema>;

export default function WorkspacesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  // RTK Query hooks
  const {
    data: workspacesData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetWorkspacesQuery({});

  const { data: channelsData } = useGetChannelsQuery({});

  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
  const [updateWorkspace, { isLoading: isUpdating }] = useUpdateWorkspaceMutation();
  const [deleteWorkspace, { isLoading: isDeleting }] = useDeleteWorkspaceMutation();
  const [addChannels, { isLoading: isAddingChannels }] = useAddChannelsToWorkspaceMutation();
  const [removeChannel, { isLoading: isRemovingChannel }] = useRemoveChannelFromWorkspaceMutation();
  const [inviteMember, { isLoading: isInviting }] = useInviteMemberMutation();

  // Separate forms for create and edit to avoid state conflicts
  const createForm = useForm<WorkspaceFormInput>({
    resolver: zodResolver(WorkspaceFormSchema),
    mode: "onChange",
    defaultValues: { name: "", description: "" },
  });

  const editForm = useForm<WorkspaceFormInput>({
    resolver: zodResolver(WorkspaceFormSchema),
    mode: "onChange",
    defaultValues: { name: "", description: "" },
  });

  const inviteForm = useForm({
    resolver: zodResolver(InviteFormSchema),
    mode: "onChange",
    defaultValues: { email: "", role: "editor" as const },
  });

  const workspaces = workspacesData?.workspaces || [];
  const channels = channelsData?.channels || [];
  const isInitialLoading = isLoading && !workspacesData;

  // Populate edit form when opening
  useEffect(() => {
    if (selectedWorkspace && isEditOpen) {
      editForm.reset({
        name: selectedWorkspace.name,
        description: selectedWorkspace.description || "",
      });
    }
  }, [selectedWorkspace, isEditOpen, editForm]);

  const onCreateSubmit = async (data: WorkspaceFormInput) => {
    try {
      await createWorkspace(data).unwrap();
      setIsCreateOpen(false);
      createForm.reset();
    } catch (err) {
      console.error("Failed to create workspace:", err);
    }
  };

  const onEditSubmit = async (data: WorkspaceFormInput) => {
    if (!selectedWorkspace) return;
    try {
      await updateWorkspace({ id: selectedWorkspace._id, data }).unwrap();
      setIsEditOpen(false);
      setSelectedWorkspace(null);
      editForm.reset();
    } catch (err) {
      console.error("Failed to update workspace:", err);
    }
  };

  const openEdit = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setIsEditOpen(true);
  };

  const openManage = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setIsManageOpen(true);
  };

  const handleDelete = async (workspaceId: string) => {
    if (!confirm("Are you sure you want to delete this workspace? All data will be lost.")) return;
    try {
      await deleteWorkspace(workspaceId).unwrap();
    } catch (err) {
      console.error("Failed to delete workspace:", err);
    }
  };

  const handleAddChannel = async (channelId: string) => {
    if (!selectedWorkspace) return;
    try {
      await addChannels({ id: selectedWorkspace._id, channelIds: [channelId] }).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to add channel:", err);
    }
  };

  const handleRemoveChannel = async (channelId: string) => {
    if (!selectedWorkspace) return;
    try {
      await removeChannel({ workspaceId: selectedWorkspace._id, channelId }).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to remove channel:", err);
    }
  };

  const onInviteSubmit = async (data: { email: string; role: "admin" | "editor" | "viewer" }) => {
    if (!selectedWorkspace) return;
    try {
      await inviteMember({ workspaceId: selectedWorkspace._id, data }).unwrap();
      inviteForm.reset();
    } catch (err) {
      console.error("Failed to invite member:", err);
    }
  };

  const canManage = (workspace: Workspace) => {
    if (!session?.user) return false;
    const userRole = (session.user as { role?: string }).role;
    if (!workspace.ownerId) return userRole === "super_admin" || userRole === "admin";
    const ownerId = typeof workspace.ownerId === "string" 
      ? workspace.ownerId 
      : (workspace.ownerId as UserRef)._id;
    return (
      userRole === "super_admin" ||
      userRole === "admin" ||
      ownerId === session.user.id
    );
  };

  const getOwnerName = (workspace: Workspace): string => {
    if (!workspace.ownerId) return "Unknown";
    if (typeof workspace.ownerId === "string") return "Unknown";
    return (workspace.ownerId as UserRef).name;
  };

  const getAssignedChannelIds = (workspace: Workspace): string[] => {
    if (!workspace.channelIds) return [];
    return workspace.channelIds.map((ch) => 
      typeof ch === "string" ? ch : (ch as ChannelRef)._id
    );
  };

  const getAvailableChannels = (workspace: Workspace): Channel[] => {
    const assignedIds = getAssignedChannelIds(workspace);
    return channels.filter((ch) => !assignedIds.includes(ch._id));
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
        <h3 className="text-lg font-semibold">Failed to load workspaces</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {(error as { data?: { error?: string } })?.data?.error || 
           (error as { error?: string })?.error ||
           "Something went wrong. Please try again."}
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
            Workspaces
            {isFetching && <Loader2 className="inline-block w-5 h-5 ml-2 animate-spin text-purple-400" />}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your team workspaces and collaborators
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              New Workspace
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>
                Create a new workspace to organize your team and projects.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name *</Label>
                  <Input
                    id="name"
                    {...createForm.register("name")}
                    placeholder="Marketing Team"
                    className={createForm.formState.errors.name ? "border-red-500" : ""}
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-red-500">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...createForm.register("description")}
                    placeholder="What is this workspace for?"
                    rows={3}
                    className={createForm.formState.errors.description ? "border-red-500" : ""}
                  />
                  {createForm.formState.errors.description && (
                    <p className="text-sm text-red-500">{createForm.formState.errors.description.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    createForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Workspace
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {workspaces.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first workspace to start collaborating with your team.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Workspace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Card
              key={workspace._id}
              className="group hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/workspaces/${workspace._id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500">
                      <AvatarFallback className="bg-transparent text-white">
                        {workspace.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <CardDescription className="text-xs">
                        Owner: {getOwnerName(workspace)}
                      </CardDescription>
                    </div>
                  </div>
                  {canManage(workspace) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/workspaces/${workspace._id}`);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(workspace);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openManage(workspace);
                          }}
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Manage Channels
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openManage(workspace);
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite Members
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          disabled={isDeleting}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(workspace._id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {workspace.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {workspace.description}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>1+ members</span>
                  </div>
                  {workspace.channelIds && workspace.channelIds.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {typeof workspace.channelIds[0] === "string"
                        ? "Channel"
                        : (workspace.channelIds[0] as ChannelRef).name}
                      {workspace.channelIds.length > 1 && ` +${workspace.channelIds.length - 1}`}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) {
          setSelectedWorkspace(null);
          editForm.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update workspace details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Workspace Name *</Label>
                <Input
                  id="edit-name"
                  {...editForm.register("name")}
                  placeholder="Marketing Team"
                  className={editForm.formState.errors.name ? "border-red-500" : ""}
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  {...editForm.register("description")}
                  placeholder="What is this workspace for?"
                  rows={3}
                  className={editForm.formState.errors.description ? "border-red-500" : ""}
                />
                {editForm.formState.errors.description && (
                  <p className="text-sm text-red-500">{editForm.formState.errors.description.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedWorkspace(null);
                  editForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Workspace Dialog (Channels & Members) */}
      <Dialog open={isManageOpen} onOpenChange={(open) => {
        setIsManageOpen(open);
        if (!open) {
          setSelectedWorkspace(null);
          inviteForm.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage {selectedWorkspace?.name || "Workspace"}
            </DialogTitle>
            <DialogDescription>
              Assign channels and invite team members to this workspace.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="channels" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="channels">
                <Link2 className="w-4 h-4 mr-2" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="w-4 h-4 mr-2" />
                Members
              </TabsTrigger>
            </TabsList>

            {/* Channels Tab */}
            <TabsContent value="channels" className="space-y-4">
              {/* Assigned Channels */}
              <div className="space-y-2">
                <Label>Assigned Channels</Label>
                {selectedWorkspace?.channelIds && selectedWorkspace.channelIds.length > 0 ? (
                  <div className="space-y-2">
                    {selectedWorkspace.channelIds.map((ch) => {
                      const channelId = typeof ch === "string" ? ch : (ch as ChannelRef)._id;
                      const channelData = channels.find((c) => c._id === channelId);
                      const channelName = channelData?.name || (typeof ch === "object" ? (ch as ChannelRef).name : "Unknown");
                      return (
                        <div key={channelId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{channelName}</Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            disabled={isRemovingChannel}
                            onClick={() => handleRemoveChannel(channelId)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    No channels assigned yet
                  </p>
                )}
              </div>

              {/* Add Channel */}
              <div className="space-y-2">
                <Label>Add Channel</Label>
                {selectedWorkspace && getAvailableChannels(selectedWorkspace).length > 0 ? (
                  <div className="space-y-2">
                    {getAvailableChannels(selectedWorkspace).map((channel) => (
                      <div key={channel._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{channel.name}</span>
                          {channel.youtubeHandle && (
                            <span className="text-xs text-muted-foreground">{channel.youtubeHandle}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isAddingChannels}
                          onClick={() => handleAddChannel(channel._id)}
                        >
                          {isAddingChannels ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    {channels.length === 0 
                      ? "No channels available. Create a channel first."
                      : "All channels are already assigned to this workspace."}
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-4">
              {/* Invite Form */}
              <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Invite New Member</Label>
                  <div className="flex gap-2">
                    <Input
                      {...inviteForm.register("email")}
                      placeholder="email@example.com"
                      type="email"
                      className={`flex-1 ${inviteForm.formState.errors.email ? "border-red-500" : ""}`}
                    />
                    <Select
                      defaultValue="editor"
                      onValueChange={(value) => inviteForm.setValue("role", value as "admin" | "editor" | "viewer")}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit" disabled={isInviting}>
                      {isInviting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {inviteForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{inviteForm.formState.errors.email.message}</p>
                  )}
                </div>
              </form>

              {/* Members List */}
              {selectedWorkspace && (
                <WorkspaceMembersList workspaceId={selectedWorkspace._id} />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Separate component for members list to handle its own data fetching
function WorkspaceMembersList({ workspaceId }: { workspaceId: string }) {
  const { data: membersData, isLoading } = useGetWorkspaceMembersQuery({ workspaceId });
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();
  const [updateMember, { isLoading: isUpdatingMember }] = useUpdateMemberMutation();

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this member from the workspace?")) return;
    try {
      await removeMember({ workspaceId, memberId }).unwrap();
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  const handleUpdateRole = async (memberId: string, role: "admin" | "editor" | "viewer") => {
    try {
      await updateMember({ workspaceId, memberId, data: { role } }).unwrap();
    } catch (err) {
      console.error("Failed to update member:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  const owner = membersData?.owner;
  const members = membersData?.members || [];

  return (
    <div className="space-y-2">
      <Label>Team Members</Label>
      <div className="space-y-2">
        {/* Owner */}
        {owner && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>{(owner as UserRef).name?.charAt(0) || "O"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{(owner as UserRef).name}</p>
                <p className="text-xs text-muted-foreground">{(owner as UserRef).email}</p>
              </div>
            </div>
            <Badge>Owner</Badge>
          </div>
        )}

        {/* Members */}
        {members.length > 0 ? (
          members.map((member) => {
            const user = typeof member.userId === "object" ? member.userId as UserRef : null;
            return (
              <div key={member._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{user?.name?.charAt(0) || "M"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.status === "pending" ? (
                    <Badge variant="outline" className="text-yellow-600">Pending</Badge>
                  ) : (
                    <Select
                      defaultValue={member.role}
                      onValueChange={(value) => handleUpdateRole(member._id, value as "admin" | "editor" | "viewer")}
                      disabled={isUpdatingMember}
                    >
                      <SelectTrigger className="w-[100px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                    disabled={isRemoving}
                    onClick={() => handleRemove(member._id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
            No team members yet. Invite someone above!
          </p>
        )}
      </div>
    </div>
  );
}
