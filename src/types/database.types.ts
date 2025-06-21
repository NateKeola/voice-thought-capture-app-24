
export type DatabaseTables = {
  profiles: {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    type: string;
    created_at: string;
    last_interaction: string;
  };
  memos: {
    id: string;
    content: string;
    category: string;
    audio_url: string | null;
    status: string;
    user_id: string;
    created_at: string;
    updated_at: string;
  };
  achievement_progress: {
    id: string;
    user_id: string;
    achievement_id: string;
    current_progress: number;
    unlocked: boolean;
    unlocked_at: string | null;
    last_updated: string;
    metadata: Record<string, any>;
    created_at: string;
  };
}
