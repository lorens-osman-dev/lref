import { lref } from "../src/index";
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";

describe("lref computed property", () => {
  it("computed property is readonly", () => {
    const { testComputed } = lref("test", 42);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Attempt to assign a value to the readonly computed property
    // @ts-ignore - Typescript will catch this error, but we want to test runtime behavior
    testComputed.value = 100;

    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("computed property for complex objects", () => {
    const { testRef, testComputed } = lref("test", {
      user: { name: "Alice", age: 30 },
      scores: [85, 90, 95],
    });

    expect(testComputed.value).toEqual({
      user: { name: "Alice", age: 30 },
      scores: [85, 90, 95],
    });

    testRef.value.user.name = "Bob";
    testRef.value.scores.push(100);

    expect(testComputed.value).toEqual({
      user: { name: "Bob", age: 30 },
      scores: [85, 90, 95, 100],
    });
  });

  it("computed property with primitive values", () => {
    const { testRef, testComputed } = lref("test", "hello");

    expect(testComputed.value).toBe("hello");

    testRef.value = "world";
    expect(testComputed.value).toBe("world");
  });

  it("computed property after reset", () => {
    const { testRef, testComputed, testReset } = lref("test", { count: 0 });

    testRef.value.count = 10;
    expect(testComputed.value).toEqual({ count: 10 });

    testReset();
    expect(testComputed.value).toEqual({ count: 0 });
  });

  it("computed property with Vue ref as input", () => {
    const vueRef = ref({ count: 0 });
    const { testRef, testComputed } = lref("test", vueRef);

    expect(testComputed.value).toEqual({ count: 0 });

    vueRef.value.count = 10;
    expect(testComputed.value).toEqual({ count: 10 });

    testRef.value = { count: 20 };
    expect(testComputed.value).toEqual({ count: 20 });
    expect(vueRef.value).toEqual({ count: 20 });
  });
});
