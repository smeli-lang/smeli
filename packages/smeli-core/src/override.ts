import { Binding, Evaluator, Scope } from "./scope";

type ActivationCallback = (activated: boolean) => void;

export class ScopeOverride {
  scope: Scope;
  name: string;
  activationCallback?: ActivationCallback;

  binding: Binding | null = null;
  enabled: boolean = false;

  constructor(
    scope: Scope,
    name: string,
    activationCallback?: ActivationCallback
  ) {
    this.scope = scope;
    this.name = name;
    this.activationCallback = activationCallback;
  }

  bind(evaluator: Evaluator) {
    this.disable();

    this.binding = {
      name: this.name,
      evaluate: evaluator,
    };

    this.enable();
  }

  unbind() {
    this.disable();
    this.binding = null;
  }

  enable() {
    if (!this.binding || this.enabled) {
      return;
    }

    this.scope.push(this.binding);
    this.enabled = true;

    if (this.activationCallback) {
      this.activationCallback(true);
    }
  }

  disable() {
    if (!this.binding || !this.enabled) {
      return;
    }

    this.scope.pop(this.binding);
    this.enabled = false;

    if (this.activationCallback) {
      this.activationCallback(false);
    }
  }

  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }
}
