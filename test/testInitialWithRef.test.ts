import { describe, it, expect, expectTypeOf } from "vitest";
import { isReactive, isRef, reactive, Ref, ref, watch } from "vue";
import { lref } from "../src/index"; // Adjust the import path as needed

describe("lref testInitial with ref input", () => {
  it("should handle ref object", () => {
    const input = ref({ a: 1, b: 2 });
    const { testInitial } = lref("test", input);
    expect(testInitial()).toEqual({ a: 1, b: 2 });
    expect(testInitial()).not.toBe(input.value);
  });

  it("should handle ref complex object", () => {
    const input = ref({ a: { b: { c: 3 } }, d: [1, 2, 3] });
    const { testInitial } = lref("test", input);
    expect(testInitial()).toEqual({ a: { b: { c: 3 } }, d: [1, 2, 3] });
    expect(testInitial()).not.toBe(input.value);
  });

  it("should handle ref array", () => {
    const input = ref([1, 2, 3]);
    const { testInitial } = lref("test", input);
    expect(testInitial()).toEqual([1, 2, 3]);
    expect(testInitial()).not.toBe(input.value);
  });

  it("should handle ref Set", () => {
    const input = ref(new Set([1, 2, 3]));
    const { testInitial } = lref("test", input);
    expect(testInitial()).toEqual(new Set([1, 2, 3]));
    expect(testInitial()).not.toBe(input.value);
  });

  it("should handle ref Map", () => {
    const input = ref(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
    );
    const { testInitial } = lref("test", input);
    expect(testInitial()).toEqual(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
    );
    expect(testInitial()).not.toBe(input.value);
  });

  it("should handle ref symbol", () => {
    const sym = Symbol("test");
    const input = ref(sym);
    const { testInitial } = lref("test", input);
    expect(testInitial()).toBe(sym);
  });

  it("should handle ref BigInt", () => {
    const input = ref(BigInt(9007199254740991));
    const { testInitial } = lref("test", input);
    expect(testInitial()).toBe(BigInt(9007199254740991));
  });

  it("should handle ref custom class instance", () => {
    class TestClass {
      constructor(public value: number) {}
    }
    const input = ref(new TestClass(42));
    const { testInitial } = lref("test", input);
    expect(testInitial()).toEqual(new TestClass(42));
    expect(testInitial()).not.toBe(input.value);
  });

  it("should handle ref mixed nested structure", () => {
    const input = ref({
      a: [1, 2, { b: new Set([3, 4]) }],
      c: new Map([["d", { e: [5, 6] }]]),
    });
    const { testInitial } = lref("test", input);
    expect(testInitial()).toEqual({
      a: [1, 2, { b: new Set([3, 4]) }],
      c: new Map([["d", { e: [5, 6] }]]),
    });
    expect(testInitial()).not.toBe(input.value);
  });

  it("should handle ref Date object", () => {
    const date = new Date("2023-01-01");
    const input = ref(date);
    const { testInitial } = lref("test", input);
    expect(testInitial()).toEqual(date);
    expect(testInitial()).not.toBe(input.value);
  });

  it("should handle nested refs", () => {
    const input = ref({
      a: ref(1),
      b: ref({ c: ref([1, 2, 3]) }),
    });
    const { testInitial } = lref("test", input);
    expect(testInitial()).toEqual({
      a: 1,
      b: { c: [1, 2, 3] },
    });
    expect(testInitial()).not.toBe(input.value);
  });
  //=lref testInitial reactivity preservation

  it("should not preserve reactivity for top-level ref", () => {
    const input = ref({ count: 0 });
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expect(isRef(result)).toBe(false);
    expect(result).toEqual({ count: 0 });
  });

  it("should not preserve reactivity for nested refs", () => {
    const input = ref({
      nested: { count: 0 },
      array: [1, 2],
    });
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expect(isRef(result.nested)).toBe(false);
    expect(isRef(result.array[0])).toBe(false);
    expect(isRef(result.array[1])).toBe(false);
    expect(result).toEqual({
      nested: { count: 0 },
      array: [1, 2],
    });
  });

  it("should not preserve reactivity for complex nested structure", () => {
    const input = ref({
      obj: reactive({ count: 0 }),
      arr: [{ value: 1 }, reactive({ nested: 2 })],
    });
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expect(isRef(result.obj.count)).toBe(false);
    expect(isRef(result.arr[0])).toBe(false);
    expect(isRef(result.arr[1].nested)).toBe(false);
    expect(result).toEqual({
      obj: { count: 0 },
      arr: [{ value: 1 }, { nested: 2 }],
    });
  });

  it("should return a new object on each call", () => {
    const input = ref({ count: 0 });
    const { testInitial } = lref("test", input);
    const result1 = testInitial();
    const result2 = testInitial();

    expect(result1).not.toBe(result2);
    expect(result1).toEqual(result2);
  });

  it("should not be affected by changes to the original ref", () => {
    const input = ref({ count: 0 });
    const { testInitial } = lref("test", input);
    const initialResult = testInitial();

    input.value.count = 5;
    const afterChangeResult = testInitial();

    expect(initialResult).toEqual({ count: 0 });
    expect(afterChangeResult).toEqual({ count: 0 });
  });

  //=testInitial type  preservation
  it("should preserve object types", () => {
    interface TestObject {
      a: number;
      b: string;
    }
    const input = ref<TestObject>({ a: 1, b: "test" });
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expectTypeOf(result).toEqualTypeOf<TestObject>();
    expect(result).toEqual({ a: 1, b: "test" });
  });

  it("should preserve array types", () => {
    const input = ref<number[]>([1, 2, 3]);
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expectTypeOf(result).toEqualTypeOf<number[]>();
    expect(result).toEqual([1, 2, 3]);
  });

  it("should preserve complex nested types", () => {
    interface ComplexType {
      a: number;
      b: string[];
      c: {
        d: boolean;
        e: Date;
      };
    }
    const input = ref<ComplexType>({
      a: 1,
      b: ["test"],
      c: {
        d: true,
        e: new Date(),
      },
    });
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expectTypeOf(result).toEqualTypeOf<ComplexType>();
    expect(result).toEqual(input.value);
  });

  it("should preserve union types", () => {
    type UnionType = string | number | { a: boolean };
    const input = ref<UnionType>("test");
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expectTypeOf(result).toEqualTypeOf<UnionType>();
    expect(result).toBe("test");

    // Test with different union type values
    const input2 = ref<UnionType>(42);
    const { test2Initial: testInitial2 } = lref("test2", input2);
    const result2 = testInitial2();

    expectTypeOf(result2).toEqualTypeOf<UnionType>();
    expect(result2).toBe(42);

    const input3 = ref<UnionType>({ a: true });
    const { test3Initial: testInitial3 } = lref("test3", input3);
    const result3 = testInitial3();

    expectTypeOf(result3).toEqualTypeOf<UnionType>();
    expect(result3).toEqual({ a: true });
  });

  it("should preserve Vue ref types", () => {
    const input = ref(ref(5));
    const { testInitial } = lref("test", input);
    const result = testInitial();

    // The outer ref should be unwrapped, but the inner ref should be preserved
    expectTypeOf(result).toEqualTypeOf<Ref<number>>();
    expect(result).toEqual(5);
  });

  it("should preserve types in arrays of refs", () => {
    const input = ref([ref(1), ref("test"), ref(true)]);
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expectTypeOf(result).toEqualTypeOf<Array<Ref<number> | Ref<string> | Ref<boolean>>>();
    expect(result).toEqual([ref(1), ref("test"), ref(true)]);
  });

  it("should preserve types in objects with ref properties", () => {
    interface RefObject {
      a: Ref<number>;
      b: Ref<string>;
    }
    const input = ref<RefObject>({
      a: ref(1),
      b: ref("test"),
    });
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expectTypeOf(result).toEqualTypeOf<RefObject>();
    expect(result).toEqual({
      a: 1,
      b: "test",
    });
  });

  //= deep reactivity
  it("should preserve reactivity for nested refs", () => {
    const input = ref({
      nested: { count: 0 },
      array: [1, 2],
    });
    const { testInitial } = lref("test", input);
    const result = testInitial();

    input.value.nested.count++;
    expect(input.value.nested.count).toBe(1);
    expect(result.nested.count).toBe(0);
    expect(result.array).toStrictEqual([1, 2]);

    input.value.array[0] = 5;
    expect(input.value.nested.count).toBe(1);
    expect(result.nested.count).toBe(0);
    expect(input.value.array).toStrictEqual([5, 2]);

    input.value.array[1]++;
    expect(input.value.nested.count).toBe(1);
    expect(result.nested.count).toBe(0);
    expect(input.value.array).toStrictEqual([5, 3]);
  });

  it("should preserve reactivity for Vue ref types", () => {
    const input = ref(5);
    const { testRef, testInitial } = lref("test", input);
    let result = testInitial();

    input.value++;

    expect(input.value).toBe(6);
    expect(testRef.value).toBe(6);
    expect(result).toBe(5);
  });
  it("should preserve reactivity for nested reactive objects", () => {
    const input = ref({
      nested: reactive({ count: 0 }),
      array: [1, 2],
    });
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expect(Array.isArray(result.array)).toBe(true);

    result.nested.count++;
    expect(result.nested.count).toBe(1);
  });

  it("should preserve reactivity for complex nested structure", () => {
    const input = ref({
      obj: reactive({ count: 0 }),
      arr: [{ value: 1 }, reactive({ nested: 2 })],
    });
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expect(Array.isArray(result.arr)).toBe(true);

    result.obj.count++;
    expect(result.obj.count).toBe(1);

    result.arr[1].nested++;
    expect(result.arr[1].nested).toBe(3);
  });

  it("should handle reactive objects", () => {
    const input = ref(reactive({ value: 5 }));
    const { testInitial } = lref("test", input);
    const result = testInitial();

    result.value++;
    expect(result.value).toBe(6);
  });

  it("should handle arrays with reactive objects", () => {
    const input = ref([reactive({ value: 1 }), reactive({ value: 2 })]);
    const { testInitial } = lref("test", input);
    const result = testInitial();

    result[0].value++;
    expect(result[0].value).toBe(2);
  });

  it("should handle objects with reactive properties", () => {
    const input = ref({
      a: reactive({ value: 1 }),
      b: reactive({ value: "test" }),
    });
    const { testInitial } = lref("test", input);
    const result = testInitial();

    result.a.value++;
    result.b.value = "changed";
    expect(result.a.value).toBe(2);
    expect(result.b.value).toBe("changed");
  });

  it("should preserve reactivity for deeply nested reactive structures", () => {
    const input = ref({
      level1: reactive({
        level2: reactive({
          level3: reactive({
            value: 0,
          }),
        }),
      }),
    });
    const { testInitial } = lref("test", input);
    const result = testInitial();

    result.level1.level2.level3.value++;
    expect(result.level1.level2.level3.value).toBe(1);
  });

  it("should return a new object on each call", () => {
    const input = ref({ count: 0 });
    const { testInitial } = lref("test", input);
    const result1 = testInitial();
    const result2 = testInitial();

    expect(result1).not.toBe(result2);
    expect(result1).toEqual(result2);
  });

  it("should not be affected by changes to the original ref", () => {
    const input = ref({ count: 0 });
    const { testInitial } = lref("test", input);
    const initialResult = testInitial();

    input.value.count = 5;
    const afterChangeResult = testInitial();

    expect(initialResult).toEqual({ count: 0 });
    expect(afterChangeResult).toEqual({ count: 0 });
  });
  //= wrong data
  it("should handle ref with undefined value", () => {
    const input = ref(undefined);
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expect(result).toBe(undefined);
  });

  it("should handle ref with null value", () => {
    const input = ref(null);
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expect(result).toBe(null);
  });

  it("should handle ref with function as value", () => {
    const testFunction = () => "test";
    const input = ref(testFunction);
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expect(typeof result).toBe("object");

    expect(result).toStrictEqual({});
  });

  it("should handle ref with circular reference", () => {
    const circular: any = {};
    circular.self = circular;
    const input = ref(circular);
    const { testInitial } = lref("test", input);

    expect(() => testInitial()).not.toThrow();
    const result = testInitial();
    expect(result.self).toBe(result);
  });

  it("should handle ref with NaN value", () => {
    const input = ref(Number.NaN);
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expect(Number.isNaN(result)).toBe(true);
  });

  it("should handle ref with Infinity value", () => {
    const input = ref(Number.POSITIVE_INFINITY);
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expect(result).toBe(Number.POSITIVE_INFINITY);
  });

  it("should handle ref with -Infinity value", () => {
    const input = ref(Number.NEGATIVE_INFINITY);
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expect(result).toBe(Number.NEGATIVE_INFINITY);
  });

  it("should handle ref with complex object containing edge cases", () => {
    const circular: any = {};
    circular.self = circular;
    const input = ref({
      undef: undefined,
      null: null,
      func: () => "test",
      circular: circular,
      nan: Number.NaN,
      inf: Number.POSITIVE_INFINITY,
      negInf: Number.NEGATIVE_INFINITY,
    });
    const { testInitial } = lref("test", input);
    const result = testInitial();

    expect(result.undef).toBe(undefined);
    expect(result.null).toBe(null);
    expect(typeof result.func).toBe("function");

    expect(result.circular.self).toBe(result.circular);
    expect(typeof Number.isNaN(result.nan)).toBe("boolean");
    expect(result.inf).toBe(Number.POSITIVE_INFINITY);
    expect(result.negInf).toBe(Number.NEGATIVE_INFINITY);
  });
});
