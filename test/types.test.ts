import { describe, test, expect, vi } from "vitest";
import { lref, Refer } from "../src/index";
import { ref, computed } from "vue";

describe("lref type preservation", () => {
  test("primitive types are preserved", () => {
    const stringResult = lref("test", "hello");
    const numberResult = lref("test", 42);
    const booleanResult = lref("test", true);

    // TypeScript type checks
    const _string: string = stringResult.testRef.value;
    const _number: number = numberResult.testRef.value;
    const _boolean: boolean = booleanResult.testRef.value;

    // Runtime checks
    expect(typeof stringResult.testRef.value).toBe("string");
    expect(typeof numberResult.testRef.value).toBe("number");
    expect(typeof booleanResult.testRef.value).toBe("boolean");
  });

  test("object types are preserved", () => {
    interface User {
      name: string;
      age: number;
    }

    const result = lref("test", { name: "Alice", age: 30 } as User);

    // TypeScript type check
    const _user: User = result.testRef.value;

    // Runtime checks
    expect(typeof result.testRef.value.name).toBe("string");
    expect(typeof result.testRef.value.age).toBe("number");
  });

  test("array types are preserved", () => {
    const result = lref("test", [1, 2, 3]);

    // TypeScript type check
    const _numbers: number[] = result.testRef.value;

    // Runtime checks
    expect(Array.isArray(result.testRef.value)).toBe(true);
    expect(result.testRef.value.every((item) => typeof item === "number")).toBe(true);
  });

  test("complex nested types are preserved", () => {
    interface ComplexType {
      id: number;
      data: {
        name: string;
        items: string[];
      };
      active: boolean;
    }

    const complex: ComplexType = {
      id: 1,
      data: {
        name: "Test",
        items: ["a", "b", "c"],
      },
      active: true,
    };

    const result = lref("test", complex);

    // TypeScript type check
    const _complex: ComplexType = result.testRef.value;

    // Runtime checks
    expect(typeof result.testRef.value.id).toBe("number");
    expect(typeof result.testRef.value.data.name).toBe("string");
    expect(Array.isArray(result.testRef.value.data.items)).toBe(true);
    expect(typeof result.testRef.value.active).toBe("boolean");
  });

  test("union types are preserved", () => {
    type Status = "pending" | "success" | "error";
    const result = lref("test", "pending" as Status);

    // TypeScript type check
    const _status: Status = result.testRef.value;

    // Runtime check
    expect(["pending", "success", "error"].includes(result.testRef.value)).toBe(true);
  });

  test("generic types are preserved", () => {
    function createGenericLref<T>(value: T) {
      return lref("test", value);
    }

    const numberResult = createGenericLref(42);
    const stringResult = createGenericLref("hello");

    // TypeScript type checks
    const _number: number = numberResult.testRef.value;
    const _string: string = stringResult.testRef.value;

    // Runtime checks
    expect(typeof numberResult.testRef.value).toBe("number");
    expect(typeof stringResult.testRef.value).toBe("string");
  });

  test("Vue ref types are preserved", () => {
    const vueRef = ref({ count: 0 });
    const result = lref("test", vueRef);

    // TypeScript type check
    const _ref: { count: number } = result.testRef.value;

    // Runtime checks
    expect(typeof result.testRef.value.count).toBe("number");
  });
});
