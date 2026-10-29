import { CrudRepository } from "@ideias/shared";
import { IdeaType } from "../model";

export interface IdeaTypePageParams {
  userId: string;
  page: number;
  perPage: number;
}

export interface IdeaTypeRepository extends CrudRepository<
  IdeaType,
  IdeaType,
  IdeaType,
  IdeaTypePageParams
> {
  countByUser(userId: string): Promise<number>;
}
