import { computed, ref, type ComputedRef, type Ref, type UnwrapRef } from "vue";
import deepClone from "./deepClone";

export class Refer<T> {
	ref: Ref<T>;
	unConnected: Ref<UnwrapRef<T>>;
	private refDeepClone: T;
	private lastValue: T | null = null;
	computed: ComputedRef<T>;

	constructor(parameter: T | Ref<T>) {
		if (this.isRef(parameter)) {
			this.ref = parameter;
		} else {
			this.ref = ref(parameter) as Ref<T>;
		}

		this.refDeepClone = deepClone(this.ref.value);
		this.unConnected = ref<T>(deepClone(this.ref.value));
		this.computed = computed(() => this.ref.value);
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

	private isRef(value: any): value is Ref {
		return value && typeof value === "object" && "value" in value;
	}
}

type lrefKeys =
	| "Ref"
	| "Computed"
	| "LastValueBeforeLastReset"
	| "Reset"
	| "UnConnected"
	| "Initial";

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
							: never;
};

export function lref<Name extends string, T>(
	nameParameter: Name,
	parameter: T | Ref<T>,
): lrefObject<Name, T> {
	const vars = new Refer(parameter);
	const name = nameParameter.toLowerCase();
	return {
		[`${name}Ref`]: vars.ref,
		[`${name}Initial`]: () => vars.initial(),
		[`${name}Computed`]: vars.computed,
		[`${name}LastValueBeforeLastReset`]: () => vars.lastValueBeforeLastReset(),
		[`${name}Reset`]: () => vars.reset(),
		[`${name}UnConnected`]: vars.unConnected,
	} as lrefObject<Name, T>;
}
