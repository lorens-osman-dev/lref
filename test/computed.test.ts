import { lref, Refer } from "../src/index";

import { describe, it, expect } from "vitest";
import { ref } from "vue";

describe("Refer class", () => {
  it("computed property reflects changes to ref", () => {
    const obj = ref({ name: "lorens", age: 32 });
    const gg = new Refer(obj);
    expect(gg.computed.value).toEqual({ name: "lorens", age: 32 });

    // Test reactivity
    gg.ref.value.name = "John";
    expect(gg.computed.value).toEqual({ name: "John", age: 32 });

    gg.ref.value = { name: "Alice", age: 25 };
    expect(gg.computed.value).toEqual({ name: "Alice", age: 25 });
  });
});

/*
describe("lref computed property", () => {
  test("computed property reflects changes to ref", () => {
    const obj = ref({ name: "lorens", age: 32 });
    const gg = new Refer(obj);
    expect(gg.computed.value).toEqual({ name: "lorens", age: 32 });

    // Add more assertions to test reactivity
    gg.ref.value.name = "John";
    expect(gg.computed.value).toEqual({ name: "John", age: 32 });

    gg.ref.value = { name: "Alice", age: 25 };
    expect(gg.computed.value).toEqual({ name: "Alice", age: 25 });
    // testRef.value.count = 10;
    // console.log("*******************");
    // console.log(testComputed.value);
    // expect(testComputed.value).toEqual({ count: 10 });

    // testRef.value = { count: 20 };
    // expect(testComputed.value).toEqual({ count: 20 });
  });

  test("computed property is readonly", () => {
  	const { testComputed } = lref("test", 42);

  	expect(() => {
  		// @ts-ignore - Typescript will catch this error, but we want to test runtime behavior
  		testComputed.value = 100;
  	}).toThrow();
  });

  test("computed property for complex objects", () => {
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

  test("computed property with primitive values", () => {
  	const { testRef, testComputed } = lref("test", "hello");

  	expect(testComputed.value).toBe("hello");

  	testRef.value = "world";
  	expect(testComputed.value).toBe("world");
  });

  test("computed property after reset", () => {
  	const { testRef, testComputed, testReset } = lref("test", { count: 0 });

  	testRef.value.count = 10;
  	expect(testComputed.value).toEqual({ count: 10 });

  	testReset();
  	expect(testComputed.value).toEqual({ count: 0 });
  });

  test("computed property with Vue ref as input", () => {
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

*/
