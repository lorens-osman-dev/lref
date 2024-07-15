import { computed, ref, type ComputedRef, type Ref, isRef, type UnwrapRef } from "vue";
import deepClone from "./deepClone";
import { useRefHistory, type UseRefHistoryRecord } from "@vueuse/core";

export class Refer<T> {
  ref: Ref<T>;
  /**
   * A disconnected reactive copy of the reference value.
   * This is a separate Ref that holds a deep clone of the original value.
   * It allows for isolated modifications without affecting the original reference.
   *
   * Use cases:
   * - Creating a draft or temporary state
   * - Comparing current state with a modifiable initial state
   * - Implementing undo/redo functionality
   *
   * @type {Ref<UnwrapRef<T>>}
   * @example
   * const myRefer = new Refer(ref({ name: "Lorens" }));
   * myRefer.disconnected.value.name = "Ahmed";
   * console.log(myRefer.value.name); // Still "Lorens"
   * console.log(myRefer.disconnected.value.name); // "Ahmed"
   *
   */
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

/**
 * Creates a reactive reference object with extended functionality.
 *
 * @template Name - A string type for the name parameter.
 * @template T - The type of the value being wrapped.
 *
 * @param {Name} nameParameter - A string used to prefix the returned properties.
 * @param {T | Ref<T>} parameter - The initial value or a Ref to wrap.
 *
 * @returns {lrefObject<Name, T>} An object containing various reactive properties and methods:
 *   - `${name}Ref`: The reactive reference.
 *   - `${name}Initial`: A function that returns the initial value.
 *   - `${name}Computed`: A computed property based on the reference.
 *   - `${name}Reset`: A function to reset the value to its initial state.
 *   - `${name}LastValueBeforeLastReset`: A function that returns the last value before reset.
 *   - `${name}UnConnected`: An unconnected copy of the reference.
 *   - `${name}History`: An object with undo/redo functionality and history data.
 *
 * @example
 * const { countRef, countReset, countHistory } = lref('count', 0);
 * countRef.value++; // Increments the count
 * countReset(); // Resets count to 0
 * countHistory.undo(); // Undoes the last change
 */
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
