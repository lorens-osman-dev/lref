import { describe, it, expect, vi, expectTypeOf, test } from "vitest";
import { lref } from "../src/index";
import { computed, isRef, nextTick, reactive, watch } from "vue";

describe("lref with various data types", () => {
  /* input is various Data Types like object , complex object ,array,Set,Map,symbol,BigInt,custom class instance,mixed nested structure,Date object*/
  it("handles primitive types", () => {
    const { testRef } = lref("test", 42);
    expect(testRef.value).toBe(42);

    const { testRef: stringRef } = lref("test", "hello");
    expect(stringRef.value).toBe("hello");

    const { testRef: boolRef } = lref("test", true);
    expect(boolRef.value).toBe(true);
  });

  it("handles objects", () => {
    const obj = { name: "John", age: 30 };
    const { testRef } = lref("test", obj);
    expect(testRef.value).toEqual(obj);
  });

  it("handles complex objects", () => {
    const complexObj = {
      id: 1,
      info: {
        name: "Alice",
        contacts: {
          email: "alice@example.com",
          phone: "123-456-7890",
        },
      },
      hobbies: ["reading", "cycling"],
    };
    const { testRef } = lref("test", complexObj);
    expect(testRef.value).toEqual(complexObj);
  });

  it("handles arrays", () => {
    const arr = [1, 2, 3, 4, 5];
    const { testRef } = lref("test", arr);
    expect(testRef.value).toEqual(arr);
  });

  it("handles Sets", () => {
    const set = new Set([1, 2, 3]);
    const { testRef } = lref("test", set);
    expect(testRef.value).toEqual(set);
  });

  it("handles Maps", () => {
    const map = new Map([
      ["key1", "value1"],
      ["key2", "value2"],
    ]);
    const { testRef } = lref("test", map);
    expect(testRef.value).toEqual(map);
  });

  it("handles symbols", () => {
    const sym = Symbol("test");
    const { testRef } = lref("test", sym);
    expect(testRef.value).toBe(sym);
  });

  it("handles BigInt", () => {
    const bigInt = BigInt(9007199254740991);
    const { testRef } = lref("test", bigInt);
    expect(testRef.value).toBe(bigInt);
  });

  it("handles custom class instances", () => {
    class CustomClass {
      constructor(public value: string) {}
    }
    const instance = new CustomClass("test value");
    const { testRef } = lref("test", instance);
    expect(testRef.value).toBeInstanceOf(CustomClass);
    expect(testRef.value.value).toBe("test value");
  });

  it("handles mixed nested structures", () => {
    const mixedStructure = {
      array: [1, "two", { three: 3 }],
      set: new Set([4, 5, 6]),
      map: new Map([
        ["seven", 7],
        ["eight", 8],
      ]),
      nested: {
        object: { nine: 9 },
        array: [10, 11, 12],
      },
    };
    const { testRef } = lref("test", mixedStructure);
    expect(testRef.value).toEqual(mixedStructure);
  });

  it("handles Date objects", () => {
    const date = new Date("2023-01-01");
    const { testRef } = lref("test", date);
    expect(testRef.value).toEqual(date);
  });

  //= did result.testRef preserve reactivity
  it("preserves reactivity for number", async () => {
    const { testRef } = lref("test", 0);
    const double = computed(() => testRef.value * 2);

    expect(testRef.value).toBe(0);
    expect(double.value).toBe(0);

    testRef.value = 5;
    await nextTick();
    expect(testRef.value).toBe(5);
    expect(double.value).toBe(10);
  });

  it("preserves reactivity for string", async () => {
    const { testRef } = lref("test", "hello");
    const upperCase = computed(() => testRef.value.toUpperCase());

    expect(testRef.value).toBe("hello");
    expect(upperCase.value).toBe("HELLO");

    testRef.value = "world";
    await nextTick();
    expect(testRef.value).toBe("world");
    expect(upperCase.value).toBe("WORLD");
  });

  it("preserves reactivity for boolean", async () => {
    const { testRef } = lref("test", true);
    const notValue = computed(() => !testRef.value);

    expect(testRef.value).toBe(true);
    expect(notValue.value).toBe(false);

    testRef.value = false;
    await nextTick();
    expect(testRef.value).toBe(false);
    expect(notValue.value).toBe(true);
  });

  it("triggers watcher for changes", async () => {
    const { testRef } = lref("test", 0);
    const mockFn = vi.fn();

    watch(testRef, mockFn);

    testRef.value = 1;
    await nextTick();
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(1, 0, expect.any(Function));

    testRef.value = 2;
    await nextTick();
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith(2, 1, expect.any(Function));
  });

  it("preserves reactivity for object properties", async () => {
    const { testRef } = lref("test", { count: 0 });
    const double = computed(() => testRef.value.count * 2);

    expect(testRef.value.count).toBe(0);
    expect(double.value).toBe(0);

    testRef.value.count = 5;
    await nextTick();
    expect(testRef.value.count).toBe(5);
    expect(double.value).toBe(10);
  });

  it("preserves reactivity for array elements", async () => {
    const { testRef } = lref("test", [1, 2, 3]);
    const sum = computed(() => testRef.value.reduce((acc, val) => acc + val, 0));

    expect(testRef.value).toEqual([1, 2, 3]);
    expect(sum.value).toBe(6);

    testRef.value.push(4);
    await nextTick();
    expect(testRef.value).toEqual([1, 2, 3, 4]);
    expect(sum.value).toBe(10);
  });

  it("preserves reactivity for nested object properties", async () => {
    const { testRef } = lref("test", { user: { name: "John", age: 30 } });
    const userInfo = computed(() => `${testRef.value.user.name} is ${testRef.value.user.age} years old`);

    expect(userInfo.value).toBe("John is 30 years old");

    testRef.value.user.name = "Jane";
    testRef.value.user.age = 25;
    await nextTick();
    expect(userInfo.value).toBe("Jane is 25 years old");
  });

  it("preserves reactivity when replacing the entire object", async () => {
    const { testRef } = lref("test", { count: 0 });
    const double = computed(() => testRef.value.count * 2);

    expect(testRef.value.count).toBe(0);
    expect(double.value).toBe(0);

    testRef.value = { count: 5 };
    await nextTick();
    expect(testRef.value.count).toBe(5);
    expect(double.value).toBe(10);
  });

  //= type preservation
  it("preserves primitive types", () => {
    const { testRef: numberRef } = lref("test", 42);
    const { testRef: stringRef } = lref("test", "hello");
    const { testRef: booleanRef } = lref("test", true);

    expectTypeOf(numberRef.value).toBeNumber();
    expectTypeOf(stringRef.value).toBeString();
    expectTypeOf(booleanRef.value).toBeBoolean();

    // Runtime checks
    expect(typeof numberRef.value).toBe("number");
    expect(typeof stringRef.value).toBe("string");
    expect(typeof booleanRef.value).toBe("boolean");
  });

  it("preserves object types", () => {
    interface User {
      name: string;
      age: number;
    }

    const user: User = { name: "John", age: 30 };
    const { testRef } = lref("test", user);

    expectTypeOf(testRef.value).toMatchTypeOf<User>();

    // Runtime checks
    expect(testRef.value).toEqual(user);
    expect(testRef.value.name).toBe("John");
    expect(testRef.value.age).toBe(30);
  });

  it("preserves array types", () => {
    const numbers = [1, 2, 3, 4, 5];
    const { testRef } = lref("test", numbers);

    expectTypeOf(testRef.value).toBeArray();
    expectTypeOf(testRef.value[0]).toBeNumber();

    // Runtime checks
    expect(Array.isArray(testRef.value)).toBe(true);
    expect(testRef.value).toEqual(numbers);
  });

  it("preserves complex nested types", () => {
    interface NestedType {
      id: number;
      data: {
        name: string;
        items: Array<{ id: number; value: string }>;
      };
    }

    const nested: NestedType = {
      id: 1,
      data: {
        name: "Test",
        items: [
          { id: 1, value: "one" },
          { id: 2, value: "two" },
        ],
      },
    };

    const { testRef } = lref("test", nested);

    expectTypeOf(testRef.value).toMatchTypeOf<NestedType>();
    expectTypeOf(testRef.value.data.items[0].value).toBeString();

    // Runtime checks
    expect(testRef.value).toEqual(nested);
    expect(testRef.value.data.items[1].value).toBe("two");
  });

  it("preserves union types", () => {
    type UnionType = string | number | { type: "object"; value: number };

    const stringUnion: UnionType = "hello";
    const numberUnion: UnionType = 42;
    const objectUnion: UnionType = { type: "object", value: 100 };

    const { testRef: stringRef } = lref("test", stringUnion);
    const { testRef: numberRef } = lref("test", numberUnion);
    const { testRef: objectRef } = lref("test", objectUnion);

    expectTypeOf(stringRef.value).toMatchTypeOf<UnionType>();
    expectTypeOf(numberRef.value).toMatchTypeOf<UnionType>();
    expectTypeOf(objectRef.value).toMatchTypeOf<UnionType>();

    // Runtime checks
    expect(typeof stringRef.value).toBe("string");
    expect(typeof numberRef.value).toBe("number");
    expect(typeof objectRef.value).toBe("object");
    if (typeof objectRef.value === "object" && objectRef.value !== null) {
      expect(objectRef.value.type).toBe("object");
      expect(objectRef.value.value).toBe(100);
    }
  });

  it("preserves types with generics", () => {
    interface GenericType<T> {
      data: T;
      timestamp: number;
    }

    const stringGeneric: GenericType<string> = { data: "hello", timestamp: Date.now() };
    const numberGeneric: GenericType<number> = { data: 42, timestamp: Date.now() };

    const { testRef: stringRef } = lref("test", stringGeneric);
    const { testRef: numberRef } = lref("test", numberGeneric);

    expectTypeOf(stringRef.value).toMatchTypeOf<GenericType<string>>();
    expectTypeOf(numberRef.value).toMatchTypeOf<GenericType<number>>();

    // Runtime checks
    expect(typeof stringRef.value.data).toBe("string");
    expect(typeof numberRef.value.data).toBe("number");
  });

  //= preserve deep reactivity
  it("preserves deep reactivity for nested objects", async () => {
    const { testRef } = lref("test", {
      user: {
        name: "John",
        address: {
          city: "New York",
          zipCode: "10001",
        },
      },
    });

    const fullAddress = computed(
      () =>
        `${testRef.value.user.name}, ${testRef.value.user.address.city}, ${testRef.value.user.address.zipCode}`,
    );

    expect(fullAddress.value).toBe("John, New York, 10001");

    testRef.value.user.name = "Jane";
    await nextTick();
    expect(fullAddress.value).toBe("Jane, New York, 10001");

    testRef.value.user.address.city = "Los Angeles";
    await nextTick();
    expect(fullAddress.value).toBe("Jane, Los Angeles, 10001");
  });

  it("preserves deep reactivity for arrays of objects", async () => {
    const { testRef } = lref("test", {
      items: [
        { id: 1, name: "Item 1", price: 10 },
        { id: 2, name: "Item 2", price: 20 },
        { id: 3, name: "Item 3", price: 30 },
      ],
    });

    const totalPrice = computed(() => testRef.value.items.reduce((sum, item) => sum + item.price, 0));

    expect(totalPrice.value).toBe(60);

    testRef.value.items[1].price = 25;
    await nextTick();
    expect(totalPrice.value).toBe(65);

    testRef.value.items.push({ id: 4, name: "Item 4", price: 40 });
    await nextTick();
    expect(totalPrice.value).toBe(105);
  });

  it("preserves deep reactivity for complex nested structures", async () => {
    const { testRef } = lref("test", {
      company: {
        name: "TechCorp",
        departments: [
          {
            name: "IT",
            employees: [
              { id: 1, name: "Alice", salary: 50000 },
              { id: 2, name: "Bob", salary: 60000 },
            ],
          },
          {
            name: "HR",
            employees: [{ id: 3, name: "Charlie", salary: 55000 }],
          },
        ],
      },
    });

    const totalSalary = computed(() =>
      testRef.value.company.departments.reduce(
        (sum, dept) => sum + dept.employees.reduce((deptSum, emp) => deptSum + emp.salary, 0),
        0,
      ),
    );

    expect(totalSalary.value).toBe(165000);

    testRef.value.company.departments[0].employees[1].salary = 65000;
    await nextTick();
    expect(totalSalary.value).toBe(170000);

    testRef.value.company.departments[1].employees.push({ id: 4, name: "David", salary: 58000 });
    await nextTick();
    expect(totalSalary.value).toBe(228000);
  });

  it("triggers deep watcher for nested changes", async () => {
    const { testRef } = lref("test", {
      settings: {
        theme: {
          color: "blue",
          fontSize: 14,
        },
        notifications: {
          email: true,
          push: false,
        },
      },
    });

    const mockFn = vi.fn();

    watch(() => testRef.value, mockFn, { deep: true });

    testRef.value.settings.theme.color = "red";
    await nextTick();
    expect(mockFn).toHaveBeenCalledTimes(1);

    testRef.value.settings.notifications.push = true;
    await nextTick();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("preserves reactivity when using Vue's reactive", async () => {
    const initialState = reactive({
      count: 0,
      nested: {
        value: "initial",
      },
    });

    const { testRef } = lref("test", initialState);

    const doubleCount = computed(() => testRef.value.count * 2);
    const upperValue = computed(() => testRef.value.nested.value.toUpperCase());

    expect(doubleCount.value).toBe(0);
    expect(upperValue.value).toBe("INITIAL");

    testRef.value.count++;
    await nextTick();
    expect(doubleCount.value).toBe(2);

    testRef.value.nested.value = "updated";
    await nextTick();
    expect(upperValue.value).toBe("UPDATED");
  });
  //=handle wrong data
  it("handles undefined value", () => {
    const { testRef } = lref("test", undefined);

    expect(isRef(testRef)).toBe(true);
    expect(testRef.value).toBeUndefined();
  });

  it("handles null value", () => {
    const { testRef } = lref("test", null);

    expect(isRef(testRef)).toBe(true);
    expect(testRef.value).toBeNull();
  });

  it("handles function as value", () => {
    const testFunction = () => "Hello, World!";
    const { testRef } = lref("test", testFunction);

    expect(isRef(testRef)).toBe(true);
    expect(typeof testRef.value).toBe("function");
    expect(testRef.value()).toBe("Hello, World!");
  });

  it("handles circular reference", () => {
    const obj: any = { a: 1 };
    obj.self = obj;

    const result = lref("test", obj);

    // Check that result is a ref
    expect(isRef(result.testRef)).toBe(true);

    // Check the structure of result.testRef.value
    expect(result.testRef.value).toEqual({
      a: 1,
      self: expect.any(Object),
    });

    // Check that the circular reference is maintained
    expect(result.testRef.value.self).toBe(result.testRef.value);

    // Check that the non-circular property is correct
    expect(result.testRef.value.a).toBe(1);

    // Check that the original object is not the same as the result
    expect(result.testRef.value).not.toBe(obj);

    // Optional: Check that the original object is unchanged
    expect(obj.self).toBe(obj);
    expect(obj.a).toBe(1);
  });

  test("lref with NaN value", () => {
    const { testRef, testInitial, testUnConnected } = lref("test", Number.NaN);

    expect(Number.isNaN(testRef.value)).toBeTruthy();
    expect(Number.isNaN(testInitial())).toBeTruthy();
    expect(Number.isNaN(testUnConnected.value)).toBeTruthy();
  });

  it("handles NaN value", () => {
    const { testRef } = lref("test", Number.NaN);

    expect(isRef(testRef)).toBe(true);
    expect(testRef.value).toBeNaN();
  });

  it("handles Infinity value", () => {
    const { testRef } = lref("test", Number.POSITIVE_INFINITY);

    expect(isRef(testRef)).toBe(true);
    expect(testRef.value).toBe(Number.POSITIVE_INFINITY);
  });

  it("handles -Infinity value", () => {
    const { testRef } = lref("test", Number.NEGATIVE_INFINITY);

    expect(isRef(testRef)).toBe(true);
    expect(testRef.value).toBe(Number.NEGATIVE_INFINITY);
  });

  it("handles object with symbol properties", () => {
    const symbolKey = Symbol("testSymbol");
    const objWithSymbol = {
      [symbolKey]: "Symbol Value",
    };

    const { testRef } = lref("test", objWithSymbol);

    expect(isRef(testRef)).toBe(true);
    expect(testRef.value[symbolKey]).toBe("Symbol Value");
  });

  it("handles object with non-enumerable properties", () => {
    const objWithNonEnumerable = {};
    Object.defineProperty(objWithNonEnumerable, "hidden", {
      value: "Non-enumerable Value",
      enumerable: false,
    });

    const { testRef } = lref("test", objWithNonEnumerable);

    expect(isRef(testRef)).toBe(true);
    expect(testRef.value.hidden).toBe("Non-enumerable Value");
    expect(Object.keys(testRef.value)).toHaveLength(0);
  });

  it("handles Date object", () => {
    const date = new Date("2023-01-01");
    const { testRef } = lref("test", date);

    expect(isRef(testRef)).toBe(true);
    expect(testRef.value instanceof Date).toBe(true);
    expect(testRef.value.getTime()).toBe(date.getTime());
  });

  it("handles Error object", () => {
    const error = new Error("Test Error");
    const { testRef } = lref("test", error);

    expect(isRef(testRef)).toBe(true);
    expect(testRef.value instanceof Error).toBe(true);
    expect(testRef.value.message).toBe("Test Error");
  });
});
