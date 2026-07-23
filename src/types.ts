export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  color: string;
  thumbnail?: string;
}

export interface AppStats {
  totalGamesPlayed: number;
  activeUsers: number;
  trendingGame: string;
}
