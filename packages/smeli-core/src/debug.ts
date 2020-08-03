import { Engine } from "./engine";

export interface ResetCommand {
  type: "smeli:reset";

  code: string;
}

export interface PatchCommand {
  type: "smeli:patch";

  offset: number;
  code: string;
}

export interface StepCommand {
  type: "smeli:step";

  targetOffset: number;
}

export class DebugInterface {
  private readonly engine: Engine;
  private code: string;

  constructor(engine: Engine, code: string) {
    this.engine = engine;
    this.code = code;
  }

  reset(command: ResetCommand) {
    // remove all existing code
    this.engine.pop(this.engine.statements.length);

    // reload new code
    const messages = this.engine.push(command.code);
    this.code = command.code;
  }

  patch(command: PatchCommand) {
    const statementIndex = this.findStatementFromOffset(command.offset);

    let reparseOffset = 0;
    let reparseLine = 0;
    let invalidatedStatements = this.engine.statements.length;
    if (statementIndex !== -1) {
      reparseOffset = this.engine.statements[statementIndex].startOffset;
      reparseLine = this.engine.statements[statementIndex].line;
      invalidatedStatements = this.engine.statements.length - statementIndex;
    }

    // console.log("diff point: " + this.code.substr(command.offset, 100));
    // console.log("reparse point: " + this.code.substr(reparseOffset, 100));
    // console.log("patch: " + command.code.substr(0, 100));

    // remove modified statements
    this.engine.pop(invalidatedStatements);

    // patch the code
    this.code = this.code.substr(0, command.offset) + command.code;

    // parse new statements
    this.engine.push(this.code, reparseOffset, reparseLine);

    // if new statements were added, reexecute the first one immediately
    // (this gives a better UX when live editing a single statement,
    // as it removes the flickering due to the step command possibly
    // arriving after an engine update, showing the previous statement
    // for one frame)
    if (this.engine.statements.length >= statementIndex) {
      this.engine.step(1);
    }
  }

  step(command: StepCommand) {
    const statementIndex = this.findStatementFromOffset(command.targetOffset);
    this.engine.step(statementIndex + 1 - this.engine.nextStatement);
  }

  private findStatementFromOffset(offset: number): number {
    const statements = this.engine.statements;

    let index = 0;
    while (
      index < statements.length &&
      offset >= statements[index].startOffset
    ) {
      index++;
    }

    // we always find the statement after the one containing the given offset
    return index - 1;
  }
}
