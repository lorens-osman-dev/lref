import { lref } from "../src/index";
import { computed, ref, type ComputedRef, type Ref, isRef, type UnwrapRef } from "vue";
const obj = { name: "lorens", age: 32 };
const jj = lref("test", obj);

// jj.testRef.value.age = 40;

// console.log(jj.testRef.value);

// setTimeout(() => {
//   jj.testRef.value.age = 45;
//   console.log(jj.testHistory.data.value);
// }, 1000);
// setTimeout(() => {
//   jj.testRef.value.age = 49;
//   console.log(jj.testHistory.data.value);
// }, 2000);
// setTimeout(() => {
//   jj.testRef.value.age = 45;
//   console.log(jj.testHistory.data.value);
// }, 3000);
// setTimeout(() => {
//   jj.testRef.value.age = 50;
//   console.log(jj.testRef.value);
//   jj.testHistory.undo();
//   console.log(jj.testRef.value);
// }, 4000);
