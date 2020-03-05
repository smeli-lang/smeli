import { Expression, Literal } from "./ast";
import { TypedValue, TypeDefinition, NumberValue, TypeTraits } from "./types";

export type Binding = {
  name: string;
  expression: Expression;
  previousBinding: Binding | null;
};

export type ScopeDefinition = {
  [name: string]: BindingDefinition;
};

export type LiteralType = number; // | string | Function;

export type BindingDefinition = LiteralType | TypedValue | Expression;

export class Scope implements TypedValue {
  parent: Scope | null;
  bindings: Map<string, Binding>;

  constructor(
    parent: Scope | null = null,
    definition: ScopeDefinition | null = null
  ) {
    this.parent = parent;
    this.bindings = new Map();

    if (definition !== null) {
      for (const name in definition) {
        const bindingDefinition = definition[name];
        const expression = this.makeExpression(bindingDefinition);
        this.bind(name, expression);
      }
    }
  }

  bind(name: string, definition: BindingDefinition): Binding {
    const expression = this.makeExpression(definition);
    const previousBinding = this.bindings.get(name) || null;
    const binding = {
      name,
      expression,
      previousBinding
    };

    this.bindings.set(name, binding);

    return binding;
  }

  unbind(binding: Binding) {
    const previousBinding = binding.previousBinding;

    if (previousBinding) {
      this.bindings.set(binding.name, previousBinding);
    } else {
      this.bindings.delete(binding.name);
    }
  }

  lookup(name: string): Binding | null {
    const localBinding = this.bindings.get(name);
    if (localBinding) {
      return localBinding;
    }

    return this.parent?.lookup(name) || null;
  }

  private makeExpression(definition: BindingDefinition): Expression {
    const jsType = typeof definition;
    switch (jsType) {
      case "number":
        return new Literal(new NumberValue(definition as number));
      // case "string":
      //   return new Literal(new StringValue(definition as string));
      // case "function":
      //   return new Literal(new FunctionValue(definition as function));
      default:
        const obj = definition as object;
        if ("type" in obj) {
          return new Literal(obj as TypedValue);
        } else {
          return definition as Expression;
        }
    }
  }

  type() {
    return ScopeType;
  }
}

export const ScopeType: TypeTraits = {
  __name__: () => "scope",

  type: () => TypeDefinition
};
