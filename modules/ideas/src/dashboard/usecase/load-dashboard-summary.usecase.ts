import { DomainError, UseCase } from "@ideias/shared";
import { IdeaRepository } from "../../idea";
import { IdeaTypeRepository } from "../../idea-type";
import { ProcessingRepository } from "../../processing";
import { DailyCount, DashboardActivityPoint, DashboardSummary } from "../model";

export const DASHBOARD_ACTIVITY_DAYS = 7;
export const DEFAULT_LATEST_LIMIT = 5;
export const MAX_LATEST_LIMIT = 20;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface LoadDashboardSummaryIn {
  userId: string;
  latestLimit?: number;
  now?: Date;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildWindow(now: Date): string[] {
  return Array.from({ length: DASHBOARD_ACTIVITY_DAYS }, (_, index) =>
    toDateKey(new Date(now.getTime() - (DASHBOARD_ACTIVITY_DAYS - 1 - index) * DAY_IN_MS)),
  );
}

function indexByDate(counts: DailyCount[]): Map<string, number> {
  return new Map(counts.map((item) => [item.date, item.count]));
}

export class LoadDashboardSummary
  implements UseCase<LoadDashboardSummaryIn, DashboardSummary>
{
  constructor(
    private readonly ideaRepository: IdeaRepository,
    private readonly ideaTypeRepository: IdeaTypeRepository,
    private readonly processingRepository: ProcessingRepository,
  ) {}

  async execute(input: LoadDashboardSummaryIn): Promise<DashboardSummary> {
    const latestLimit = input.latestLimit ?? DEFAULT_LATEST_LIMIT;

    if (
      !Number.isInteger(latestLimit) ||
      latestLimit < 1 ||
      latestLimit > MAX_LATEST_LIMIT
    ) {
      throw new DomainError("dashboard.latestLimit.invalid", 422);
    }

    const { userId } = input;

    const [
      ideasCount,
      ideaTypesCount,
      processingsCount,
      latestIdeas,
      ideasDaily,
      processingsDaily,
    ] = await Promise.all([
      this.ideaRepository.countByUser(userId),
      this.ideaTypeRepository.countByUser(userId),
      this.processingRepository.countByUser(userId),
      this.ideaRepository.findLatestByUser(userId, latestLimit),
      this.ideaRepository.countDailyByUser(userId, DASHBOARD_ACTIVITY_DAYS),
      this.processingRepository.countDailyByUser(userId, DASHBOARD_ACTIVITY_DAYS),
    ]);

    const ideasByDate = indexByDate(ideasDaily);
    const processingsByDate = indexByDate(processingsDaily);

    const activity: DashboardActivityPoint[] = buildWindow(input.now ?? new Date()).map(
      (date) => ({
        date,
        ideasCreated: ideasByDate.get(date) ?? 0,
        processingsExecuted: processingsByDate.get(date) ?? 0,
      }),
    );

    return {
      stats: { ideasCount, ideaTypesCount, processingsCount },
      latestIdeas,
      activity,
    };
  }
}
