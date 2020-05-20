import * as vscode from "vscode";

class Preview extends vscode.Disposable {
  private document: vscode.TextDocument;
  private changeEvent: vscode.Disposable;
  private panel: vscode.WebviewPanel;

  static load(document: vscode.TextDocument, callOnDispose: Function) {
    return new Preview(document, callOnDispose);
  }

  constructor(document: vscode.TextDocument, callOnDispose: Function) {
    super(callOnDispose);

    this.document = document;

    const title = "Smeli: " + document.fileName;
    this.panel = vscode.window.createWebviewPanel(
      "smeli",
      title,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
      }
    );

    this.panel.onDidDispose(() => this.dispose());

    // initialize with full document
    let code = document.getText();

    const webview = this.panel.webview;
    webview.html = "<pre>" + code + "</pre>";

    this.changeEvent = vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document === this.document) {
        event.contentChanges.forEach((change) => {
          // apply only the change delta
          code =
            code.substring(0, change.rangeOffset) +
            change.text +
            code.substring(change.rangeOffset + change.rangeLength);

          webview.html = "<pre>" + code + "</pre>";
        });
      }
    });
  }

  dispose() {
    this.changeEvent.dispose();
    this.panel.dispose();

    super.dispose();
  }
}

export function activate(context: vscode.ExtensionContext) {
  const openPreview = vscode.commands.registerCommand(
    "smeli.openPreview",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        Preview.load(document, () => {});
      }
    }
  );

  context.subscriptions.push(openPreview);
}
