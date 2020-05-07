import { jss } from "./jss";

import { TypedValue, TypeTraits } from "@smeli/core";

export type EventListenerMap = { [key: string]: EventListener };

export class DomNode implements TypedValue {
  node: HTMLElement;
  eventListeners: EventListenerMap;

  constructor(node: HTMLElement, eventListeners: EventListenerMap = {}) {
    this.node = node;
    this.eventListeners = eventListeners;

    for (let eventName of Object.keys(this.eventListeners)) {
      const listener = this.eventListeners[eventName];
      this.node.addEventListener(eventName, listener);
    }
  }

  dispose() {
    for (let eventName of Object.keys(this.eventListeners)) {
      const listener = this.eventListeners[eventName];
      this.node.removeEventListener(eventName, listener);
    }
  }

  type() {
    return DomNodeType;
  }
}

export const DomNodeType: TypeTraits = {
  __name__: () => "dom_node",

  __str__: (self: DomNode) => `<${self.node.tagName.toLowerCase()} />`,
};

export class DomStyles implements TypedValue {
  sheet: any;

  constructor(styles: any) {
    this.sheet = jss.createStyleSheet(styles).attach();
  }

  dispose() {
    jss.removeStyleSheet(this.sheet);
  }

  type() {
    return DomStylesType;
  }
}

export const DomStylesType: TypeTraits = {
  __name__: () => "dom_styles",
};
