import { DateTime } from "luxon";
import { SerializedTrait, TraitType } from "./serialized";
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
      this.val = params.serialized.numberValues[0];
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.NumberTrait,
      numberValues: [this.val],
      stringValues: [],
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
      this.val = params.serialized.stringValues[0];
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.StringTrait,
      numberValues: [],
      stringValues: [this.val],
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
      this.val = params.serialized.numberValues[0] === 1;
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.BooleanTrait,
      numberValues: [this.val ? 1 : 0],
      stringValues: [],
    };
  }

  render(): JSX.Element {
    return this.val ? (
      <span className="material-symbols-outlined">check</span>
    ) : (
      <span className="material-symbols-outlined">close</span>
    );
  }

  private val: boolean;
}

type NullTraitParams =
  | {}
  | {
      serialized: SerializedTrait;
    };
export class NullTrait extends Trait {
  constructor(params: NullTraitParams) {
    super();
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.NullTrait,
      numberValues: [],
      stringValues: [],
    };
  }

  render(): JSX.Element {
    return <>&ndash;</>;
  }
}

type DateTimeTraitParams =
  | {
      val: DateTime;
    }
  | {
      serialized: SerializedTrait;
    };
export class DateTimeTrait extends Trait {
  constructor(params: DateTimeTraitParams) {
    super();
    if ("val" in params) {
      this.val = params.val;
    } else if ("serialized" in params) {
      this.val = DateTime.fromSeconds(params.serialized.numberValues[0]);
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.DateTimeTrait,
      numberValues: [this.val.toSeconds()],
      stringValues: [],
    };
  }

  render(): JSX.Element {
    return <>{this.val.toLocaleString(DateTime.DATETIME_MED)}</>;
  }

  private val: DateTime;
}
