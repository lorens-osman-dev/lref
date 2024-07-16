import { describe, it, expect, vi, expectTypeOf, test } from "vitest";
import { lref } from "../src/index";
import { computed, isRef, nextTick, reactive, type Ref, ref, watch } from "vue";
import deepClone from "../src/deepClone";

describe("lref function with ref input", () => {
  it("handles ref object", () => {
    const input = ref({ a: 1, b: 2 });
    const result = lref("test", input);
    expect(result.testRef.value).toEqual({ a: 1, b: 2 });
  });

  it("handles ref complex object", () => {
    const input = ref({ a: 1, b: { c: 2, d: [3, 4] } });
    const result = lref("test", input);
    expect(result.testRef.value).toEqual({ a: 1, b: { c: 2, d: [3, 4] } });
  });

  it("handles ref array", () => {
    const input = ref([1, 2, 3]);
    const result = lref("test", input);
    expect(result.testRef.value).toEqual([1, 2, 3]);
  });

  it("handles ref Set", () => {
    const input = ref(new Set([1, 2, 3]));
    const result = lref("test", input);
    expect(result.testRef.value).toBeInstanceOf(Set);
    expect(Array.from(result.testRef.value)).toEqual([1, 2, 3]);
  });

  it("handles ref Map", () => {
    const input = ref(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
    );
    const result = lref("test", input);
    expect(result.testRef.value).toBeInstanceOf(Map);
    expect(Object.fromEntries(result.testRef.value)).toEqual({ a: 1, b: 2 });
  });

  it("handles ref symbol", () => {
    const sym = Symbol("test");
    const input = ref(sym);
    const result = lref("test", input);
    expect(result.testRef.value).toBe(sym);
  });

  it("handles ref BigInt", () => {
    const input = ref(BigInt(9007199254740991));
    const result = lref("test", input);
    expect(result.testRef.value).toBe(BigInt(9007199254740991));
  });

  it("handles ref custom class instance", () => {
    class TestClass {
      constructor(public value: number) {}
    }
    const input = ref(new TestClass(42));
    const result = lref("test", input);
    expect(result.testRef.value).toBeInstanceOf(TestClass);
    expect(result.testRef.value.value).toBe(42);
  });

  it("handles ref mixed nested structure", () => {
    const input = ref({
      a: 1,
      b: [2, 3],
      c: new Set([4, 5]),
      d: new Map([["e", 6]]),
      f: { g: 7 },
    });
    const result = lref("test", input);
    expect(result.testRef.value).toEqual({
      a: 1,
      b: [2, 3],
      c: new Set([4, 5]),
      d: new Map([["e", 6]]),
      f: { g: 7 },
    });
  });

  it("handles ref Date object", () => {
    const date = new Date("2023-01-01");
    const input = ref(date);
    const result = lref("test", input);
    expect(result.testRef.value).toBeInstanceOf(Date);
    expect(result.testRef.value.getTime()).toBe(date.getTime());
  });

  it("handles nested refs", () => {
    const input = ref({
      a: 1,
      b: { c: 2 },
    });
    const result = lref("test", input);
    expect(result.testRef.value.a).toEqual(1);
    expect(result.testRef.value.b).toEqual({ c: 2 });
    input.value.a = 12;
    input.value.b.c = 25;
    expect(result.testRef.value.a).toEqual(12);
    expect(result.testRef.value.b).toEqual({ c: 25 });
  });

  //= preserves reactivity
  it("preserves reactivity of a simple ref", async () => {
    const input = ref(10);
    const result = lref("test", input);

    expect(isRef(result.testRef)).toBe(true);
    expect(result.testRef.value).toBe(10);

    input.value = 20;
    await nextTick();
    expect(result.testRef.value).toBe(20);

    result.testRef.value = 30;
    await nextTick();
    expect(input.value).toBe(30);
  });

  it("preserves reactivity of a ref object", async () => {
    const input = ref({ count: 0 });
    const result = lref("test", input);

    expect(isRef(result.testRef)).toBe(true);
    expect(result.testRef.value).toEqual({ count: 0 });

    input.value.count = 5;
    await nextTick();
    expect(result.testRef.value.count).toBe(5);

    result.testRef.value.count = 10;
    await nextTick();
    expect(input.value.count).toBe(10);
  });

  it("preserves reactivity of a ref array", async () => {
    const input = ref([1, 2, 3]);
    const result = lref("test", input);

    expect(isRef(result.testRef)).toBe(true);
    expect(result.testRef.value).toEqual([1, 2, 3]);

    input.value.push(4);
    await nextTick();
    expect(result.testRef.value).toEqual([1, 2, 3, 4]);

    result.testRef.value.pop();
    await nextTick();
    expect(input.value).toEqual([1, 2, 3]);
  });

  it("preserves reactivity of nested refs", async () => {
    const input = ref({
      nested: 42,
    });
    const result = lref("test", input);

    expect(isRef(result.testRef)).toBe(true);

    expect(result.testRef.value.nested).toBe(42);

    input.value.nested = 100;
    await nextTick();
    expect(result.testRef.value.nested).toBe(100);

    result.testRef.value.nested = 200;
    await nextTick();
    expect(input.value.nested).toBe(200);
  });

  it("preserves reactivity when replacing the entire ref value", async () => {
    const input = ref({ a: 1, b: 2 });
    const result = lref("test", input);

    expect(result.testRef.value).toEqual({ a: 1, b: 2 });

    input.value = { c: 3, d: 4 };
    await nextTick();
    expect(result.testRef.value).toEqual({ c: 3, d: 4 });

    result.testRef.value = { e: 5, f: 6 };
    await nextTick();
    expect(input.value).toEqual({ e: 5, f: 6 });
  });

  //= preserves types
  it("preserves ref object types", () => {
    const input = ref({ name: "John", age: 30 });
    const result = lref("test", input);

    expect(result.testRef).toBeTypeOf("object");
    expect(result.testRef.value).toEqual({ name: "John", age: 30 });

    // TypeScript type check (this will cause a compile-time error if the type is not preserved)
    const _typeCheck: Ref<{ name: string; age: number }> = result.testRef;
  });

  it("preserves ref array types", () => {
    const input = ref([1, 2, 3]);
    const result = lref("test", input);

    expect(result.testRef).toBeTypeOf("object");
    expect(Array.isArray(result.testRef.value)).toBe(true);
    expect(result.testRef.value).toEqual([1, 2, 3]);

    // TypeScript type check
    const _typeCheck: Ref<number[]> = result.testRef;
  });

  it("preserves ref complex nested types", () => {
    const input = ref({
      user: {
        name: "John",
        contacts: [
          { type: "email", value: "john@example.com" },
          { type: "phone", value: "1234567890" },
        ],
      },
    });
    const result = lref("test", input);

    expect(result.testRef).toBeTypeOf("object");
    expect(result.testRef.value).toEqual({
      user: {
        name: "John",
        contacts: [
          { type: "email", value: "john@example.com" },
          { type: "phone", value: "1234567890" },
        ],
      },
    });

    // TypeScript type check
    const _typeCheck: Ref<{
      user: {
        name: string;
        contacts: Array<{ type: string; value: string }>;
      };
    }> = result.testRef;
  });

  it("preserves ref union types", () => {
    const input = ref<string | number>("test");
    const result = lref("test", input);

    expect(result.testRef).toBeTypeOf("object");
    expect(result.testRef.value).toBe("test");

    // Change the value to test union type
    result.testRef.value = 42;
    expect(result.testRef.value).toBe(42);

    // TypeScript type check
    const _typeCheck: Ref<string | number> = result.testRef;
  });
  //= wrong data
  it("handles ref with undefined value", () => {
    const input = ref(undefined);
    const result = lref("test", input);

    expect(result.testRef.value).toBeUndefined();

    // Check if we can update the value
    result.testRef.value = "defined now";
    expect(result.testRef.value).toBe("defined now");
  });

  it("handles ref with null value", () => {
    const input = ref(null);
    const result = lref("test", input);

    expect(result.testRef.value).toBeNull();

    // Check if we can update the value
    result.testRef.value = "not null anymore";
    expect(result.testRef.value).toBe("not null anymore");
  });

  it("handles ref with function as value", () => {
    const testFunction = () => "Hello, World!";
    const input = ref(testFunction);
    const result = lref("test", input);

    expect(typeof result.testRef.value).toBe("function");
    expect(result.testRef.value()).toBe("Hello, World!");

    // Check if we can update the function
    result.testRef.value = () => "Updated function";
    expect(result.testRef.value()).toBe("Updated function");
  });

  it("handles ref with circular reference", () => {
    const circular: any = {};
    circular.self = circular;
    const input = ref(circular);

    const result = deepClone(input);

    expect(result.value).not.toBe(circular); // Ensure it's a new object
    expect(result.value.self).toBe(result.value); // Circular reference is maintained
    expect(result.value.self).not.toBe(circular); // But it's a new circular reference
  });

  it("handles ref with NaN value", () => {
    const input = ref(Number.NaN);
    const result = lref("test", input);

    expect(result.testRef.value).toBeNaN();

    // Check if we can update the value
    result.testRef.value = 42;
    expect(result.testRef.value).toBe(42);
  });

  it("handles ref with Infinity value", () => {
    const input = ref(Number.POSITIVE_INFINITY);
    const result = lref("test", input);

    expect(result.testRef.value).toBe(Number.POSITIVE_INFINITY);

    // Check if we can update the value
    result.testRef.value = Number.NEGATIVE_INFINITY;
    expect(result.testRef.value).toBe(Number.NEGATIVE_INFINITY);
  });

  it("handles ref with mixed problematic values", () => {
    const input = ref({
      undef: undefined,
      null: null,
      func: () => "test",
      nan: Number.NaN,
      inf: Number.POSITIVE_INFINITY,
      negInf: Number.NEGATIVE_INFINITY,
    });
    const result = lref("test", input);

    expect(result.testRef.value.undef).toBeUndefined();
    expect(result.testRef.value.null).toBeNull();
    expect(typeof result.testRef.value.func).toBe("function");
    expect(result.testRef.value.func()).toBe("test");
    expect(result.testRef.value.nan).toBeNaN();
    expect(result.testRef.value.inf).toBe(Number.POSITIVE_INFINITY);
    expect(result.testRef.value.negInf).toBe(Number.NEGATIVE_INFINITY);

    // Check if we can update these values
    result.testRef.value.undef = "defined";
    result.testRef.value.null = "not null";
    result.testRef.value.func = () => "updated";
    result.testRef.value.nan = 0;
    result.testRef.value.inf = 1e308;
    result.testRef.value.negInf = -1e308;

    expect(result.testRef.value.undef).toBe("defined");
    expect(result.testRef.value.null).toBe("not null");
    expect(result.testRef.value.func()).toBe("updated");
    expect(result.testRef.value.nan).toBe(0);
    expect(result.testRef.value.inf).toBe(1e308);
    expect(result.testRef.value.negInf).toBe(-1e308);
  });

  //=deep reactivity
  it("preserves deep reactivity for nested objects", async () => {
    const input = ref({
      user: {
        name: "John",
        address: {
          city: "New York",
          country: "USA",
        },
      },
    });

    const result = lref("test", input);

    const mockWatcher = vi.fn();
    watch(() => result.testRef.value.user.address.city, mockWatcher);

    // Change a deeply nested property
    result.testRef.value.user.address.city = "Los Angeles";

    // Wait for Vue to process reactivity changes
    await nextTick();

    expect(mockWatcher).toHaveBeenCalledTimes(1);
    expect(mockWatcher).toHaveBeenCalledWith("Los Angeles", "New York", expect.anything());
  });

  it("preserves deep reactivity for nested arrays", async () => {
    const input = ref({
      todos: [
        { id: 1, text: "Buy groceries", done: false },
        { id: 2, text: "Clean house", done: true },
      ],
    });
    const result = lref("test", input);

    const mockWatcher = vi.fn();
    watch(() => result.testRef.value.todos[0].done, mockWatcher);

    // Change a property of an object in the array
    result.testRef.value.todos[0].done = true;

    // Wait for Vue to process reactivity changes
    await nextTick();

    expect(mockWatcher).toHaveBeenCalledTimes(1);
    expect(mockWatcher).toHaveBeenCalledWith(true, false, expect.anything());
  });

  it("preserves deep reactivity when adding new properties", async () => {
    const input = ref({
      user: {
        name: "John",
      },
    });
    const result = lref("test", input);

    const mockWatcher = vi.fn();
    watch(() => result.testRef.value.user, mockWatcher, { deep: true });

    // Add a new property
    result.testRef.value.user.age = 30;

    // Wait for Vue to process reactivity changes
    await nextTick();

    expect(mockWatcher).toHaveBeenCalledTimes(1);
    expect(result.testRef.value.user).toEqual({ name: "John", age: 30 });
  });

  it("preserves deep reactivity when modifying nested ref", async () => {
    const input = ref({
      count: 0,
    });
    const result = lref("test", input);

    const mockWatcher = vi.fn();
    watch(() => result.testRef.value.count, mockWatcher);

    // Modify the nested ref
    result.testRef.value.count++;

    // Wait for Vue to process reactivity changes
    await nextTick();

    expect(mockWatcher).toHaveBeenCalledTimes(1);
    expect(mockWatcher).toHaveBeenCalledWith(1, 0, expect.anything());
  });
});
