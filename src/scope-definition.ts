import Scope, {Binding} from './scope';
import {ScopeType} from './types';

export type LiteralType = number | string | Function;

export type BindingDefinition = LiteralType;

export type ScopeDefinition = {
  bindings: {
    [name: string]: BindingDefinition
  }
};

// manages automatic (un)binding of many names
// at once, plus the (un)registration of watch callbacks
export default class ScopeDefinitionBinder {
  definition: ScopeDefinition;
  bindings: Binding[] = [];

  constructor(definition: ScopeDefinition) {
    this.definition = definition;
  }

  bind(scope: Scope) {
    /*this.definition.bindings.forEach((def, name) => {
      
    });*/
  }

  unbind(scope: Scope) {

  }
}
