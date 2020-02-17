import Engine from "./engine";
import Scope from "./scope";

export default interface Plugin {
  bind(engine: Engine, scope: Scope): void;
  unbind(engine: Engine, scope: Scope): void;
}
