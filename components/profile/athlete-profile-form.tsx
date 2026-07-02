"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, User } from "lucide-react";

import { saveAthleteProfileAction, type AthleteProfileDTO } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDepartmentConfig } from "@/lib/departments";
import {
  EXPERIENCE_LEVELS,
  GENDERS,
  TRAINING_ENVIRONMENTS,
  TRAINING_GOALS,
} from "@/lib/profile-constants";
import type { SportDepartment } from "@prisma/client";
import { cn } from "@/lib/utils";

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface p-5 space-y-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {children}
    </div>
  );
}

function SelectField({
  id,
  name,
  label,
  defaultValue,
  options,
  required,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  options: ReadonlyArray<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="flex h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3 text-sm text-foreground outline-none focus:border-lime/40"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxGroup({
  name,
  label,
  options,
  defaultSelected,
}: {
  name: string;
  label: string;
  options: { id: string; label: string }[];
  defaultSelected: string[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5 cursor-pointer hover:border-lime/30 transition-colors",
              defaultSelected.includes(opt.id) && "border-lime/30 bg-lime/5",
            )}
          >
            <input
              type="checkbox"
              name={name}
              value={opt.id}
              defaultChecked={defaultSelected.includes(opt.id)}
              className="accent-lime"
            />
            <span className="text-sm text-foreground">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function AthleteProfileForm({
  profile,
  sportDepartment,
}: {
  profile: AthleteProfileDTO | null;
  sportDepartment: SportDepartment;
}) {
  const [state, formAction, pending] = useActionState(saveAthleteProfileAction, {});
  const focusOptions = getDepartmentConfig(sportDepartment).focusAreas.map((f) => ({
    id: f.id,
    label: f.label,
  }));

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup title="Basics">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={profile?.name ?? ""}
              placeholder="Your name"
              required
              className="h-11 rounded-xl border-white/10 bg-white/6"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              min={13}
              max={100}
              defaultValue={profile?.age ?? ""}
              required
              className="h-11 rounded-xl border-white/10 bg-white/6"
            />
          </div>
          <SelectField
            id="gender"
            name="gender"
            label="Gender"
            defaultValue={profile?.gender}
            options={GENDERS}
            required
          />
          <div className="space-y-1.5">
            <Label htmlFor="heightCm">Height (cm)</Label>
            <Input
              id="heightCm"
              name="heightCm"
              type="number"
              step="0.1"
              defaultValue={profile?.heightCm ?? ""}
              placeholder="175"
              required
              className="h-11 rounded-xl border-white/10 bg-white/6"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="weightKg">Weight (kg)</Label>
            <Input
              id="weightKg"
              name="weightKg"
              type="number"
              step="0.1"
              defaultValue={profile?.weightKg ?? ""}
              placeholder="80"
              required
              className="h-11 rounded-xl border-white/10 bg-white/6"
            />
          </div>
        </div>
      </FieldGroup>

      <FieldGroup title="Training background">
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            id="experienceLevel"
            name="experienceLevel"
            label="Experience level"
            defaultValue={profile?.experienceLevel}
            options={EXPERIENCE_LEVELS.map((l) => ({ value: l.value, label: l.label }))}
            required
          />
          <div className="space-y-1.5">
            <Label htmlFor="trainingAgeMonths">Training age (months)</Label>
            <Input
              id="trainingAgeMonths"
              name="trainingAgeMonths"
              type="number"
              min={0}
              defaultValue={profile?.trainingAgeMonths ?? ""}
              placeholder="e.g. 24"
              required
              className="h-11 rounded-xl border-white/10 bg-white/6"
            />
          </div>
          <SelectField
            id="trainingEnvironment"
            name="trainingEnvironment"
            label="Where you train"
            defaultValue={profile?.trainingEnvironment}
            options={TRAINING_ENVIRONMENTS.map((e) => ({ value: e.value, label: e.label }))}
            required
          />
          <div className="space-y-1.5">
            <Label htmlFor="trainingDaysPerWeek">Training days / week</Label>
            <Input
              id="trainingDaysPerWeek"
              name="trainingDaysPerWeek"
              type="number"
              min={1}
              max={7}
              defaultValue={profile?.trainingDaysPerWeek ?? ""}
              required
              className="h-11 rounded-xl border-white/10 bg-white/6"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="crossfitAffiliate">
              Affiliate / gym name{" "}
              <span className="text-muted-foreground font-normal">optional</span>
            </Label>
            <Input
              id="crossfitAffiliate"
              name="crossfitAffiliate"
              defaultValue={profile?.crossfitAffiliate ?? ""}
              placeholder="e.g. CrossFit Example"
              className="h-11 rounded-xl border-white/10 bg-white/6"
            />
          </div>
        </div>
      </FieldGroup>

      <FieldGroup title="Goals & focus">
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            id="primaryGoal"
            name="primaryGoal"
            label="Primary goal"
            defaultValue={profile?.primaryGoal}
            options={TRAINING_GOALS.map((g) => ({ value: g.value, label: g.label }))}
            required
          />
          <div className="space-y-1.5">
            <Label htmlFor="competitionTarget">
              Competition target{" "}
              <span className="text-muted-foreground font-normal">optional</span>
            </Label>
            <Input
              id="competitionTarget"
              name="competitionTarget"
              defaultValue={profile?.competitionTarget ?? ""}
              placeholder="e.g. Quarterfinals 2026"
              className="h-11 rounded-xl border-white/10 bg-white/6"
            />
          </div>
        </div>
        <CheckboxGroup
          name="focusAreas"
          label="Focus areas (select at least one)"
          options={focusOptions}
          defaultSelected={profile?.focusAreas ?? []}
        />
        <CheckboxGroup
          name="strongAreas"
          label="Current strengths (optional)"
          options={focusOptions}
          defaultSelected={profile?.strongAreas ?? []}
        />
      </FieldGroup>

      <FieldGroup title="Health & recovery">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sleepTargetHours">
              Sleep target (hours){" "}
              <span className="text-muted-foreground font-normal">optional</span>
            </Label>
            <Input
              id="sleepTargetHours"
              name="sleepTargetHours"
              type="number"
              step="0.5"
              min={4}
              max={12}
              defaultValue={profile?.sleepTargetHours ?? ""}
              placeholder="8"
              className="h-11 rounded-xl border-white/10 bg-white/6"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="injuriesNotes">
            Injuries / limitations{" "}
            <span className="text-muted-foreground font-normal">optional</span>
          </Label>
          <Textarea
            id="injuriesNotes"
            name="injuriesNotes"
            defaultValue={profile?.injuriesNotes ?? ""}
            placeholder="e.g. Previous shoulder injury — avoid heavy overhead volume"
            rows={2}
            className="rounded-xl border-white/10 bg-white/6 resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="coachNotes">
            Anything else your coach should know{" "}
            <span className="text-muted-foreground font-normal">optional</span>
          </Label>
          <Textarea
            id="coachNotes"
            name="coachNotes"
            defaultValue={profile?.coachNotes ?? ""}
            placeholder="Training preferences, schedule constraints, nutrition notes…"
            rows={3}
            className="rounded-xl border-white/10 bg-white/6 resize-none"
          />
        </div>
      </FieldGroup>

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}
      {state.success && (
        <div className="flex items-center gap-2 rounded-xl border border-lime/20 bg-lime/8 px-3 py-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-lime" />
          <p className="text-sm text-lime">{state.success}</p>
        </div>
      )}

      <Button type="submit" disabled={pending} size="lg" className="w-full gap-2">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving profile…
          </>
        ) : (
          <>
            <User className="h-4 w-4" />
            Save athlete profile
          </>
        )}
      </Button>
    </form>
  );
}
