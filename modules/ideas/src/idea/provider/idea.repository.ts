import { CrudRepository } from "@ideias/shared";
import { DailyCount, DashboardIdeaSummary } from "../../dashboard/model";
import { Idea } from "../model";

export interface IdeaPageParams {
  userId: string;
  page: number;
  perPage: number;
}

export interface IdeaRepository extends CrudRepository<
  Idea,
  Idea,
  Idea,
  IdeaPageParams
> {
  countByUser(userId: string): Promise<number>;
  findLatestByUser(userId: string, limit: number): Promise<DashboardIdeaSummary[]>;
  countDailyByUser(userId: string, days: number): Promise<DailyCount[]>;
}
