import { describe, test, expect, vi } from "vitest";
import { lref, Refer } from "../src/index";
import { ref, computed } from "vue";

describe("lref with incorrect values", () => {
  test("lref with undefined value", () => {
    const result = lref("test", undefined);

    expect(result.testRef.value).toBeUndefined();
    expect(result.testComputed.value).toBeUndefined();
    expect(result.testInitial()).toBeUndefined();
    expect(result.testUnConnected.value).toBeUndefined();
  });

  test("lref with null value", () => {
    const result = lref("test", null);

    expect(result.testRef.value).toBeNull();
    expect(result.testComputed.value).toBeNull();
    expect(result.testInitial()).toBeNull();
    expect(result.testUnConnected.value).toBeNull();
  });

  test("lref with function as value", () => {
    const func = () => console.log("Hello");
    const result = lref("test", func);

    expect(result.testRef.value).toBe(func);
    expect(result.testComputed.value).toBe(func);
    expect(result.testInitial()).toBe(func);
    expect(result.testUnConnected.value).toBe(func);
  });

  test("lref with circular reference", () => {
    const obj: any = { a: 1 };
    obj.self = obj;

    // Circular references can't be deep cloned, so this should throw an error
    expect(() => lref("test", obj)).toThrow();
  });

  test("lref with invalid name", () => {
    // Number as name (TypeScript would catch this, but we're testing runtime behavior)
    // @ts-ignore
    expect(() => lref(42, 42)).toThrow();

    // Object as name (TypeScript would catch this, but we're testing runtime behavior)
    // @ts-ignore
    expect(() => lref({}, 42)).toThrow();
  });

  test("lref with NaN value", () => {
    const result = lref("test", Number.NaN);

    expect(Number.isNaN(result.testRef.value)).toBeTruthy();
    expect(Number.isNaN(result.testComputed.value)).toBeTruthy();
    expect(Number.isNaN(result.testInitial())).toBeTruthy();
    expect(Number.isNaN(result.testUnConnected.value)).toBeTruthy();
  });

  test("lref with Infinity value", () => {
    const result = lref("test", Number.POSITIVE_INFINITY);

    expect(result.testRef.value).toBe(Number.POSITIVE_INFINITY);
    expect(result.testComputed.value).toBe(Number.POSITIVE_INFINITY);
    expect(result.testInitial()).toBe(Number.POSITIVE_INFINITY);
    expect(result.testUnConnected.value).toBe(Number.POSITIVE_INFINITY);
  });

  test("lref with Date object", () => {
    const date = new Date("2023-01-01");
    const result = lref("test", date);

    expect(result.testRef.value).toEqual(date);
    expect(result.testComputed.value).toEqual(date);
  });
});
