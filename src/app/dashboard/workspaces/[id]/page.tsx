"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Trash2,
  Loader2,
  Building2,
  Mail,
  Crown,
  Shield,
  User,
  Edit,
  Youtube,
  Save,
  X,
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Workspace {
  _id: string;
  name: string;
  description?: string;
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  channelIds?: Array<{
    _id: string;
    name: string;
  }>;
  settings: {
    allowMemberInvites: boolean;
    defaultProjectVisibility: string;
  };
  createdAt: string;
}

interface WorkspaceMember {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  role: "owner" | "admin" | "editor" | "viewer";
  joinedAt: string;
}

interface Channel {
  _id: string;
  name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const roleIcons = {
  owner: Crown,
  admin: Shield,
  editor: Edit,
  viewer: User,
};

const roleColors = {
  owner: "text-yellow-500",
  admin: "text-purple-500",
  editor: "text-blue-500",
  viewer: "text-gray-500",
};

export default function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showInvite = searchParams.get("invite") === "true";

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(showInvite);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [inviting, setInviting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    channelIds: [] as string[],
  });

  useEffect(() => {
    fetchWorkspace();
    fetchMembers();
    fetchChannels();
  }, [id]);

  const fetchWorkspace = async () => {
    try {
      const res = await fetch(`${API_URL}/api/workspaces/${id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspace(data.workspace);
        setEditForm({
          name: data.workspace.name,
          description: data.workspace.description || "",
          channelIds: data.workspace.channelIds?.map((c: any) => c._id) || [],
        });
      } else {
        router.push("/dashboard/workspaces");
      }
    } catch (error) {
      console.error("Failed to fetch workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/workspaces/${id}/members`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch(`${API_URL}/api/channels`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels || []);
      }
    } catch (error) {
      console.error("Failed to fetch channels:", error);
    }
  };

  const handleInvite = async () => {
    setInviting(true);
    try {
      const res = await fetch(`${API_URL}/api/workspaces/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        setIsInviteOpen(false);
        setInviteEmail("");
        fetchMembers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to invite member");
      }
    } catch (error) {
      console.error("Failed to invite member:", error);
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`${API_URL}/api/workspaces/${id}/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error("Failed to update member role:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await fetch(`${API_URL}/api/workspaces/${id}/members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handleUpdateWorkspace = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/workspaces/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setIsEditOpen(false);
        fetchWorkspace();
      }
    } catch (error) {
      console.error("Failed to update workspace:", error);
    } finally {
      setSaving(false);
    }
  };

  const canManageMembers = () => {
    if (!session?.user || !workspace) return false;
    const userRole = (session.user as any).role;
    // Super admins and admins can always manage
    if (userRole === "super_admin" || userRole === "admin") return true;
    // Check if user is workspace owner by email
    if (workspace.ownerId?.email === session.user.email) return true;
    // Check if user is member with admin role
    const myMembership = members.find((m) => m.userId?.email === session.user?.email);
    return myMembership?.role === "owner" || myMembership?.role === "admin";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500">
              <AvatarFallback className="bg-transparent text-white text-lg">
                {workspace.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{workspace.name}</h1>
              <p className="text-muted-foreground text-sm">
                {workspace.description || "No description"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canManageMembers() && (
            <>
              <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                onClick={() => setIsInviteOpen(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2" />
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Building2 className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  People who have access to this workspace
                </CardDescription>
              </div>
              {canManageMembers() && (
                <Button onClick={() => setIsInviteOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => {
                  const RoleIcon = roleIcons[member.role];
                  return (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.userId.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {member.userId.name}
                            </span>
                            <RoleIcon
                              className={`w-4 h-4 ${roleColors[member.role]}`}
                            />
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {member.userId.email}
                          </span>
                        </div>
                      </div>
                      {canManageMembers() && member.role !== "owner" && (
                        <div className="flex items-center gap-2">
                          <Select
                            value={member.role}
                            onValueChange={(value) =>
                              handleUpdateMemberRole(member._id, value)
                            }
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleRemoveMember(member._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Workspace Settings</CardTitle>
                <CardDescription>
                  Configure your workspace settings
                </CardDescription>
              </div>
              {canManageMembers() && (
                <Button onClick={() => setIsEditOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Workspace
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {/* Workspace Name */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Workspace Name</p>
                    <p className="text-sm text-muted-foreground">
                      {workspace.name}
                    </p>
                  </div>
                  {canManageMembers() && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                      Edit
                    </Button>
                  )}
                </div>

                {/* Description */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">
                      {workspace.description || "No description"}
                    </p>
                  </div>
                  {canManageMembers() && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                      Edit
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Youtube className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium">Assigned Channels</p>
                      <p className="text-sm text-muted-foreground">
                        {workspace.channelIds && workspace.channelIds.length > 0
                          ? workspace.channelIds.map(c => c.name).join(", ")
                          : "No channels assigned"}
                      </p>
                    </div>
                  </div>
                  {canManageMembers() && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                      Change
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Owner</p>
                    <p className="text-sm text-muted-foreground">
                      {workspace.ownerId.name} ({workspace.ownerId.email})
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(workspace.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Invite someone to join this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as "editor" | "viewer")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit className="w-4 h-4 text-blue-500" />
                      Editor - Can create and edit projects
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      Viewer - View only access
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
              {inviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update workspace details and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Workspace Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned Channels</Label>
              <div className="border rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
                {channels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No channels available</p>
                ) : (
                  channels.map((channel) => (
                    <label
                      key={channel._id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editForm.channelIds.includes(channel._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditForm({
                              ...editForm,
                              channelIds: [...editForm.channelIds, channel._id],
                            });
                          } else {
                            setEditForm({
                              ...editForm,
                              channelIds: editForm.channelIds.filter((id) => id !== channel._id),
                            });
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{channel.name}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
              {editForm.channelIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {editForm.channelIds.length} channel{editForm.channelIds.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWorkspace} disabled={saving || !editForm.name}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
