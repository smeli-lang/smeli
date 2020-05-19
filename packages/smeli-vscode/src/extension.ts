import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const openPreview = vscode.commands.registerCommand(
    "smeli.openPreview",
    () => {
      console.log("hello smeli!");
    }
  );

  context.subscriptions.push(openPreview);
}
