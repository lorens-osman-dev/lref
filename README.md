<p align="center">
  <img src="https://github.com/lorens-osman-dev/lref/blob/main/assets/lref.svg" alt="lref function"/>
</p>

## Lref() Vue3 ref() on steroids

`lref()` is a utility function for Vue 3 that extends the functionality of Vue's reactive reference `ref()`. It provides a set of convenient methods and properties for managing state, tracking history, and handling resets.

## Installation

```bash
npm install lref
```

## Usage

```ts
import { lref } from "lref";

const { countRef, countComputed, countReset, countInitial } = lref("count", 0);

// Access the reactive reference
console.log(countRef.value); // 0

// Use the computed property
console.log(countComputed.value); // 0

// Reset to initial value
countReset();

// Get the initial value
console.log(countInitial()); // 0
```

```ts
const { userRef, userUnConnected, userLastValueBeforeLastReset, userHistory } = lref("user", { name: "Lorens", age: 30 });

// Modify the reactive reference
userRef.value.name = "Ahmed";

// Access the unconnected copy
console.log(userUnConnected.value); // { name: 'Lorens', age: 30 }

// Get the last value before reset
console.log(userLastValueBeforeLastReset()); // null (or previous value if reset was called)

// Use history features
userHistory.undo();
userHistory.redo();
console.log(userHistory.data.value); // Array of historical states
```

## API

The lref function returns an object with the following properties and methods:

- ${name}Ref: The reactive reference (Ref<T>)
- ${name}Computed: A computed property based on the reference (ComputedRef<T>)
- ${name}Initial: Function that returns the initial value (() => T)
- ${name}Reset: Function to reset the value to its initial state (() => void)
- ${name}UnConnected: An unconnected copy of the reference (Ref<UnwrapRef<T>>)
- ${name}LastValueBeforeLastReset: Function that returns the last value before reset (() => T | null)
- ${name}History: Object containing history-related methods and data

  - data: Ref to an array of historical states
  - undo: Function to undo the last change
  - redo: Function to redo the last undone change

## Use Cases

- Form Handling: Manage form state with easy reset capability.
- Undo/Redo Functionality: Implement undo/redo in applications like text editors or drawing tools.
- State Management: Keep track of state changes and provide rollback options.
- Data Comparison: Compare current state with initial or previous states.
- Debugging: Track the history of state changes for debugging purposes.

---

If you like this extension, feel free to support the development by buying a coffee:

## <a href="https://www.buymeacoffee.com/lorens" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
