import { PageResult } from "@ideias/shared";
import { DailyCount } from "../../dashboard/model";
import { Processing, ProcessingIteration } from "../model";

export interface ProcessingPageParams {
  userId: string;
  page: number;
  perPage: number;
}

export interface ProcessingSummary {
  id: string;
  ideaId: string;
  ideaName: string;
  ideaTypeName: string;
  iterationsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IdeaSearchParams {
  userId: string;
  term: string;
}

export interface IdeaSearchItem {
  id: string;
  name: string;
  ideaTypeId: string;
  ideaTypeName: string;
}

export interface ProcessingRepository {
  create(data: Processing): Promise<Processing>;
  appendIteration(
    processingId: string,
    iteration: ProcessingIteration,
  ): Promise<ProcessingIteration>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Processing | null>;
  findPage(params: ProcessingPageParams): Promise<PageResult<ProcessingSummary>>;
  searchIdeas(params: IdeaSearchParams): Promise<IdeaSearchItem[]>;
  existsByIdeaId(ideaId: string): Promise<boolean>;
  countByUser(userId: string): Promise<number>;
  countDailyByUser(userId: string, days: number): Promise<DailyCount[]>;
}
