import {
  Entity,
  EntityState,
  MaxLengthRule,
  MinLengthRule,
  RequiredRule,
  UuidRule,
  ValidationError,
  ValidationException,
  Validator,
} from "@ideias/shared";
import { Resource } from "./resource.entity";

export const MAX_IDEA_RESOURCES = 20;

export interface IdeaState extends EntityState {
  name: string;
  description: string;
  objective: string;
  ideaTypeId: string;
  userId: string;
  resources?: Resource[];
}

export class Idea extends Entity<IdeaState> {
  constructor(props: IdeaState) {
    super(props);
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get objective(): string {
    return this.props.objective;
  }

  get ideaTypeId(): string {
    return this.props.ideaTypeId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get resources(): Resource[] {
    return this.props.resources ?? [];
  }

  public validate(): void {
    Validator.validate([
      {
        code: "idea.name",
        value: this.name,
        rules: [new RequiredRule(), new MinLengthRule(3), new MaxLengthRule(120)],
      },
      {
        code: "idea.description",
        value: this.description,
        rules: [new RequiredRule(), new MinLengthRule(10), new MaxLengthRule(2000)],
      },
      {
        code: "idea.objective",
        value: this.objective,
        rules: [new RequiredRule(), new MinLengthRule(10), new MaxLengthRule(1000)],
      },
      {
        code: "idea.ideaTypeId",
        value: this.ideaTypeId,
        rules: [new RequiredRule(), new UuidRule()],
      },
      {
        code: "idea.userId",
        value: this.userId,
        rules: [new RequiredRule(), new UuidRule()],
      },
    ]);

    this.validateResources();
  }

  private validateResources(): void {
    const errors: ValidationError[] = [];
    const resources = this.resources;

    if (resources.length > MAX_IDEA_RESOURCES) {
      errors.push(new ValidationError("idea.resources.too_many"));
    }

    if (new Set(resources.map((item) => item.id)).size !== resources.length) {
      errors.push(new ValidationError("idea.resources.duplicate_id"));
    }

    for (const resource of resources) {
      try {
        resource.validate();
      } catch (error) {
        if (!(error instanceof ValidationException)) {
          throw error;
        }

        errors.push(...error.errors);
      }
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }
}
