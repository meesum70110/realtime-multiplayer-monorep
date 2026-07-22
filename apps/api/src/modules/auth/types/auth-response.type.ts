import { UserRole } from '../entities/user-role.enum';

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    created_at: string;
    display_name: string;
    email: string;
    id: string;
    last_match_at: string | null;
    role: UserRole;
    total_losses: number;
    total_matches_played: number;
    total_wins: number;
  };
};
