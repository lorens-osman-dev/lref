import { describe, test, expect, vi } from "vitest";
import { lref, Refer } from "../src/index";

describe("lref deep object reactivity", () => {
  test("nested object property changes are reactive", () => {
    const { testRef, testComputed } = lref("test", {
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

    expect(testComputed.value.user.profile.name).toBe("Alice");

    testRef.value.user.profile.name = "Bob";
    expect(testComputed.value.user.profile.name).toBe("Bob");

    testRef.value.user.settings.theme = "light";
    expect(testComputed.value.user.settings.theme).toBe("light");
  });

  test("adding new properties to nested objects is reactive", () => {
    const { testRef, testComputed } = lref("test", {
      user: {
        profile: {},
      },
    });

    // @ts-ignore - TypeScript will complain, but we're testing runtime behavior
    testRef.value.user.profile.email = "alice@example.com";
    // @ts-ignore
    expect(testComputed.value.user.profile.email).toBe("alice@example.com");
  });

  test("array modifications in nested objects are reactive", () => {
    const { testRef, testComputed } = lref("test", {
      user: {
        hobbies: ["reading", "cycling"],
      },
    });

    testRef.value.user.hobbies.push("swimming");
    expect(testComputed.value.user.hobbies).toEqual(["reading", "cycling", "swimming"]);

    testRef.value.user.hobbies[0] = "writing";
    expect(testComputed.value.user.hobbies).toEqual(["writing", "cycling", "swimming"]);
  });

  test("replacing entire nested objects is reactive", () => {
    const { testRef, testComputed } = lref("test", {
      user: {
        profile: {
          name: "Alice",
          age: 30,
        },
      },
    });

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
    const { testRef, testComputed } = lref("test", {
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

    expect(testComputed.value.level1.level2.level3.level4.value).toBe("deep");

    testRef.value.level1.level2.level3.level4.value = "very deep";
    expect(testComputed.value.level1.level2.level3.level4.value).toBe("very deep");
  });

  test("reactivity with mix of arrays and objects", () => {
    const { testRef, testComputed } = lref("test", {
      users: [
        { name: "Alice", scores: [85, 90, 95] },
        { name: "Bob", scores: [80, 85, 90] },
      ],
    });

    testRef.value.users[0].scores[1] = 92;
    expect(testComputed.value.users[0].scores).toEqual([85, 92, 95]);

    testRef.value.users.push({ name: "Charlie", scores: [90, 95, 100] });
    expect(testComputed.value.users.length).toBe(3);
    expect(testComputed.value.users[2].name).toBe("Charlie");
  });

  test("reactivity maintained after reset", () => {
    const { testRef, testComputed, testReset } = lref("test", {
      user: {
        profile: {
          name: "Alice",
          age: 30,
        },
      },
    });

    testRef.value.user.profile.name = "Bob";
    expect(testComputed.value.user.profile.name).toBe("Bob");

    testReset();
    expect(testComputed.value.user.profile.name).toBe("Alice");

    testRef.value.user.profile.age = 31;
    expect(testComputed.value.user.profile.age).toBe(31);
  });
});
