import { Activity } from "@/types/discord_activity";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusColor = (status: string | undefined) => {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "idle":
      return "bg-yellow-500";
    case "dnd":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export const getStatusText = (status: string | undefined) => {
  switch (status) {
    case "online":
      return "Online";
    case "idle":
      return "Idle";
    case "dnd":
      return "Do Not Disturb";
    default:
      return "Offline";
  }
};

export const getStatusType = (type: number | undefined) => {
  switch (type) {
    case 0:
      return "Playing";
    case 2:
      return "Listening";
    case 3:
      return "Watching";
    case 5:
      return "Competing";
    default:
      return null;
  }
};

export const calculateTimes = (activities: Activity[], now: number) => {
  const elapsedTimes: { [key: string]: string } = {};
  const musicProgress: { [key: string]: number } = {};

  activities.forEach((activity: Activity) => {
    if (activity.timestamps?.start) {
      const start = activity.timestamps.start;
      const elapsed = Math.floor((now - start) / 1000);
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);

      if (activity.type === 2 && activity.timestamps.end) {
        const total = activity.timestamps.end - activity.timestamps.start;
        const current = now - activity.timestamps.start;
        const progress = Math.min((current / total) * 100, 100);
        musicProgress[activity.id] = progress;

        const totalSeconds = Math.floor(
          (activity.timestamps.end - activity.timestamps.start) / 1000
        );
        const elapsedSeconds = Math.floor(
          (now - activity.timestamps.start) / 1000
        );
        const remainingSeconds = totalSeconds - elapsedSeconds;

        if (remainingSeconds > 0) {
          const elapsedMins = Math.floor(elapsedSeconds / 60);
          const elapsedSecs = elapsedSeconds % 60;
          const totalMins = Math.floor(totalSeconds / 60);
          const totalSecs = totalSeconds % 60;

          elapsedTimes[activity.id] = `${String(elapsedMins).padStart(
            2,
            "0"
          )}:${String(elapsedSecs).padStart(2, "0")} / ${String(
            totalMins
          ).padStart(2, "0")}:${String(totalSecs).padStart(2, "0")}`;
        } else {
          elapsedTimes[activity.id] = "Finished";
        }
      } else {
        elapsedTimes[activity.id] =
          hours > 0 ? `${hours}h ${minutes}m elapsed` : `${minutes}m elapsed`;
      }
    }
  });

  return { elapsedTimes, musicProgress };
};
