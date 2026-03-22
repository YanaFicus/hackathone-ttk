export type TrackKind = 'audio' | 'video';
export type RepeatMode = 'off' | 'track' | 'playlist';
export type BotState = 'idle' | 'playing' | 'paused' | 'stopped';

export interface LiveKitTokenRequest {
  id: string | null;
  username: string;
  role: 'user' | 'Leading' | 'endmin';
}

export interface LiveKitPermissions {
  can_publish: boolean;
  can_subscribe: boolean;
  can_publish_data: boolean;
  room_join: boolean;
  room_admin: boolean;
}

export interface LiveKitTokenResponse {
  token: string;
  permissions: LiveKitPermissions;
}

export interface TrackItem {
  url: string;
  src: string;
  filename: string;
  content_type: string;
  size: number;
  duration: number;
  title?: string;
  artist?: string;
  kind?: TrackKind;
  duration_sec?: number;
}

export interface BotInfo {
  queue: TrackItem[];
  current: TrackItem | null;
  current_track_index: number | null;
  state: BotState;
  position: number;
  is_muted: boolean;
  repeat_mode: RepeatMode;
}

export type AddToQueueRequest = string[];

export interface InsertToQueueRequest {
  key: string;
  kind: TrackKind;
  duration_sec: number;
}

export interface MoveTrackRequest {
  old_index: number;
  new_index: number;
}

export interface SetPositionRequest {
  position_sec: number;
}

export interface SetMuteRequest {
  muted: boolean;
  with_video?: boolean;
}

export interface SetRepeatRequest {
  mode: RepeatMode;
}

export interface UploadIntentRequest {
  user_id: string;
  content_type: string;
  filename: string;
  size: number;
}

export interface UploadIntentResponse {
  url: string;
  fields: Record<string, string> & {
    key: string;
    'Content-Type': string;
  };
}

export interface UploadCompleteRequest {
  key: string;
}

export interface MediaFile {
  url: string;
  src: string;
  filename: string;
  content_type: string;
  size: number;
  duration: number;
}

export interface PresignedUrlRequest {
  key: string;
  filename: string;
}

export interface LibraryResponse {
  data: MediaFile[];
  meta: {
    total?: number;
    skip?: number;
    limit?: number;
    [key: string]: unknown;
  };
}

export interface LibraryQueryParams {
  user_id: string;
  skip?: number;
  offset?: number;
  limit?: number;
}