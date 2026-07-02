"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Activity, ExternalLink, RefreshCw, Unplug } from "lucide-react";

import {
  disconnectStravaAction,
  syncStravaAction,
  type StravaStatusDTO,
} from "@/app/actions/strava";
import { APP_NAME } from "@/lib/brand";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatDistance(meters: number | null) {
  if (!meters) return null;
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

type Props = {
  status: StravaStatusDTO;
};

export function StravaConnectCard({ status }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSync = () => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await syncStravaAction();
      if (result.error) setError(result.error);
      else if (result.success) setMessage(result.success);
    });
  };

  const handleDisconnect = () => {
    if (!confirm(`Disconnect Strava? Your imported workouts will stay in ${APP_NAME}.`)) return;
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await disconnectStravaAction();
      if (result.error) setError(result.error);
      else if (result.success) setMessage(result.success);
    });
  };

  return (
    <Card className="border-white/8 bg-card/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FC4C02]/15">
              <Activity className="h-5 w-5 text-[#FC4C02]" />
            </div>
            <div>
              <CardTitle className="text-lg">Strava</CardTitle>
              <CardDescription>
                Import runs, rides, and training sessions into your workout log and PB board.
              </CardDescription>
            </div>
          </div>
          {status.connected ? (
            <Badge variant="outline" className="border-lime/30 text-lime">
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Not connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status.configured && (
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-sm text-amber-200/90">
            Strava credentials are not configured. Add <code className="text-xs">STRAVA_CLIENT_ID</code>{" "}
            and <code className="text-xs">STRAVA_CLIENT_SECRET</code> to your environment, then set the
            redirect URI in your Strava app to{" "}
            <code className="text-xs break-all">/api/strava/callback</code>.
          </div>
        )}

        {status.connected ? (
          <>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Athlete ID</dt>
                <dd className="font-medium">{status.stravaAthleteId}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Activities synced</dt>
                <dd className="font-medium">{status.activityCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last sync</dt>
                <dd className="font-medium">
                  {status.lastSyncedAt
                    ? new Date(status.lastSyncedAt).toLocaleString()
                    : "Never"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Connected</dt>
                <dd className="font-medium">
                  {new Date(status.connectedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>

            {status.recentActivities.length > 0 && (
              <div className="rounded-lg border border-white/8 bg-black/20 p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recent imports
                </p>
                <ul className="space-y-2">
                  {status.recentActivities.map((activity) => (
                    <li
                      key={activity.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate">{activity.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDistance(activity.distanceMeters) ?? formatDuration(activity.movingTimeSeconds) ?? activity.activityType}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleSync}
                disabled={isPending}
                className="bg-lime text-black hover:bg-lime/90"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                Sync now
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDisconnect}
                disabled={isPending}
              >
                <Unplug className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect Strava to automatically import the last 90 days of activities. New runs and
              rides can update your personal bests and recovery metrics.
            </p>
            <Link
              href="/api/strava/connect"
              className={cn(
                buttonVariants({ size: "default" }),
                "bg-[#FC4C02] text-white hover:bg-[#FC4C02]/90",
                !status.configured && "pointer-events-none opacity-50",
              )}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect Strava
            </Link>
          </div>
        )}

        {message && (
          <p className="text-sm text-lime" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
