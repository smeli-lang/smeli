import { jss } from "./jss";

import { TypedValue } from "@smeli/core";

export type EventListenerMap = { [key: string]: EventListener };

export class DomNode extends TypedValue {
  static typeName = "dom_node";

  node: HTMLElement;
  eventListeners: EventListenerMap;
  observers: any[]; // will be updated when the official TS DOM declarations include observers

  constructor(
    node: HTMLElement,
    eventListeners: EventListenerMap = {},
    observers: any[] = []
  ) {
    super();

    this.node = node;
    this.eventListeners = eventListeners;
    this.observers = observers;

    for (let eventName of Object.keys(this.eventListeners)) {
      const listener = this.eventListeners[eventName];
      this.node.addEventListener(eventName, listener);
    }

    for (const observer of this.observers) {
      observer.observe(this.node);
    }
  }

  dispose() {
    for (let eventName of Object.keys(this.eventListeners)) {
      const listener = this.eventListeners[eventName];
      this.node.removeEventListener(eventName, listener);
    }

    for (const observer of this.observers) {
      observer.unobserve(this.node);
    }
  }

  __str__() {
    return `<${this.node.tagName.toLowerCase()} />`;
  }
}

export class DomStyles extends TypedValue {
  static typeName = "dom_styles";

  sheet: any;

  constructor(styles: any) {
    super();
    this.sheet = jss.createStyleSheet(styles).attach();
  }

  dispose() {
    jss.removeStyleSheet(this.sheet);
  }
}
