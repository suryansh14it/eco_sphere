"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_CATEGORY_OPTIONS } from "./project-utils";

export interface ProjectRoleValue {
  /** Set for existing roles when editing; absent for new roles. */
  _id?: string;
  title: string;
  description: string;
  slots: number | string;
}

export interface ProjectFormValues {
  title: string;
  description: string;
  category: string;
  address: string;
  district: string;
  state: string;
  startsAt: string;
  endsAt: string;
  roles: ProjectRoleValue[];
  referralId: string;
  status?: string;
}

export interface ProjectFormProps {
  initial?: Partial<ProjectFormValues>;
  /** Edit mode shows status control and role ids survive. */
  isEdit?: boolean;
  saving?: boolean;
  error?: string;
  onSave: (values: ProjectFormValues) => void;
  onCancel?: () => void;
}

function emptyRole(): ProjectRoleValue {
  return { title: "", description: "", slots: "" };
}

function toDateInput(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function ProjectForm({
  initial,
  isEdit = false,
  saving = false,
  error = "",
  onSave,
  onCancel,
}: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [category, setCategory] = useState(initial?.category || "other");
  const [address, setAddress] = useState(initial?.address || "");
  const [district, setDistrict] = useState(initial?.district || "");
  const [state, setState] = useState(initial?.state || "");
  const [startsAt, setStartsAt] = useState(toDateInput(initial?.startsAt));
  const [endsAt, setEndsAt] = useState(toDateInput(initial?.endsAt));
  const [referralId, setReferralId] = useState(initial?.referralId || "");
  const [status, setStatus] = useState(initial?.status || "open");
  const [roles, setRoles] = useState<ProjectRoleValue[]>(
    initial?.roles && initial.roles.length > 0 ? initial.roles : [{ ...emptyRole() }]
  );
  const [localError, setLocalError] = useState("");

  const shownError = error || localError;
  const canSave = useMemo(() => Boolean(title.trim() && description.trim()), [title, description]);

  const updateRole = (index: number, patch: Partial<ProjectRoleValue>) => {
    setRoles((prev) => prev.map((role, i) => (i === index ? { ...role, ...patch } : role)));
  };

  const removeRole = (index: number) => {
    setRoles((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError("");

    if (!title.trim() || !description.trim()) {
      setLocalError("Title and description are required.");
      return;
    }
    if (roles.length === 0 || roles.some((role) => !role.title.trim() || !Number(role.slots))) {
      setLocalError("Every role needs a title and the exact number of volunteers needed.");
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      address: address.trim(),
      district: district.trim(),
      state: state.trim(),
      startsAt: startsAt || "",
      endsAt: endsAt || "",
      referralId: referralId.trim(),
      status,
      roles: roles.map((role) => ({
        ...(role._id ? { _id: role._id } : {}),
        title: role.title.trim(),
        description: role.description.trim(),
        slots: Number(role.slots),
      })),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-emerald-950">About the project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Maheshtala riverbank cleanup"
              maxLength={120}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">
              What will volunteers be doing? <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              maxLength={3000}
              placeholder="Describe the work, the site, what to bring, and the outcome you are aiming for..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Category</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {PROJECT_CATEGORY_OPTIONS.filter((option) => option.value).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Address</label>
              <Input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Meeting point / site"
                maxLength={300}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">District / City</label>
              <Input value={district} onChange={(event) => setDistrict(event.target.value)} maxLength={120} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">State</label>
              <Input value={state} onChange={(event) => setState(event.target.value)} maxLength={120} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Starts on</label>
              <Input type="date" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Ends on</label>
              <Input type="date" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Project status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="open">Open - recruiting volunteers</option>
                <option value="closed">Closed - no longer recruiting</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-emerald-950">
            Volunteer roles <span className="text-red-500">*</span>
          </CardTitle>
          <p className="text-sm text-stone-500">
            State exactly how many volunteers you need for each role. The public board shows live
            signup counts against these numbers.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {roles.map((role, index) => (
            <div key={index} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">
                    Role {index + 1} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={role.title}
                    onChange={(event) => updateRole(index, { title: event.target.value })}
                    placeholder="e.g. Field volunteer, Logistics, Awareness booth"
                    maxLength={80}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">
                    Volunteers needed <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={role.slots}
                    onChange={(event) => updateRole(index, { slots: event.target.value })}
                    placeholder="e.g. 20"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium text-stone-600">What this role does</label>
                <Input
                  value={role.description}
                  onChange={(event) => updateRole(index, { description: event.target.value })}
                  placeholder="Optional - skills needed, duties, shift times..."
                  maxLength={500}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                {role._id ? (
                  <span className="text-xs text-stone-500">Existing role - volunteers count against this</span>
                ) : (
                  <span className="text-xs text-stone-500">New role</span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={roles.length === 1}
                  onClick={() => removeRole(index)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove role
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            disabled={roles.length >= 10}
            onClick={() => setRoles((prev) => [...prev, { ...emptyRole() }])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add another role
          </Button>
        </CardContent>
      </Card>

      {!isEdit && (
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-emerald-950">Government referral</CardTitle>
            <p className="text-sm text-stone-500">
              Get a referral from your local government office before listing. This confirms your
              organisation works with the authorities.
            </p>
          </CardHeader>
          <CardContent>
            <label className="mb-1 block text-xs font-medium text-stone-600">
              Referral ID <span className="text-red-500">*</span>
            </label>
            <Input
              value={referralId}
              onChange={(event) => setReferralId(event.target.value)}
              placeholder="Issued offline by the government office"
            />
            <p className="mt-2 text-xs text-stone-500">
              Example format: <span className="font-mono">greentrust1234</span> - your organisation
              name followed by the office code.
            </p>
          </CardContent>
        </Card>
      )}

      {shownError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {shownError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!canSave || saving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {isEdit ? "Save changes" : "Publish project"}
        </Button>
      </div>
    </form>
  );
}
