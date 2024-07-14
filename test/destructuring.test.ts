import { describe, test, expect, vi } from "vitest";
import { lref, Refer } from "../src/index";

describe("lref destructuring", () => {
  test("lref object can be destructured", () => {
    const { testRef, testComputed, testInitial, testLastValueBeforeLastReset, testReset, testUnConnected } =
      lref("test", 42);

    expect(testRef.value).toBe(42);
    expect(testComputed.value).toBe(42);
    expect(testInitial()).toBe(42);
    expect(testLastValueBeforeLastReset()).toBeNull();
    expect(typeof testReset).toBe("function");
    expect(testUnConnected.value).toBe(42);
  });

  test("destructured properties work correctly", () => {
    const { testRef, testComputed, testInitial, testLastValueBeforeLastReset, testReset, testUnConnected } =
      lref("test", { count: 0 });

    testRef.value.count = 10;
    expect(testRef.value.count).toBe(10);
    expect(testComputed.value.count).toBe(10);
    expect(testUnConnected.value.count).toBe(0);

    testReset();
    expect(testRef.value.count).toBe(0);
    expect(testLastValueBeforeLastReset()).toEqual({ count: 10 });
    expect(testInitial()).toEqual({ count: 0 });
  });

  test("partial destructuring works", () => {
    const { testRef, testReset } = lref("test", { count: 0 });

    testRef.value.count = 10;
    expect(testRef.value.count).toBe(10);

    testReset();
    expect(testRef.value.count).toBe(0);
  });

  test("destructuring with renamed variables works", () => {
    const { testRef: myRef, testComputed: myComputed, testReset: myReset } = lref("test", 42);

    expect(myRef.value).toBe(42);
    expect(myComputed.value).toBe(42);

    myRef.value = 100;
    expect(myRef.value).toBe(100);
    expect(myComputed.value).toBe(100);

    myReset();
    expect(myRef.value).toBe(42);
  });
});
