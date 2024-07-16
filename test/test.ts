import { lref } from "../src/index";
const date = new Date("2023-01-01");
const { testRef, testInitial, testUnConnected } = lref("test", date);

// expect(testRef.value).toEqual(date);

console.log(testRef.value);
const c = testInitial();
console.log("c:", c);
console.log(testUnConnected.value);
// expect(testInitial()).toEqual(date);
// expect(testUnConnected.value).toEqual(date);
