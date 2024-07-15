import { describe, it, expect } from "vitest";
import { lref } from "../src/index"; // Adjust the import path as necessary

describe("lref setComputed functionality", () => {
  it("should apply the computed function correctly", () => {
    const obj = { name: "lorens", age: 32 };
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => ({ ...value, age: value.age * 2 }));

    expect(testComputed.value).toEqual({ name: "lorens", age: 64 });
  });

  it("should update computed value when original ref changes", () => {
    const obj = { name: "lorens", age: 32 };
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => ({ ...value, age: value.age * 2 }));

    testRef.value.age = 20;
    expect(testComputed.value).toEqual({ name: "lorens", age: 40 });
  });

  it("should not allow changing the computed function", () => {
    const obj = { name: "lorens", age: 32 };
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => ({ ...value, age: value.age * 2 }));
    expect(testComputed.value).toEqual({ name: "lorens", age: 64 });

    testSetComputed((value) => ({ ...value, age: value.age + 10 }));
    expect(testComputed.value).toEqual({ name: "lorens", age: 64 });
  });

  it("should handle complex computations", () => {
    const obj = { name: "lorens", age: 32, scores: [10, 20, 30] };
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => ({
      ...value,
      age: value.age * 2,
      averageScore: value.scores.reduce((sum, score) => sum + score, 0) / value.scores.length,
    }));

    expect(testComputed.value).toEqual({
      name: "lorens",
      age: 64,
      scores: [10, 20, 30],
      averageScore: 20,
    });
  });

  it("should not affect the original ref when computing", () => {
    const obj = { name: "lorens", age: 32 };
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => ({ ...value, age: value.age * 2 }));

    expect(testRef.value).toEqual({ name: "lorens", age: 32 });
    expect(testComputed.value).toEqual({ name: "lorens", age: 64 });
  });

  it("should handle nested property changes", () => {
    const obj = { name: "lorens", details: { age: 32, city: "New York" } };
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => ({
      ...value,
      details: { ...value.details, age: value.details.age + 5 },
    }));

    expect(testComputed.value).toEqual({
      name: "lorens",
      details: { age: 37, city: "New York" },
    });

    testRef.value.details.age = 40;
    expect(testComputed.value).toEqual({
      name: "lorens",
      details: { age: 45, city: "New York" },
    });
  });
  //2 more tests
  it("should handle computed values based on multiple properties", () => {
    const obj = { firstName: "John", lastName: "Doe", age: 30 };
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => ({
      ...value,
      fullName: `${value.firstName} ${value.lastName}`,
      isAdult: value.age >= 18,
    }));

    expect(testComputed.value).toEqual({
      firstName: "John",
      lastName: "Doe",
      age: 30,
      fullName: "John Doe",
      isAdult: true,
    });

    testRef.value.firstName = "Jane";
    expect(testComputed.value.fullName).toBe("Jane Doe");
  });

  it("should handle array operations in computed values", () => {
    const obj = { numbers: [1, 2, 3, 4, 5] };
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => ({
      ...value,
      sum: value.numbers.reduce((acc, num) => acc + num, 0),
      evenNumbers: value.numbers.filter((num) => num % 2 === 0),
    }));

    expect(testComputed.value).toEqual({
      numbers: [1, 2, 3, 4, 5],
      sum: 15,
      evenNumbers: [2, 4],
    });

    testRef.value.numbers.push(6);
    expect(testComputed.value.sum).toBe(21);
    expect(testComputed.value.evenNumbers).toEqual([2, 4, 6]);
  });

  it("should handle date computations", () => {
    const obj = { birthDate: new Date("1990-01-01") };
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => ({
      ...value,
      age: new Date().getFullYear() - value.birthDate.getFullYear(),
    }));

    const expectedAge = new Date().getFullYear() - 1990;
    expect(testComputed.value.age).toBe(expectedAge);

    testRef.value.birthDate = new Date("2000-01-01");
    expect(testComputed.value.age).toBe(expectedAge - 10);
  });

  it("should handle conditional computations", () => {
    const obj = { value: 10, isEven: true };
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => ({
      ...value,
      description: value.isEven ? `${value.value} is even` : `${value.value} is odd`,
      category: value.value < 0 ? "negative" : value.value === 0 ? "zero" : "positive",
    }));

    expect(testComputed.value).toEqual({
      value: 10,
      isEven: true,
      description: "10 is even",
      category: "positive",
    });

    testRef.value.isEven = false;
    expect(testComputed.value.description).toBe("10 is odd");

    testRef.value.value = 0;
    expect(testComputed.value.category).toBe("zero");
  });

  it("should handle computed values with external dependencies", () => {
    const obj = { price: 100, quantity: 2 };
    const taxRate = 0.5;
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => ({
      ...value,
      subtotal: value.price * value.quantity,
      total: value.price * value.quantity * (1 + taxRate),
    }));

    expect(testComputed.value).toEqual({
      price: 100,
      quantity: 2,
      subtotal: 200,
      total: 300,
    });

    testRef.value.quantity = 3;
    expect(testComputed.value.subtotal).toBe(300);
    expect(testComputed.value.total).toBe(450);
  });

  it("should handle computed values with method calls", () => {
    const obj = {
      text: "Hello, World!",
      reverse: function () {
        return this.text.split("").reverse().join("");
      },
    };
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => ({
      ...value,
      reversedText: value.reverse(),
    }));

    expect(testComputed.value.reversedText).toBe("!dlroW ,olleH");

    testRef.value.text = "OpenAI";
    expect(testComputed.value.reversedText).toBe("IAnepO");
  });

  it("should handle error cases gracefully", () => {
    const obj = { value: 10 };
    const { testRef, testComputed, testSetComputed } = lref("test", obj);

    testSetComputed((value) => {
      if (value.value < 0) {
        throw new Error("Negative values not allowed");
      }
      return { ...value, squared: value.value * value.value };
    });

    expect(testComputed.value).toEqual({ value: 10, squared: 100 });

    testRef.value.value = -5;
    expect(() => testComputed.value).toThrow("Negative values not allowed");
  });
});
