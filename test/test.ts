import { lref } from "../src/index";
// const { testRef, testComputed, testSetComputed } = lref("test", obj);
// const obj = { name: "lorens", age: 32 };

// console.log(testRef.value);
// testRef.value.age = 10;
// testSetComputed((value) => ({ name: value.name, age: value.age * 20 }));
// testRef.value.age = 30;

// console.log("testComputed :", testComputed.value);
const obj = { name: "lorens", age: 32 };
const { testRef, testComputed, testSetComputed } = lref("test", obj);

testSetComputed((value) => ({ ...value, age: value.age * 2 }));
console.log(testComputed.value);

testSetComputed((value) => ({ ...value, age: value.age + 10 }));

console.log(testComputed.value);
