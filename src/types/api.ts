// Response shapes of helmi-api. Keep in sync with helmi-api/src/lib/{spotify,strava,activity}.ts.

export type TrackSummary = {
  id: string;
  name: string;
  artists: string[];
  album: string;
  imageUrl: string | null;
  url: string;
  durationMs: number;
};

export type NowPlaying = { isPlaying: boolean; track: TrackSummary | null; progressMs: number; fetchedAt: number };

export type RecentTrack = { track: TrackSummary; playedAt: string } | null;

export type SearchTrack = { uri: string; name: string; artists: string[]; imageUrl: string | null; explicit: boolean };

export type StravaRun = {
  name: string;
  sportType: string;
  startDate: string;
  distanceM: number;
  movingTimeS: number;
  elevationM: number;
  avgPaceSPerKm: number;
  polyline: string | null;
};

export type Totals = { count: number; distanceM: number; movingTimeS: number };

export type StravaStats = { recent4w: Totals; ytd: Totals; allTime: Totals };

export type ActivityDays = Record<string, { github: number; bitbucket: number }>;

export type ActivityResponse = { updatedAt: string; days: ActivityDays };
