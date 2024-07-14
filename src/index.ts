import { computed, ref, type ComputedRef, type Ref, isRef, type UnwrapRef } from "vue";
import deepClone from "./deepClone";
import { useRefHistory, type UseRefHistoryRecord } from "@vueuse/core";

export class Refer<T> {
  ref: Ref<T>;
  unConnected: Ref<UnwrapRef<T>>;
  private refDeepClone: T;
  private lastValue: T | null = null;

  constructor(parameter: T | Ref<T>) {
    if (isRef(parameter)) {
      this.ref = parameter;
    } else {
      this.ref = ref(parameter) as Ref<T>;
    }

    this.refDeepClone = deepClone(this.ref.value);
    this.unConnected = ref<T>(deepClone(this.ref.value));
  }

  reset(): void {
    this.lastValue = deepClone(this.ref.value);
    this.ref.value = deepClone(this.refDeepClone);
  }

  lastValueBeforeLastReset(): T | null {
    return this.lastValue ? deepClone(this.lastValue) : null;
  }

  initial(): T {
    return deepClone(this.refDeepClone);
  }
  get computed(): ComputedRef<T> {
    return computed(() => this.ref.value);
  }
}

type lrefKeys =
  | "Ref"
  | "Computed"
  | "LastValueBeforeLastReset"
  | "Reset"
  | "UnConnected"
  | "Initial"
  | "History";

type lrefObject<Name extends string, T> = {
  [K in `${Lowercase<Name>}${lrefKeys}`]: K extends `${string}Initial`
    ? () => T
    : K extends `${string}Computed`
      ? ComputedRef<T>
      : K extends `${string}LastValueBeforeLastReset`
        ? () => T | null
        : K extends `${string}Reset`
          ? () => void
          : K extends `${string}UnConnected`
            ? Ref<UnwrapRef<T>>
            : K extends `${string}Ref`
              ? Ref<T>
              : K extends `${string}History`
                ? HistoryFace<T>
                : never;
};

interface HistoryFace<T> {
  data: Ref<UseRefHistoryRecord<T>[]>;
  undo: () => void;
  redo: () => void;
}
export function lref<Name extends string, T>(
  nameParameter: Name,
  parameter: T | Ref<T>,
): lrefObject<Name, T> {
  const vars = new Refer(parameter);
  const name = nameParameter.toLowerCase();
  const { history, undo, redo } = useRefHistory(vars.ref);
  const historyObj = {
    data: history,
    undo,
    redo,
  };
  return {
    [`${name}Ref`]: vars.ref,
    [`${name}History`]: historyObj,
    [`${name}Initial`]: () => vars.initial(),
    [`${name}Computed`]: vars.computed,
    [`${name}LastValueBeforeLastReset`]: () => vars.lastValueBeforeLastReset(),
    [`${name}Reset`]: () => vars.reset(),
    [`${name}UnConnected`]: vars.unConnected,
  } as lrefObject<Name, T>;
}
