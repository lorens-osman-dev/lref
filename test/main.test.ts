import { describe, test, expect, vi } from "vitest";
import { lref, Refer } from "../src/index";
import { ref, computed } from "vue";

describe("lref ", () => {
  test("lref creates an object with correct properties", () => {
    const result = lref("test", 42);

    expect(result.testRef).toBeDefined();
    expect(result.testComputed).toBeDefined();
    expect(result.testInitial).toBeDefined();
    expect(result.testLastValueBeforeLastReset).toBeDefined();
    expect(result.testReset).toBeDefined();
    expect(result.testUnConnected).toBeDefined();

    expect(result.testRef.value).toBe(42);
    expect(result.testComputed.value).toBe(42);
    expect(result.testInitial()).toBe(42);
    expect(result.testUnConnected.value).toBe(42);
  });

  test("reset restores the initial value", () => {
    const result = lref("test", { count: 0 });

    result.testRef.value.count = 10;
    expect(result.testRef.value.count).toBe(10);

    result.testReset();
    expect(result.testRef.value.count).toBe(0);
  });

  test("lastValueBeforeLastReset returns the last value before reset", () => {
    const result = lref("test", { count: 0 });

    expect(result.testLastValueBeforeLastReset()).toBeNull();

    result.testRef.value.count = 10;
    result.testReset();

    expect(result.testLastValueBeforeLastReset()).toEqual({ count: 10 });
  });

  test("unConnected ref is not affected by changes to main ref", () => {
    const result = lref("test", { count: 0 });

    result.testRef.value.count = 10;
    result.testUnConnected.value.count = 20;
    expect(result.testRef.value.count).toBe(10);
    expect(result.testUnConnected.value.count).toBe(20);
  });

  test("lref works with Vue ref as input", () => {
    const vueRef = ref({ count: 0 });
    const result = lref("test", vueRef);

    expect(result.testRef).toBe(vueRef);
    expect(result.testComputed.value).toEqual({ count: 0 });

    vueRef.value.count = 10;
    expect(result.testComputed.value).toEqual({ count: 10 });
  });

  test("Refer class works correctly", () => {
    const refer = new Refer({ count: 0 });

    expect(refer.ref.value).toEqual({ count: 0 });
    expect(refer.computed.value).toEqual({ count: 0 });
    expect(refer.unConnected.value).toEqual({ count: 0 });

    refer.ref.value.count = 10;
    expect(refer.computed.value).toEqual({ count: 10 });
    expect(refer.unConnected.value).toEqual({ count: 0 });

    refer.reset();
    expect(refer.ref.value).toEqual({ count: 0 });
    expect(refer.lastValueBeforeLastReset()).toEqual({ count: 10 });
  });

  test("lref preserve reactivity with Vue ref as input ", () => {
    const vueRef = ref({ count: 0 });
    const result = lref("test", vueRef);

    expect(result.testRef).toBe(vueRef);
    expect(result.testRef.value).toEqual({ count: 0 });

    vueRef.value.count = 10;
    expect(result.testRef.value).toEqual({ count: 10 });
    result.testRef.value.count = 20;
    expect(result.testRef.value).toEqual({ count: 20 });
    expect(vueRef.value).toEqual({ count: 20 });
  });
});
