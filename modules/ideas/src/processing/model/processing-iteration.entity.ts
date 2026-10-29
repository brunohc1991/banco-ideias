import {
  Entity,
  EntityState,
  IntegerRule,
  MaxLengthRule,
  MinLengthRule,
  MinValueRule,
  RequiredRule,
  Validator,
} from "@ideias/shared";

export const MAX_REFINEMENT_LENGTH = 2000;
export const MIN_REFINEMENT_LENGTH = 3;

export interface ProcessingIterationState extends EntityState {
  refinement?: string | null;
  result: string;
  position: number;
}

export class ProcessingIteration extends Entity<ProcessingIterationState> {
  constructor(props: ProcessingIterationState) {
    super(props);
  }

  get refinement(): string | null {
    return this.props.refinement ?? null;
  }

  get result(): string {
    return this.props.result;
  }

  get position(): number {
    return this.props.position;
  }

  public validate(): void {
    const fields = [
      {
        code: "processing.iteration.result",
        value: this.result,
        rules: [new RequiredRule(), new MinLengthRule(1), new MaxLengthRule(50000)],
      },
      {
        code: "processing.iteration.position",
        value: this.position,
        rules: [new RequiredRule(), new IntegerRule(), new MinValueRule(0)],
      },
    ];

    if (this.refinement !== null) {
      fields.push({
        code: "processing.refinement",
        value: this.refinement,
        rules: [
          new RequiredRule(),
          new MinLengthRule(MIN_REFINEMENT_LENGTH),
          new MaxLengthRule(MAX_REFINEMENT_LENGTH),
        ],
      });
    }

    Validator.validate(fields);
  }
}
