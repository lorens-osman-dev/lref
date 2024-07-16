import { describe, test, expect, vi } from "vitest";
import { lref, Refer } from "../src/index";
import { ref, computed } from "vue";

describe("lref ", () => {
  test("lref creates an object with correct properties", () => {
    const result = lref("test", 42);

    expect(result.testRef).toBeDefined();
    expect(result.testSetComputed).toBeDefined();
    expect(result.testInitial).toBeDefined();
    expect(result.testLastValueBeforeLastReset).toBeDefined();
    expect(result.testReset).toBeDefined();
    expect(result.testUnConnected).toBeDefined();

    expect(result.testRef.value).toBe(42);
    expect(result.testInitial()).toBe(42);
    expect(result.testUnConnected.value).toBe(42);
  });

  test("setComputed creates a computed property", () => {
    const result = lref("test", 42);
    const doubled = result.testSetComputed((value) => value * 2);

    expect(doubled.value).toBe(84);

    result.testRef.value = 21;
    expect(doubled.value).toBe(42);
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

    const computedValue = result.testSetComputed((value) => value);
    expect(computedValue.value).toEqual({ count: 0 });

    vueRef.value.count = 10;
    expect(computedValue.value).toEqual({ count: 10 });
  });

  test("Refer class works correctly", () => {
    const refer = new Refer({ count: 0 });

    expect(refer.ref.value).toEqual({ count: 0 });
    expect(refer.unConnected.value).toEqual({ count: 0 });

    const computedValue = refer.setComputed((value) => value);
    expect(computedValue.value).toEqual({ count: 0 });

    refer.ref.value.count = 10;
    expect(computedValue.value).toEqual({ count: 10 });
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

  test("computed property with complex transformation", () => {
    const result = lref("test", { items: [1, 2, 3, 4, 5] });
    const sumOfSquaresOfEvenNumbers = result.testSetComputed((value) =>
      value.items
        .filter((num) => num % 2 === 0)
        .map((num) => num * num)
        .reduce((sum, square) => sum + square, 0),
    );

    expect(sumOfSquaresOfEvenNumbers.value).toBe(20); // 2^2 + 4^2 = 4 + 16 = 20

    result.testRef.value.items.push(6);
    expect(sumOfSquaresOfEvenNumbers.value).toBe(56); // 2^2 + 4^2 + 6^2 = 4 + 16 + 36 = 56
  });

  test("computed property with error handling", () => {
    const result = lref("test", { divisor: 2 });
    const safelyDivide = result.testSetComputed((value) => {
      if (value.divisor === 0) {
        return "Cannot divide by zero";
      }
      return 10 / value.divisor;
    });

    expect(safelyDivide.value).toBe(5);

    result.testRef.value.divisor = 0;
    expect(safelyDivide.value).toBe("Cannot divide by zero");

    result.testRef.value.divisor = 5;
    expect(safelyDivide.value).toBe(2);
  });

  test("nested reactivity", () => {
    const result = lref("test", {
      user: {
        profile: {
          name: "Alice",
          age: 30,
        },
      },
    });

    const userInfo = result.testSetComputed(
      (value) => `${value.user.profile.name} is ${value.user.profile.age} years old`,
    );

    expect(userInfo.value).toBe("Alice is 30 years old");

    result.testRef.value.user.profile.name = "Bob";
    expect(userInfo.value).toBe("Bob is 30 years old");

    result.testRef.value.user.profile.age = 35;
    expect(userInfo.value).toBe("Bob is 35 years old");
  });

  test("array reactivity", () => {
    const result = lref("test", { numbers: [1, 2, 3] });
    const sum = result.testSetComputed((value) => value.numbers.reduce((acc, curr) => acc + curr, 0));

    expect(sum.value).toBe(6);

    result.testRef.value.numbers.push(4);
    expect(sum.value).toBe(10);

    result.testRef.value.numbers = [5, 6, 7];
    expect(sum.value).toBe(18);
  });

  test("reset affects computed properties", () => {
    const result = lref("test", { count: 5 });
    const doubled = result.testSetComputed((value) => value.count * 2);

    result.testRef.value.count = 10;
    expect(doubled.value).toBe(20);

    result.testReset();
    expect(result.testRef.value.count).toBe(5);
    expect(doubled.value).toBe(10);
  });

  test("unConnected ref with computed properties", () => {
    const result = lref("test", { count: 5 });
    const doubled = result.testSetComputed((value) => value.count * 2);

    result.testUnConnected.value.count = 10;
    expect(result.testUnConnected.value.count).toBe(10);
    expect(result.testRef.value.count).toBe(5);
    expect(doubled.value).toBe(10); // Should still be based on testRef, not unConnected
  });

  test("computed property with external dependencies", () => {
    const externalRef = ref(2);
    const result = lref("test", { count: 5 });
    const multiplied = result.testSetComputed((value) => value.count * externalRef.value);

    expect(multiplied.value).toBe(10);

    externalRef.value = 3;
    expect(multiplied.value).toBe(15);

    result.testRef.value.count = 10;
    expect(multiplied.value).toBe(30);
  });
  
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

    // Check setComputed type preservation
    const stringComputed = stringResult.testSetComputed((value) => value.toUpperCase());
    const numberComputed = numberResult.testSetComputed((value) => value * 2);
    const booleanComputed = booleanResult.testSetComputed((value) => !value);

    expect(typeof stringComputed.value).toBe("string");
    expect(typeof numberComputed.value).toBe("number");
    expect(typeof booleanComputed.value).toBe("boolean");
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

    // Check setComputed type preservation
    const userComputed = result.testSetComputed((value) => ({ ...value, ageNextYear: value.age + 1 }));
    expect(typeof userComputed.value.name).toBe("string");
    expect(typeof userComputed.value.age).toBe("number");
    expect(typeof userComputed.value.ageNextYear).toBe("number");
  });

  test("array types are preserved", () => {
    const result = lref("test", [1, 2, 3]);

    // TypeScript type check
    const _numbers: number[] = result.testRef.value;

    // Runtime checks
    expect(Array.isArray(result.testRef.value)).toBe(true);
    expect(result.testRef.value.every((item) => typeof item === "number")).toBe(true);

    // Check setComputed type preservation
    const arrayComputed = result.testSetComputed((value) => value.map((n) => n * 2));
    expect(Array.isArray(arrayComputed.value)).toBe(true);
    expect(arrayComputed.value.every((item) => typeof item === "number")).toBe(true);
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

    // Check setComputed type preservation
    const complexComputed = result.testSetComputed((value) => ({
      ...value,
      data: { ...value.data, itemCount: value.data.items.length },
    }));
    expect(typeof complexComputed.value.id).toBe("number");
    expect(typeof complexComputed.value.data.name).toBe("string");
    expect(Array.isArray(complexComputed.value.data.items)).toBe(true);
    expect(typeof complexComputed.value.active).toBe("boolean");
    expect(typeof complexComputed.value.data.itemCount).toBe("number");
  });

  test("union types are preserved", () => {
    type Status = "pending" | "success" | "error";
    const result = lref("test", "pending" as Status);

    // TypeScript type check
    const _status: Status = result.testRef.value;

    // Runtime check
    expect(["pending", "success", "error"].includes(result.testRef.value)).toBe(true);

    // Check setComputed type preservation
    const statusComputed = result.testSetComputed((value) => (value === "pending" ? "success" : "error"));
    expect(["pending", "success", "error"].includes(statusComputed.value)).toBe(true);
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

    // Check setComputed type preservation
    const numberComputed = numberResult.testSetComputed((value) => value.toString());
    const stringComputed = stringResult.testSetComputed((value) => value.length);

    expect(typeof numberComputed.value).toBe("string");
    expect(typeof stringComputed.value).toBe("number");
  });

  test("Vue ref types are preserved", () => {
    const vueRef = ref({ count: 0 });
    const result = lref("test", vueRef);

    // TypeScript type check
    const _ref: { count: number } = result.testRef.value;

    // Runtime checks
    expect(typeof result.testRef.value.count).toBe("number");

    // Check setComputed type preservation
    const refComputed = result.testSetComputed((value) => ({ doubleCount: value.count * 2 }));
    expect(typeof refComputed.value.doubleCount).toBe("number");
  });
  it("should return an object with correct properties", () => {
    const result = lref("test", 0);

    expect(result).toHaveProperty("testRef");
    expect(result).toHaveProperty("testInitial");
    expect(result).toHaveProperty("testLastValueBeforeLastReset");
    expect(result).toHaveProperty("testReset");
    expect(result).toHaveProperty("testUnConnected");
    expect(result).toHaveProperty("testHistory");
    expect(result).toHaveProperty("testSetComputed");
  });

  it("should allow destructuring of returned properties", () => {
    const { testRef, testInitial, testReset, testUnConnected, testHistory } = lref("test", 10);

    expect(testRef.value).toBe(10);
    expect(testInitial()).toBe(10);
    expect(typeof testReset).toBe("function");
    expect(testUnConnected.value).toBe(10);
    expect(testHistory).toHaveProperty("data");
    expect(testHistory).toHaveProperty("undo");
    expect(testHistory).toHaveProperty("redo");
  });

  it("should work with primitive values", () => {
    const { numberRef, numberReset } = lref("number", 42);

    expect(numberRef.value).toBe(42);
    numberRef.value = 100;
    expect(numberRef.value).toBe(100);
    numberReset();
    expect(numberRef.value).toBe(42);
  });

  it("should work with Vue refs", () => {
    const initialRef = ref(5);
    const { refRef, refReset } = lref("ref", initialRef);

    expect(refRef.value).toBe(5);
    refRef.value = 10;
    expect(refRef.value).toBe(10);
    expect(initialRef.value).toBe(10); // The original ref should be updated
    refReset();
    expect(refRef.value).toBe(5);
    expect(initialRef.value).toBe(5);
  });

  it("should provide a working setComputed method", () => {
    const { countRef, countSetComputed } = lref("count", 1);

    const doubleCount = countSetComputed((value) => value * 2);

    expect(doubleCount.value).toBe(2);
    countRef.value = 5;
    expect(doubleCount.value).toBe(10);
  });
  
    test("basic reactivity between original ref and testRef", () => {
    const originalRef = ref({ count: 0 });
    const { testRef, testSetComputed } = lref("test", originalRef);

    const testComputed = testSetComputed((value) => value.count * 2);

    expect(testRef.value.count).toBe(0);
    expect(testComputed.value).toBe(0);

    originalRef.value.count = 5;
    expect(testRef.value.count).toBe(5);
    expect(testComputed.value).toBe(10);

    testRef.value.count = 10;
    expect(originalRef.value.count).toBe(10);
    expect(testComputed.value).toBe(20);
  });

  test("nested object property changes are reactive", () => {
    const originalRef = ref({
      user: {
        profile: {
          name: "Alice",
          age: 30,
        },
        settings: {
          theme: "dark",
          notifications: true,
        },
      },
    });
    const { testRef, testSetComputed } = lref("test", originalRef);

    const testComputed = testSetComputed((value) => value);

    expect(testComputed.value.user.profile.name).toBe("Alice");

    originalRef.value.user.profile.name = "Bob";
    expect(testComputed.value.user.profile.name).toBe("Bob");

    testRef.value.user.settings.theme = "light";
    expect(originalRef.value.user.settings.theme).toBe("light");
    expect(testComputed.value.user.settings.theme).toBe("light");
  });

  test("adding new properties to nested objects is reactive", () => {
    const originalRef = ref({
      user: {
        profile: {},
      },
    });
    const { testRef, testSetComputed } = lref("test", originalRef);

    const testComputed = testSetComputed((value) => value);

    // @ts-ignore - TypeScript will complain, but we're testing runtime behavior
    originalRef.value.user.profile.email = "alice@example.com";
    // @ts-ignore
    expect(testComputed.value.user.profile.email).toBe("alice@example.com");

    // @ts-ignore
    testRef.value.user.profile.phone = "1234567890";
    // @ts-ignore
    expect(originalRef.value.user.profile.phone).toBe("1234567890");
  });

  test("array modifications in nested objects are reactive", () => {
    const originalRef = ref({
      user: {
        hobbies: ["reading", "cycling"],
      },
    });
    const { testRef, testSetComputed } = lref("test", originalRef);

    const testComputed = testSetComputed((value) => value);

    originalRef.value.user.hobbies.push("swimming");
    expect(testComputed.value.user.hobbies).toEqual(["reading", "cycling", "swimming"]);

    testRef.value.user.hobbies[0] = "writing";
    expect(originalRef.value.user.hobbies).toEqual(["writing", "cycling", "swimming"]);
    expect(testComputed.value.user.hobbies).toEqual(["writing", "cycling", "swimming"]);
  });

  test("replacing entire nested objects is reactive", () => {
    const originalRef = ref({
      user: {
        profile: {
          name: "Alice",
          age: 30,
        },
      },
    });
    const { testRef, testSetComputed } = lref("test", originalRef);

    const testComputed = testSetComputed((value) => value);

    originalRef.value.user = {
      profile: {
        name: "Bob",
        age: 35,
      },
    };

    expect(testComputed.value.user.profile.name).toBe("Bob");
    expect(testRef.value.user.profile.age).toBe(35);

    testRef.value.user = {
      profile: {
        name: "Charlie",
        age: 40,
      },
    };

    expect(originalRef.value.user.profile.name).toBe("Charlie");
    expect(testComputed.value.user.profile.age).toBe(40);
  });

  test("deeply nested object modifications are reactive", () => {
    const originalRef = ref({
      level1: {
        level2: {
          level3: {
            level4: {
              value: "deep",
            },
          },
        },
      },
    });
    const { testRef, testSetComputed } = lref("test", originalRef);

    const testComputed = testSetComputed((value) => value);

    expect(testComputed.value.level1.level2.level3.level4.value).toBe("deep");

    originalRef.value.level1.level2.level3.level4.value = "very deep";
    expect(testComputed.value.level1.level2.level3.level4.value).toBe("very deep");

    testRef.value.level1.level2.level3.level4.value = "extremely deep";
    expect(originalRef.value.level1.level2.level3.level4.value).toBe("extremely deep");
  });

  test("reactivity with mix of arrays and objects", () => {
    const originalRef = ref({
      users: [
        { name: "Alice", scores: [85, 90, 95] },
        { name: "Bob", scores: [80, 85, 90] },
      ],
    });
    const { testRef, testSetComputed } = lref("test", originalRef);

    const testComputed = testSetComputed((value) => value);

    originalRef.value.users[0].scores[1] = 92;
    expect(testComputed.value.users[0].scores).toEqual([85, 92, 95]);

    testRef.value.users.push({ name: "Charlie", scores: [90, 95, 100] });
    expect(originalRef.value.users.length).toBe(3);
    expect(testComputed.value.users[2].name).toBe("Charlie");
  });

  test("reactivity maintained after reset", () => {
    const originalRef = ref({
      user: {
        profile: {
          name: "Alice",
          age: 30,
        },
      },
    });
    const { testRef, testSetComputed, testReset } = lref("test", originalRef);

    const testComputed = testSetComputed((value) => value);

    originalRef.value.user.profile.name = "Bob";
    expect(testComputed.value.user.profile.name).toBe("Bob");

    testReset();
    expect(testComputed.value.user.profile.name).toBe("Alice");
    expect(originalRef.value.user.profile.name).toBe("Alice");

    testRef.value.user.profile.age = 31;
    expect(testComputed.value.user.profile.age).toBe(31);
    expect(originalRef.value.user.profile.age).toBe(31);
  });

  test("computed property with complex transformation", () => {
    const originalRef = ref({
      items: [1, 2, 3, 4, 5],
    });
    const { testRef, testSetComputed } = lref("test", originalRef);

    const sumOfSquaresOfEvenNumbers = testSetComputed((value) =>
      value.items
        .filter((num) => num % 2 === 0)
        .map((num) => num * num)
        .reduce((sum, square) => sum + square, 0),
    );

    expect(sumOfSquaresOfEvenNumbers.value).toBe(20); // 2^2 + 4^2 = 4 + 16 = 20

    originalRef.value.items.push(6);
    expect(sumOfSquaresOfEvenNumbers.value).toBe(56); // 2^2 + 4^2 + 6^2 = 4 + 16 + 36 = 56

    testRef.value.items = [2, 4, 6, 8];
    expect(sumOfSquaresOfEvenNumbers.value).toBe(120); // 2^2 + 4^2 + 6^2 + 8^2 = 4 + 16 + 36 + 64 = 120
    expect(originalRef.value.items).toEqual([2, 4, 6, 8]);
  });

  test("computed property with error handling", () => {
    const originalRef = ref({
      divisor: 2,
    });
    const { testRef, testSetComputed } = lref("test", originalRef);

    const safelyDivide = testSetComputed((value) => {
      if (value.divisor === 0) {
        return "Cannot divide by zero";
      }
      return 10 / value.divisor;
    });

    expect(safelyDivide.value).toBe(5);

    originalRef.value.divisor = 0;
    expect(safelyDivide.value).toBe("Cannot divide by zero");

    testRef.value.divisor = 5;
    expect(safelyDivide.value).toBe(2);
    expect(originalRef.value.divisor).toBe(5);
  });

  test("nested object property changes are reactive", () => {
    const { testRef, testSetComputed } = lref("test", {
      user: {
        profile: {
          name: "Alice",
          age: 30,
        },
        settings: {
          theme: "dark",
          notifications: true,
        },
      },
    });

    const testComputed = testSetComputed((value) => value);

    expect(testComputed.value.user.profile.name).toBe("Alice");

    testRef.value.user.profile.name = "Bob";
    expect(testComputed.value.user.profile.name).toBe("Bob");

    testRef.value.user.settings.theme = "light";
    expect(testComputed.value.user.settings.theme).toBe("light");
  });

  test("adding new properties to nested objects is reactive", () => {
    const { testRef, testSetComputed } = lref("test", {
      user: {
        profile: {},
      },
    });

    const testComputed = testSetComputed((value) => value);

    // @ts-ignore - TypeScript will complain, but we're testing runtime behavior
    testRef.value.user.profile.email = "alice@example.com";
    // @ts-ignore
    expect(testComputed.value.user.profile.email).toBe("alice@example.com");
  });

  test("array modifications in nested objects are reactive", () => {
    const { testRef, testSetComputed } = lref("test", {
      user: {
        hobbies: ["reading", "cycling"],
      },
    });

    const testComputed = testSetComputed((value) => value);

    testRef.value.user.hobbies.push("swimming");
    expect(testComputed.value.user.hobbies).toEqual(["reading", "cycling", "swimming"]);

    testRef.value.user.hobbies[0] = "writing";
    expect(testComputed.value.user.hobbies).toEqual(["writing", "cycling", "swimming"]);
  });

  test("replacing entire nested objects is reactive", () => {
    const { testRef, testSetComputed } = lref("test", {
      user: {
        profile: {
          name: "Alice",
          age: 30,
        },
      },
    });

    const testComputed = testSetComputed((value) => value);

    testRef.value.user = {
      profile: {
        name: "Bob",
        age: 35,
      },
    };

    expect(testComputed.value.user.profile.name).toBe("Bob");
    expect(testComputed.value.user.profile.age).toBe(35);
  });

  test("deeply nested object modifications are reactive", () => {
    const { testRef, testSetComputed } = lref("test", {
      level1: {
        level2: {
          level3: {
            level4: {
              value: "deep",
            },
          },
        },
      },
    });

    const testComputed = testSetComputed((value) => value);

    expect(testComputed.value.level1.level2.level3.level4.value).toBe("deep");

    testRef.value.level1.level2.level3.level4.value = "very deep";
    expect(testComputed.value.level1.level2.level3.level4.value).toBe("very deep");
  });

  test("reactivity with mix of arrays and objects", () => {
    const { testRef, testSetComputed } = lref("test", {
      users: [
        { name: "Alice", scores: [85, 90, 95] },
        { name: "Bob", scores: [80, 85, 90] },
      ],
    });

    const testComputed = testSetComputed((value) => value);

    testRef.value.users[0].scores[1] = 92;
    expect(testComputed.value.users[0].scores).toEqual([85, 92, 95]);

    testRef.value.users.push({ name: "Charlie", scores: [90, 95, 100] });
    expect(testComputed.value.users.length).toBe(3);
    expect(testComputed.value.users[2].name).toBe("Charlie");
  });

  test("reactivity maintained after reset", () => {
    const { testRef, testSetComputed, testReset } = lref("test", {
      user: {
        profile: {
          name: "Alice",
          age: 30,
        },
      },
    });

    const testComputed = testSetComputed((value) => value);

    testRef.value.user.profile.name = "Bob";
    expect(testComputed.value.user.profile.name).toBe("Bob");

    testReset();
    expect(testComputed.value.user.profile.name).toBe("Alice");

    testRef.value.user.profile.age = 31;
    expect(testComputed.value.user.profile.age).toBe(31);
  });
  
    test("lref with undefined value", () => {
    const { testRef, testInitial, testUnConnected } = lref("test", undefined);

    expect(testRef.value).toBeUndefined();
    expect(testInitial()).toBeUndefined();
    expect(testUnConnected.value).toBeUndefined();
  });

  test("lref with null value", () => {
    const { testRef, testInitial, testUnConnected } = lref("test", null);

    expect(testRef.value).toBeNull();
    expect(testInitial()).toBeNull();
    expect(testUnConnected.value).toBeNull();
  });

  test("lref with function as value", () => {
    const func = () => console.log("Hello");
    const { testRef, testInitial, testUnConnected } = lref("test", func);

    expect(testRef.value).toBe(func);
    expect(testInitial()).toEqual(func);
    expect(testUnConnected.value).toEqual(func);
  });

  test("lref with circular reference", () => {
    const obj: any = { a: 1 };
    obj.self = obj;

    // Circular references can't be deep cloned, so this should throw an error
    expect(() => lref("test", obj)).toThrow();
  });

  test("lref with NaN value", () => {
    const { testRef, testInitial, testUnConnected } = lref("test", Number.NaN);

    expect(Number.isNaN(testRef.value)).toBeTruthy();
    expect(Number.isNaN(testInitial())).toBeTruthy();
    expect(Number.isNaN(testUnConnected.value)).toBeTruthy();
  });

  test("lref with Infinity value", () => {
    const { testRef, testInitial, testUnConnected } = lref("test", Number.POSITIVE_INFINITY);

    expect(testRef.value).toBe(Number.POSITIVE_INFINITY);
    expect(testInitial()).toBe(Number.POSITIVE_INFINITY);
    expect(testUnConnected.value).toBe(Number.POSITIVE_INFINITY);
  });

  test("lref with SetComputed", () => {
    const { testRef, testSetComputed } = lref("test", 5);
    const doubledValue = testSetComputed((value) => value * 2);

    expect(doubledValue.value).toBe(10);
    testRef.value = 10;
    expect(doubledValue.value).toBe(20);
  });
});
