import cloneDeep from "lodash.clonedeep";
import { isRef, ref, type Ref } from "vue";

function deepClone<T>(value: T, seen = new WeakMap<object, any>()): T {
  // Handle circular references
  if (typeof value === "object" && value !== null) {
    if (seen.has(value as object)) {
      return seen.get(value as object);
    }
    seen.set(value as object, value);
  }

  // Handle Vue refs
  if (isRef(value)) {
    return ref(deepClone((value as Ref).value, seen)) as unknown as T;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item, seen)) as unknown as T;
  }

  // Handle plain objects
  if (
    value !== null &&
    typeof value === "object" &&
    !(value instanceof Date) &&
    !(value instanceof Set) &&
    !(value instanceof Map)
  ) {
    const cloned = {} as T;
    seen.set(value as object, cloned);
    for (const [k, v] of Object.entries(value)) {
      (cloned as any)[k] = deepClone(v, seen);
    }
    return cloned;
  }

  // Use lodash's cloneDeep for everything else
  return cloneDeep(value);
}

export default deepClone;
