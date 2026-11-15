"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Switch,
} from "@/components/shared/shadcn";
import { adminApi } from "@/lib/api/admin";
import { authErrorMessage, type AuthUser } from "@/lib/api/auth";
import CourseCheckboxList from "./CourseCheckboxList";

function AskAiSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-md border p-3 text-sm">
      <span>Ask AI access</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function useAccessForm(user: AuthUser, onDone: () => void) {
  const [courseIds, setCourseIds] = useState(user.courseIds);
  const [askAiEnabled, setAskAiEnabled] = useState(user.askAiEnabled);
  const [error, setError] = useState<string | null>(null);
  const toggle = (id: string) =>
    setCourseIds((cur) =>
      cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id],
    );
  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
      onDone();
    } catch (err) {
      setError(authErrorMessage(err));
    }
  };
  const input = { courseIds, askAiEnabled };
  return {
    courseIds,
    askAiEnabled,
    setAskAiEnabled,
    toggle,
    error,
    approve: () => run(() => adminApi.approve(user.id, input)),
    reject: () => run(() => adminApi.reject(user.id)),
    save: () => run(() => adminApi.updateAccess(user.id, input)),
  };
}

export default function AccessDialog({
  user,
  onClose,
  onChanged,
}: {
  user: AuthUser;
  onClose: () => void;
  onChanged: () => void;
}) {
  const form = useAccessForm(user, () => {
    onChanged();
    onClose();
  });
  const pending = user.status !== "approved";
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user.firstName} {user.lastName} · {user.email}
          </DialogTitle>
        </DialogHeader>
        <CourseCheckboxList selected={form.courseIds} onToggle={form.toggle} />
        <AskAiSwitch
          checked={form.askAiEnabled}
          onChange={form.setAskAiEnabled}
        />
        {form.error && <p className="text-sm text-destructive">{form.error}</p>}
        <DialogFooter>
          {user.status !== "rejected" && (
            <Button variant="destructive" onClick={form.reject}>
              Reject
            </Button>
          )}
          {pending ? (
            <Button onClick={form.approve}>Approve</Button>
          ) : (
            <Button onClick={form.save}>Save</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
