import { jss } from "./jss";

import { TypedValue } from "@smeli/core";

export type EventListenerMap = { [key: string]: EventListener };

export class DomNode extends TypedValue {
  static typeName = "dom_node";

  node: HTMLElement;
  eventListeners: EventListenerMap;

  constructor(node: HTMLElement, eventListeners: EventListenerMap = {}) {
    super();

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
