// Contagem agrupada por dia de criação (`date` em `YYYY-MM-DD`, UTC); só dias com registro.
export interface DailyCount {
  date: string;
  count: number;
}

export interface DashboardStats {
  ideasCount: number;
  ideaTypesCount: number;
  processingsCount: number;
}

export interface DashboardIdeaSummary {
  id: string;
  name: string;
  ideaTypeId: string;
  ideaTypeName: string;
  updatedAt: Date;
}

export interface DashboardActivityPoint {
  date: string;
  ideasCreated: number;
  processingsExecuted: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  latestIdeas: DashboardIdeaSummary[];
  activity: DashboardActivityPoint[];
}
