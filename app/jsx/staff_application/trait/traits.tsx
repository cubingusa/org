import { DateTime } from "luxon";
import { SerializedTrait, TraitType } from "./serialized";
import { Trait } from "./api";

type NumberTraitParams =
  | {
      val: number | null;
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
      if (params.serialized.numberValues.length == 0) {
        this.val = null;
      } else {
        this.val = params.serialized.numberValues[0];
      }
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.NumberTrait,
      numberValues: this.val == null ? [] : [this.val],
      stringValues: [],
    };
  }

  render(): JSX.Element {
    return this.val == null ? <>&ndash;</> : <>{this.val}</>;
  }

  value(): number | null {
    return this.val;
  }

  private val: number | null;
}

type StringTraitParams =
  | {
      val: string | null;
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
      if (params.serialized.stringValues.length == 0) {
        this.val = null;
      } else {
        this.val = params.serialized.stringValues[0];
      }
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.StringTrait,
      numberValues: [],
      stringValues: this.val == null ? [] : [this.val],
    };
  }

  render(): JSX.Element {
    return this.val == null ? <>&ndash;</> : <>{this.val}</>;
  }

  value(): string | null {
    return this.val;
  }

  private val: string | null;
}

type BooleanTraitParams =
  | {
      val: boolean | null;
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
      if (params.serialized.numberValues.length > 0) {
        this.val = params.serialized.numberValues[0] === 1;
      } else {
        this.val = null;
      }
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.BooleanTrait,
      numberValues: this.val == null ? [] : [this.val ? 1 : 0],
      stringValues: [],
    };
  }

  render(): JSX.Element {
    switch (this.val) {
      case null:
        return <>&ndash</>;
      case true:
        return <span className="material-symbols-outlined">check</span>;
      case false:
        return <span className="material-symbols-outlined">close</span>;
    }
  }

  value(): boolean | null {
    return this.val;
  }

  private val: boolean | null;
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

  value(): null {
    return null;
  }
}

type DateTimeTraitParams =
  | {
      val: DateTime | null;
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
      if (params.serialized.numberValues.length > 0) {
        this.val = DateTime.fromSeconds(params.serialized.numberValues[0]);
      } else {
        this.val = null;
      }
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.DateTimeTrait,
      numberValues: this.val == null ? [] : [this.val.toSeconds()],
      stringValues: [],
    };
  }

  render(): JSX.Element {
    return this.val == null ? (
      <>&ndash;</>
    ) : (
      <>{this.val.toLocaleString(DateTime.DATETIME_MED)}</>
    );
  }

  value(): DateTime | null {
    return this.val;
  }

  private val: DateTime | null;
}