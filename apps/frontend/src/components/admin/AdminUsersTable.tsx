"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/shadcn";
import type { AuthUser } from "@/lib/api/auth";
import AccessDialog from "./AccessDialog";

const STATUS_VARIANT = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
} as const;

function UserRow({
  user,
  onEdit,
}: {
  user: AuthUser;
  onEdit: (u: AuthUser) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        {user.firstName} {user.lastName}
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[user.status]}>{user.status}</Badge>
      </TableCell>
      <TableCell>{user.courseIds.length}</TableCell>
      <TableCell>{user.askAiEnabled ? "On" : "Off"}</TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
          {user.status === "pending" ? "Review" : "Manage"}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function AdminUsersTable({
  users,
  onChanged,
}: {
  users: AuthUser[];
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<AuthUser | null>(null);
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Courses</TableHead>
            <TableHead>Ask AI</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <UserRow key={u.id} user={u} onEdit={setEditing} />
          ))}
        </TableBody>
      </Table>
      {editing && (
        <AccessDialog
          key={editing.id}
          user={editing}
          onClose={() => setEditing(null)}
          onChanged={onChanged}
        />
      )}
    </>
  );
}
