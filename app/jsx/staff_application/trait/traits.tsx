import { SerializedTrait } from "./serialized";
import { Trait } from "./api";

type NumberTraitParams =
  | {
      val: number;
    }
  | {
      serialized: SerializedTrait;
    };
export class NumberTrait extends Trait {
  constructor(params: NumberTraitParams) {
    super();
    if ("val" in params) {
      this.val = params.val;
    } else if ("serialized" in params) {
      this.val = params.serialized.number_values[0];
    }
  }

  serialize(): SerializedTrait {
    return {
      number_values: [this.val],
      string_values: [],
    };
  }

  render(): JSX.Element {
    return <>{this.val}</>;
  }

  private val: number;
}

type StringTraitParams =
  | {
      val: string;
    }
  | {
      serialized: SerializedTrait;
    };
export class StringTrait extends Trait {
  constructor(params: StringTraitParams) {
    super();
    if ("val" in params) {
      this.val = params.val;
    } else if ("serialized" in params) {
      this.val = params.serialized.string_values[0];
    }
  }

  serialize(): SerializedTrait {
    return {
      number_values: [],
      string_values: [this.val],
    };
  }

  render(): JSX.Element {
    return <>{this.val}</>;
  }

  private val: string;
}

type BooleanTraitParams =
  | {
      val: boolean;
    }
  | {
      serialized: SerializedTrait;
    };
export class BooleanTrait extends Trait {
  constructor(params: BooleanTraitParams) {
    super();
    if ("val" in params) {
      this.val = params.val;
    } else if ("serialized" in params) {
      this.val = params.serialized.number_values[0] === 1;
    }
  }

  serialize(): SerializedTrait {
    return {
      number_values: [this.val ? 1 : 0],
      string_values: [],
    };
  }

  render(): JSX.Element {
    return this.val ? (
      <span export className="material-symbols-outlined">
        check
      </span>
    ) : (
      <span export className="material-symbols-outlined">
        close
      </span>
    );
  }

  private val: boolean;
}
