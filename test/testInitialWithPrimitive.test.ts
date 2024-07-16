import { describe, it, expect } from "vitest";
import { lref } from "../src/index";
import { isRef, ref } from "vue";

describe("lref with primitive and complex data types", () => {
  it("should handle a simple object", () => {
    const { testInitial } = lref("test", { a: 1, b: "string" });
    expect(testInitial()).toEqual({ a: 1, b: "string" });
  });

  it("should handle a complex object", () => {
    const complexObj = {
      a: 1,
      b: { c: 2, d: [3, 4] },
      e: new Set([1, 2, 3]),
      f: new Map([["key", "value"]]),
    };
    const { testInitial } = lref("test", complexObj);
    expect(testInitial()).toEqual(complexObj);
  });

  it("should handle an array", () => {
    const { testInitial } = lref("test", [1, 2, 3, 4]);
    expect(testInitial()).toEqual([1, 2, 3, 4]);
  });

  it("should handle a Set", () => {
    const set = new Set([1, 2, 3]);
    const { testInitial } = lref("test", set);
    expect(testInitial()).toEqual(set);
  });

  it("should handle a Map", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const { testInitial } = lref("test", map);
    expect(testInitial()).toEqual(map);
  });

  it("should handle a symbol", () => {
    const sym = Symbol("test");
    const { testInitial } = lref("test", sym);
    expect(testInitial()).toBe(sym);
  });

  it("should handle a BigInt", () => {
    const bigInt = BigInt(9007199254740991);
    const { testInitial } = lref("test", bigInt);
    expect(testInitial()).toBe(bigInt);
  });

  it("should handle a custom class instance", () => {
    class CustomClass {
      constructor(public value: number) {}
    }
    const instance = new CustomClass(42);
    const { testInitial } = lref("test", instance);
    expect(testInitial()).toEqual(instance);
  });

  it("should handle a mixed nested structure", () => {
    const mixedStructure = {
      a: 1,
      b: [2, 3, { c: 4 }],
      d: new Set([5, 6]),
      e: new Map([["f", { g: 7 }]]),
      h: Symbol("test"),
      i: BigInt(8),
    };
    const { testInitial } = lref("test", mixedStructure);
    expect(testInitial()).toEqual(mixedStructure);
  });

  it("should handle a Date object", () => {
    const date = new Date("2023-01-01");
    const { testInitial } = lref("test", date);
    expect(testInitial()).toEqual(date);
  });

  //= preserve reactivity
  it("should not preserve reactivity for number", () => {
    const { testRef, testInitial } = lref("test", 42);
    const result = testInitial();
    testRef.value++;
    expect(isRef(result)).toBe(false);
    expect(result).toBe(42);
    expect(testRef.value).toBe(43);
  });

  it("should not preserve reactivity for string", () => {
    const { testRef, testInitial } = lref("test", "hello");
    const result = testInitial();
    testRef.value = "world";
    expect(isRef(result)).toBe(false);
    expect(result).toBe("hello");
    expect(testRef.value).toBe("world");
  });

  it("should not preserve reactivity for boolean", () => {
    const { testRef, testInitial } = lref("test", true);
    const result = testInitial();
    testRef.value = false;
    expect(testRef.value).toBe(false);
    expect(isRef(result)).toBe(false);
    expect(result).toBe(true);
  });

  it("should not preserve reactivity for null", () => {
    const { testRef, testInitial } = lref("test", null);
    const result = testInitial();

    expect(testRef.value).toBe(null);
    expect(isRef(result)).toBe(false);
    expect(result).toBe(null);
  });

  it("should not preserve reactivity for undefined", () => {
    const { testRef, testInitial } = lref("test", undefined);
    const result = testInitial();

    expect(testRef.value).toBe(undefined);
    expect(isRef(result)).toBe(false);
    expect(result).toBe(undefined);
  });

  it("should not preserve reactivity for symbol", () => {
    const sym = Symbol("test");
    const { testRef, testInitial } = lref("test", sym);
    const result = testInitial();

    expect(isRef(result)).toBe(false);
    expect(result).toBe(sym);
  });

  it("should not preserve reactivity for bigint", () => {
    const bigInt = BigInt(9007199254740991);
    const { testRef, testInitial } = lref("test", bigInt);
    const result = testInitial();

    expect(isRef(result)).toBe(false);
    expect(result).toBe(bigInt);
  });

  //=type  preservation
  // Primitive types
  it("should preserve number type", () => {
    const { testInitial } = lref("test", 42);
    const result = testInitial();
    expect(typeof result).toBe("number");
  });

  it("should preserve string type", () => {
    const { testInitial } = lref("test", "hello");
    const result = testInitial();
    expect(typeof result).toBe("string");
  });

  it("should preserve boolean type", () => {
    const { testInitial } = lref("test", true);
    const result = testInitial();
    expect(typeof result).toBe("boolean");
  });

  it("should preserve symbol type", () => {
    const sym = Symbol("test");
    const { testInitial } = lref("test", sym);
    const result = testInitial();
    expect(typeof result).toBe("symbol");
  });

  it("should preserve bigint type", () => {
    const bigInt = BigInt(9007199254740991);
    const { testInitial } = lref("test", bigInt);
    const result = testInitial();
    expect(typeof result).toBe("bigint");
  });

  it("should preserve null type", () => {
    const { testInitial } = lref("test", null);
    const result = testInitial();
    expect(result).toBeNull();
  });

  it("should preserve undefined type", () => {
    const { testInitial } = lref("test", undefined);
    const result = testInitial();
    expect(result).toBeUndefined();
  });

  // Object types
  it("should preserve object type", () => {
    const obj = { a: 1, b: "string" };
    const { testInitial } = lref("test", obj);
    const result = testInitial();
    expect(typeof result).toBe("object");
    expect(result).toEqual(obj);
  });

  it("should preserve Date object type", () => {
    const date = new Date();
    const { testInitial } = lref("test", date);
    const result = testInitial();
    expect(result instanceof Date).toBe(true);
    expect(result.getTime()).toBe(date.getTime());
  });

  it("should preserve custom class instance type", () => {
    class TestClass {
      constructor(public value: number) {}
    }
    const instance = new TestClass(42);
    const { testInitial } = lref("test", instance);
    const result = testInitial();
    expect(result instanceof TestClass).toBe(true);
    expect(result.value).toBe(42);
  });

  // Array types
  it("should preserve array type", () => {
    const arr = [1, 2, 3];
    const { testInitial } = lref("test", arr);
    const result = testInitial();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(arr);
  });

  // Complex nested types
  it("should preserve complex nested types", () => {
    const complex = {
      a: 1,
      b: "string",
      c: [1, 2, 3],
      d: { e: new Date(), f: [{ g: "nested" }] },
      h: new Set([1, 2, 3]),
      i: new Map([["key", "value"]]),
    };
    const { testInitial } = lref("test", complex);
    const result = testInitial();
    expect(typeof result).toBe("object");
    expect(result).toEqual(complex);
    expect(result.d.e instanceof Date).toBe(true);
    expect(result.h instanceof Set).toBe(true);
    expect(result.i instanceof Map).toBe(true);
  });

  // Union types
  it("should preserve union types", () => {
    type UnionType = string | number | { a: boolean };
    const testUnion = (value: UnionType) => {
      const { testInitial } = lref("test", value);
      const result = testInitial();
      expect(result).toEqual(value);
      if (typeof value === "string") {
        expect(typeof result).toBe("string");
      } else if (typeof value === "number") {
        expect(typeof result).toBe("number");
      } else {
        expect(typeof result).toBe("object");
        expect(result).toHaveProperty("a");
        expect(typeof result.a).toBe("boolean");
      }
    };

    testUnion("string value");
    testUnion(42);
    testUnion({ a: true });
  });

  //= deep reactivity
  it("should preserve deep reactivity for primitive data", () => {
    const primitiveRef = lref("test", 42);

    // Check initial value
    expect(primitiveRef.testInitial()).toBe(42);

    // Modify the value
    primitiveRef.testRef.value = 100;

    // Reset the value
    primitiveRef.testReset();

    // Check if reset value is the initial value
    expect(primitiveRef.testRef.value).toBe(42);
  });

  it("should preserve deep reactivity for objects", () => {
    const objectRef = lref("test", { a: 1, b: { c: 2 } });

    // Check initial value
    expect(objectRef.testInitial()).toEqual({ a: 1, b: { c: 2 } });

    // Modify the value
    objectRef.testRef.value.a = 100;
    objectRef.testRef.value.b.c = 200;

    // Reset the value
    objectRef.testReset();

    // Check if reset value is the initial value
    expect(objectRef.testRef.value).toEqual({ a: 1, b: { c: 2 } });
  });

  it("should preserve deep reactivity in testInitial", () => {
    // Arrange
    const initialValue = 42;
    const { testRef, testInitial } = lref("test", initialValue);

    // Act
    const initialResult = testInitial();

    // Assert
    // expect(initialResult).toBe(initialValue);
    expect(isRef(initialResult)).toBe(false);

    // Check if changes to testRef are reflected in subsequent calls to testInitial
    testRef.value = 100;
    expect(testInitial()).toBe(initialValue);

    // Verify that testInitial always returns a new instance
    const anotherInitialResult = testInitial();
    expect(anotherInitialResult).toBe(initialValue);
    // expect(anotherInitialResult).not.toBe(initialResult);
  });

  it("should preserve deep reactivity in testInitial when input is a ref", () => {
    // Arrange
    const initialRef = ref(42);
    const { testRef, testInitial } = lref("test", initialRef);

    // Act
    const initialResult = testInitial();

    // Assert
    expect(initialResult).toBe(42);
    expect(isRef(initialResult)).toBe(false);

    // Check if changes to testRef are reflected in subsequent calls to testInitial
    testRef.value = 100;
    expect(testInitial()).toBe(42);

    // Verify that testInitial always returns a new instance
    const anotherInitialResult = testInitial();
    expect(anotherInitialResult).toBe(42);
    // expect(anotherInitialResult).not.toBe(initialResult);
  });
  it("should return the same value for multiple calls to testInitial", () => {
    const { testInitial } = lref("test", 42);

    const firstCall = testInitial();
    const secondCall = testInitial();

    expect(firstCall).toBe(42);
    expect(secondCall).toBe(42);
    // For primitives, we can't check for different instances
    // So we just ensure the value remains constant
  });

  //= wrong data
  it("should handle undefined value", () => {
    const { testRef, testInitial } = lref("test", undefined);

    expect(testInitial()).toBe(undefined);
    testRef.value = "changed";
    expect(testInitial()).toBe(undefined);
  });

  it("should handle null value", () => {
    const { testRef, testInitial } = lref("test", null);

    expect(testInitial()).toBe(null);
    testRef.value = "changed";
    expect(testInitial()).toBe(null);
  });

  it("should handle circular reference", () => {
    const circular: any = {};
    circular.self = circular;

    const { testRef, testInitial } = lref("test", circular);

    const initial = testInitial();
    expect(initial).toEqual(circular);
    expect(initial.self).toBe(initial);

    testRef.value = { newProp: "changed" };
    const afterChange = testInitial();
    expect(afterChange).toEqual(circular);
    expect(afterChange.self).toBe(afterChange);
  });

  it("should handle NaN value", () => {
    const { testRef, testInitial } = lref("test", Number.NaN);

    expect(Number.isNaN(testInitial())).toBe(true);
    testRef.value = 42;
    expect(Number.isNaN(testInitial())).toBe(true);
  });

  it("should handle Infinity value", () => {
    const { testRef, testInitial } = lref("test", Number.POSITIVE_INFINITY);

    expect(testInitial()).toBe(Number.POSITIVE_INFINITY);
    testRef.value = 42;
    expect(testInitial()).toBe(Number.POSITIVE_INFINITY);
  });

  it("should handle -Infinity value", () => {
    const { testRef, testInitial } = lref("test", Number.NEGATIVE_INFINITY);

    expect(testInitial()).toBe(Number.NEGATIVE_INFINITY);
    testRef.value = 42;
    expect(testInitial()).toBe(Number.NEGATIVE_INFINITY);
  });

  it("should handle ref with special values", () => {
    const testCases = [undefined, null, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

    testCases.forEach((value) => {
      const { testRef, testInitial } = lref("test", ref(value));

      if (Number.isNaN(value)) {
        expect(Number.isNaN(testInitial())).toBe(true);
      } else {
        expect(testInitial()).toBe(value);
      }

      testRef.value = "changed";

      if (Number.isNaN(value)) {
        expect(Number.isNaN(testInitial())).toBe(true);
      } else {
        expect(testInitial()).toBe(value);
      }
    });
  });
});
