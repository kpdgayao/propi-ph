"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  MoreVertical,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  Key,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  _count: {
    verifiedAgents: number;
    moderatedListings: number;
  };
}

interface AdminManagementTableProps {
  admins: Admin[];
  currentAdminId: string;
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MODERATOR: "Moderator",
};

const roleBadgeVariants: Record<string, "default" | "secondary" | "outline"> = {
  SUPER_ADMIN: "default",
  ADMIN: "secondary",
  MODERATOR: "outline",
};

export function AdminManagementTable({
  admins,
  currentAdminId,
}: AdminManagementTableProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    admin: Admin | null;
  }>({ open: false, admin: null });
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean;
    admin: Admin | null;
  }>({ open: false, admin: null });
  const [newPassword, setNewPassword] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "MODERATOR",
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create admin");
      }

      toast({
        title: "Admin created",
        description: `${formData.name} has been added as ${roleLabels[formData.role]}`,
      });

      setCreateDialogOpen(false);
      setFormData({ email: "", password: "", name: "", role: "MODERATOR" });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create admin",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRole = async (adminId: string, role: string) => {
    setIsUpdating(adminId);
    try {
      const res = await fetch(`/api/admin/admins/${adminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      toast({
        title: "Role updated",
        description: `Admin role changed to ${roleLabels[role]}`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleToggleActive = async (admin: Admin) => {
    setIsUpdating(admin.id);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !admin.isActive }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      toast({
        title: admin.isActive ? "Admin deactivated" : "Admin activated",
        description: `${admin.name} has been ${admin.isActive ? "deactivated" : "activated"}`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.admin) return;

    setIsUpdating(deleteDialog.admin.id);
    try {
      const res = await fetch(`/api/admin/admins/${deleteDialog.admin.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete admin");
      }

      toast({
        title: "Admin deleted",
        description: `${deleteDialog.admin.name} has been removed`,
      });

      setDeleteDialog({ open: false, admin: null });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete admin",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordDialog.admin || !newPassword) return;

    setIsUpdating(resetPasswordDialog.admin.id);
    try {
      const res = await fetch(
        `/api/admin/admins/${resetPasswordDialog.admin.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      toast({
        title: "Password reset",
        description: `Password has been reset for ${resetPasswordDialog.admin.name}`,
      });

      setResetPasswordDialog({ open: false, admin: null });
      setNewPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
          {/* Header with Create Button */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Administrators</h2>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Admin</DialogTitle>
                  <DialogDescription>
                    Add a new administrator to the platform. They will receive
                    access based on their assigned role.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAdmin}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="admin@propi.ph"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Minimum 12 characters"
                        minLength={12}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MODERATOR">
                            Moderator - Can moderate listings
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            Admin - Can manage agents and listings
                          </SelectItem>
                          <SelectItem value="SUPER_ADMIN">
                            Super Admin - Full access
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Admin"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Activity</TableHead>
                  <TableHead className="hidden sm:table-cell">Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No admins found
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => {
                    const isSelf = admin.id === currentAdminId;
                    return (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {admin.name}
                              {isSelf && (
                                <span className="ml-2 text-xs text-gray-500">
                                  (You)
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {admin.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleBadgeVariants[admin.role]}>
                            <Shield className="mr-1 h-3 w-3" />
                            {roleLabels[admin.role]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm text-gray-600">
                            <p>
                              {admin._count.verifiedAgents} agents verified
                            </p>
                            <p>
                              {admin._count.moderatedListings} listings moderated
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-sm text-gray-500 sm:table-cell">
                          {admin.lastLoginAt
                            ? new Date(admin.lastLoginAt).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          {admin.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isUpdating === admin.id}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Role change submenu */}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateRole(admin.id, "MODERATOR")
                                }
                                disabled={
                                  admin.role === "MODERATOR" || isSelf
                                }
                              >
                                Set as Moderator
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateRole(admin.id, "ADMIN")
                                }
                                disabled={admin.role === "ADMIN" || isSelf}
                              >
                                Set as Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateRole(admin.id, "SUPER_ADMIN")
                                }
                                disabled={
                                  admin.role === "SUPER_ADMIN" || isSelf
                                }
                              >
                                Set as Super Admin
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  setResetPasswordDialog({
                                    open: true,
                                    admin,
                                  })
                                }
                              >
                                <Key className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {admin.isActive ? (
                                <DropdownMenuItem
                                  onClick={() => handleToggleActive(admin)}
                                  disabled={isSelf}
                                  className="text-yellow-600"
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleToggleActive(admin)}
                                  className="text-green-600"
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  setDeleteDialog({ open: true, admin })
                                }
                                disabled={isSelf}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, admin: open ? deleteDialog.admin : null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{deleteDialog.admin?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) =>
          setResetPasswordDialog({
            open,
            admin: open ? resetPasswordDialog.admin : null,
          })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <span className="font-medium">
                {resetPasswordDialog.admin?.name}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 12 characters"
              minLength={12}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResetPasswordDialog({ open: false, admin: null });
                setNewPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={newPassword.length < 12}
            >
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
