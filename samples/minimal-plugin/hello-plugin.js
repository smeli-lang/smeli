import { NumberValue } from "@smeli/core";

export const loadPlugin = () => ({
  name: "hello",
  bindings: [
    {
      name: "answer",
      evaluate: () => new NumberValue(42),
    },
  ],
});
