import { lref, Refer } from "../src/index";
import { ref, computed } from "vue";

// Mock Vue's ref and computed functions
jest.mock("vue", () => ({
	ref: jest.fn((val) => ({ value: val })),
	computed: jest.fn((getter) => ({ value: getter() })),
}));

//: tests
describe("lref ", () => {
	test("lref creates  an object with correct properties", () => {
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
});
