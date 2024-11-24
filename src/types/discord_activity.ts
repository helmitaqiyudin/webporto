export interface DiscordData {
  success: boolean;
  data: DiscordActivity;
}

export interface DiscordActivity {
  discord_user: DiscordUser;
  activities: Activity[];
  discord_status: string;
  active_on_discord_web: boolean;
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
  listening_to_spotify: boolean;
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  bot: boolean;
  global_name: string;
  display_name: string;
  public_flags: number;
}

export interface Activity {
  id: string;
  name: string;
  type: number;
  state: string;
  details: string;
  application_id: string;
  timestamps: Timestamps;
  assets: Assets;
  created_at: number;
  session_id: string;
  buttons: string[];
}

export interface Assets {
  large_image: string;
  large_text: string;
  small_image: string;
  small_text: string;
}

export interface Timestamps {
  start: number;
  end: number;
}
