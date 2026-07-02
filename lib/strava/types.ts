export type StravaTokenResponse = {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: {
    id: number;
    username?: string;
    firstname?: string;
    lastname?: string;
  };
};

export type StravaActivitySummary = {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  type: string;
  sport_type?: string;
  start_date: string;
  start_date_local: string;
  average_heartrate?: number;
  max_heartrate?: number;
  calories?: number;
  description?: string;
};

export type StravaSyncResult = {
  imported: number;
  skipped: number;
  pbsUpdated: number;
  errors: string[];
};
