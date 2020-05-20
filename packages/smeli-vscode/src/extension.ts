import * as child_process from "child_process";
import * as path from "path";
import * as util from "util";
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

    const folder = path.dirname(document.uri.fsPath);

    const title = "Smeli: " + document.fileName;
    this.panel = vscode.window.createWebviewPanel(
      "smeli",
      title,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(folder, "dist"))],
      }
    );

    this.panel.onDidDispose(() => this.dispose());

    // initialize with full document
    //let code = document.getText();

    const webview = this.panel.webview;
    webview.html = "<p>Loading " + document.uri.fsPath + "</p>";

    let isCompiling = false;
    let isDirty = false;

    function compile() {
      if (isCompiling) {
        isDirty = true;
        return;
      }

      isCompiling = true;
      isDirty = false;

      const exec = util.promisify(child_process.exec);
      exec("yarn smeli", { cwd: folder })
        .then(({ stdout, stderr }) => {
          /*webview.html = `
            <h1>Compile result for ${document.uri.fsPath}</h1>
            <h2>Output</h2>
            <p>${stdout}</p>
            <h2>Errors</h2>
            <p>${stderr}</p>
            <p>${error}</p>
          `;*/

          const indexFile = path.join(folder, "dist", "index.html");
          return vscode.workspace.fs.readFile(vscode.Uri.file(indexFile));
        })
        .then((buffer) => {
          const htmlContent = Buffer.from(buffer).toString("utf8");
          webview.html = htmlContent;

          isCompiling = false;
          if (isDirty) {
            return compile();
          }
        })
        .catch((error) => {
          webview.html = `
            <h2>Error</h2>
            <p>${error.message}</p>
          `;

          isCompiling = false;
          if (isDirty) {
            return compile();
          }
        });
    }

    this.changeEvent = vscode.workspace.onDidSaveTextDocument((document) => {
      if (document.uri.fsPath === this.document.uri.fsPath) {
        compile();
      }
    });

    compile();

    /*this.changeEvent = vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document === this.document) {
        event.contentChanges.forEach((change) => {
          // apply only the change delta
          code =
            code.substring(0, change.rangeOffset) +
            change.text +
            code.substring(change.rangeOffset + change.rangeLength);

          //webview.html = "<pre>" + code + "</pre>";
        });
      }
    });*/
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
