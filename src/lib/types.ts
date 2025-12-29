export type Entry = {
  id: string;
  user_id: string;
  title: string | null;
  transcript: string | null;
  audio_path: string | null;
  duration_seconds: number | null;
  created_at: string;
};

