import {
  Entity,
  EntityState,
  InRule,
  IntegerRule,
  MaxLengthRule,
  MinValueRule,
  RequiredRule,
  UuidRule,
  ValidationError,
  ValidationException,
  Validator,
} from "@ideias/shared";
import { RESOURCE_TYPES } from "../../idea";
import { ProcessingIteration } from "./processing-iteration.entity";

export const MAX_PROCESSING_ITERATIONS = 50;

export interface ProcessingResource {
  type: string;
  content: string;
  position: number;
}

export interface ProcessingState extends EntityState {
  userId: string;
  ideaId: string;
  ideaName: string;
  ideaDescription: string;
  ideaObjective: string;
  ideaTypeId: string;
  ideaTypeName: string;
  promptTemplate: string;
  resources?: ProcessingResource[];
  iterations?: ProcessingIteration[];
}

export class Processing extends Entity<ProcessingState> {
  constructor(props: ProcessingState) {
    super(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get ideaId(): string {
    return this.props.ideaId;
  }

  get ideaName(): string {
    return this.props.ideaName;
  }

  get ideaDescription(): string {
    return this.props.ideaDescription;
  }

  get ideaObjective(): string {
    return this.props.ideaObjective;
  }

  get ideaTypeId(): string {
    return this.props.ideaTypeId;
  }

  get ideaTypeName(): string {
    return this.props.ideaTypeName;
  }

  get promptTemplate(): string {
    return this.props.promptTemplate;
  }

  get resources(): ProcessingResource[] {
    return this.props.resources ?? [];
  }

  get iterations(): ProcessingIteration[] {
    return this.props.iterations ?? [];
  }

  public validate(): void {
    Validator.validate([
      {
        code: "processing.userId",
        value: this.userId,
        rules: [new RequiredRule(), new UuidRule()],
      },
      {
        code: "processing.ideaId",
        value: this.ideaId,
        rules: [new RequiredRule(), new UuidRule()],
      },
      {
        code: "processing.ideaName",
        value: this.ideaName,
        rules: [new RequiredRule(), new MaxLengthRule(120)],
      },
      {
        code: "processing.ideaDescription",
        value: this.ideaDescription,
        rules: [new RequiredRule(), new MaxLengthRule(2000)],
      },
      {
        code: "processing.ideaObjective",
        value: this.ideaObjective,
        rules: [new RequiredRule(), new MaxLengthRule(1000)],
      },
      {
        code: "processing.ideaTypeId",
        value: this.ideaTypeId,
        rules: [new RequiredRule(), new UuidRule()],
      },
      {
        code: "processing.ideaTypeName",
        value: this.ideaTypeName,
        rules: [new RequiredRule()],
      },
      {
        code: "processing.promptTemplate",
        value: this.promptTemplate,
        rules: [new RequiredRule()],
      },
    ]);

    this.validateResources();
    this.validateIterations();
  }

  private validateResources(): void {
    Validator.validate(
      this.resources.flatMap((resource) => [
        {
          code: "processing.resource.type",
          value: resource.type,
          rules: [new RequiredRule(), new InRule(RESOURCE_TYPES)],
        },
        {
          code: "processing.resource.content",
          value: resource.content,
          rules: [new RequiredRule(), new MaxLengthRule(20000)],
        },
        {
          code: "processing.resource.position",
          value: resource.position,
          rules: [new RequiredRule(), new IntegerRule(), new MinValueRule(0)],
        },
      ]),
    );
  }

  private validateIterations(): void {
    const errors: ValidationError[] = [];
    const iterations = this.iterations;

    if (iterations.length < 1) {
      errors.push(new ValidationError("processing.iterations.required"));
    }

    if (iterations.length > MAX_PROCESSING_ITERATIONS) {
      errors.push(new ValidationError("processing.iterations.too_many"));
    }

    for (const iteration of iterations) {
      try {
        iteration.validate();
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
