import * as child_process from "child_process";
import * as path from "path";
import * as util from "util";
import * as vscode from "vscode";

import { compile, CompileResult } from "@smeli/compiler";

class Preview extends vscode.Disposable {
  private workspaceFolder: vscode.WorkspaceFolder;

  private panel: vscode.WebviewPanel;

  private saveEvent: vscode.Disposable;
  private changeEvent: vscode.Disposable;
  private cursorEvent: vscode.Disposable;

  private isTaskRunning = false;

  private needsBuild = false;
  private needsPatch = false;
  private needsStep = false;

  private buildSucceeded = false;
  private patchSucceeded = false;

  private lastCompileResult: CompileResult | null = null;

  private targetFilename = "";
  private targetOffset = 0;

  static create(
    workspaceFolder: vscode.WorkspaceFolder,
    callOnDispose: Function
  ) {
    return new Preview(workspaceFolder, callOnDispose);
  }

  static restore(
    workspaceFolder: vscode.WorkspaceFolder,
    webviewPanel: vscode.WebviewPanel,
    callOnDispose: Function
  ) {
    return new Preview(workspaceFolder, callOnDispose, webviewPanel);
  }

  constructor(
    workspaceFolder: vscode.WorkspaceFolder,
    callOnDispose: Function,
    webviewPanel?: vscode.WebviewPanel
  ) {
    super(callOnDispose);

    this.workspaceFolder = workspaceFolder;

    const title = "Smeli: " + workspaceFolder.name;
    this.panel =
      webviewPanel ||
      vscode.window.createWebviewPanel(
        "smeli",
        title,
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(workspaceFolder.uri.fsPath, "dist")),
          ],
        }
      );

    this.panel.onDidDispose(() => this.dispose());

    this.saveEvent = vscode.workspace.onDidSaveTextDocument((document) => {
      if (document.languageId === "smeli") {
        this.requestBuild();

        // reposition cursor position after reloading everything
        this.needsStep = true;
      }
    });

    this.changeEvent = vscode.workspace.onDidChangeTextDocument((event) => {
      const document = event.document;
      if (document.languageId === "smeli") {
        this.requestPatch();

        // reposition cursor position after patching
        this.needsStep = true;
      }
      /*if (event.document === this.document) {
        event.contentChanges.forEach((change) => {
          const message = {
            type: "smeli:edit",
            rangeOffset: change.rangeOffset,
            rangeLength: change.rangeLength,
            text: change.text,
          };
          webview.postMessage(message);
        });
      }*/
    });

    this.cursorEvent = vscode.window.onDidChangeTextEditorSelection((event) => {
      const textEditor = event.textEditor;
      const document = textEditor.document;
      if (document.languageId === "smeli") {
        this.requestStep(
          document.fileName,
          document.offsetAt(textEditor.selection.active)
        );
      }
    });

    // kick off the build process
    this.requestBuild();

    // step where the cursor is, if the current editor is a smeli file
    const textEditor = vscode.window.activeTextEditor;
    if (textEditor) {
      const document = textEditor.document;
      if (document.languageId === "smeli") {
        const offset = document.offsetAt(textEditor.selection.active);
        this.requestStep(document.fileName, offset);
      }
    }
  }

  dispose() {
    this.cursorEvent.dispose();
    this.changeEvent.dispose();
    this.saveEvent.dispose();

    this.panel.dispose();

    super.dispose();
  }

  executeNextTask() {
    if (this.isTaskRunning) {
      return;
    }

    if (this.needsBuild) {
      this.executeBuild();
    } else if (this.buildSucceeded) {
      if (this.needsPatch) {
        this.executePatch();
      } else if (this.needsStep && this.patchSucceeded) {
        this.executeStep();
      }
    }
  }

  requestBuild() {
    this.needsBuild = true;
    this.executeNextTask();
  }

  async executeBuild() {
    this.isTaskRunning = true;
    this.needsBuild = false;
    this.buildSucceeded = false;

    const webview = this.panel.webview;
    webview.html = "<p>Building " + this.workspaceFolder.name + "...</p>";

    const exec = util.promisify(child_process.exec);
    const childPromise = exec("yarn smeli", {
      cwd: this.workspaceFolder.uri.fsPath,
    });
    childPromise
      .then(({ stdout, stderr }) => {
        /*if (childPromise.child.exitCode !== 0) {
          const message = `
            <p>Build failed</p>
            <h3>stdout</h3>
            <pre>${stdout}</pre>
            <h3>stderr</h3>
            <pre>${stderr}</pre>
          `;
          throw new Error(message);
        }*/

        const indexFile = path.join(
          this.workspaceFolder.uri.fsPath,
          "dist",
          "index.html"
        );
        return vscode.workspace.fs.readFile(vscode.Uri.file(indexFile));
      })
      .then((buffer) => {
        const htmlContent = Buffer.from(buffer).toString("utf8");
        webview.html = htmlContent;

        this.buildSucceeded = true;
        this.requestPatch();
      })
      .catch((error) => {
        webview.html = `
          <h2>Error</h2>
          <p>${error.message.replace("\n", "<br />")}</p>
        `;
      })
      .finally(() => {
        this.isTaskRunning = false;
        this.executeNextTask();
      });
  }

  requestPatch() {
    this.needsPatch = true;
    this.executeNextTask();
  }

  async executePatch() {
    this.isTaskRunning = true;
    this.needsPatch = false;
    this.patchSucceeded = false;

    const webview = this.panel.webview;

    compile({
      entry: "index.smeli",
      resolveChunk: async (filename: string) => {
        const uris = await vscode.workspace.findFiles(filename);
        if (uris.length === 0) {
          throw new Error("File not found: " + filename);
        }

        const document = await vscode.workspace.openTextDocument(uris[0]);
        const code = document.getText();
        return code;
      },
    })
      .then((result: CompileResult) => {
        if (!this.lastCompileResult) {
          const message = {
            type: "smeli:reset",
            code: result.compiledCode,
          };
          webview.postMessage(message);
        } else {
          // plugin changes require a rebuild
          if (
            result.plugins.length !== this.lastCompileResult.plugins.length ||
            !this.lastCompileResult.plugins.every(
              (plugin: string, index: number) =>
                plugin === result.plugins[index]
            )
          ) {
            throw new Error(
              "Please save the file to update the loaded plugins."
            );
          }

          // simple diff to keep current program state in memory
          const previousCode: string = this.lastCompileResult.compiledCode;
          const newCode: string = result.compiledCode;
          const minLength = Math.min(previousCode.length, newCode.length);
          let firstDifference = 0;
          for (let i = 0; i < minLength; i++) {
            if (previousCode[i] !== newCode[i]) {
              firstDifference = i;
              break;
            }
          }

          const previousFragment = previousCode.substr(firstDifference);
          const newFragment = newCode.substr(firstDifference);
          if (previousFragment !== newFragment) {
            const message = {
              type: "smeli:patch",
              offset: firstDifference,
              code: newFragment,
            };
            webview.postMessage(message);
          }
        }

        this.patchSucceeded = true;
        this.lastCompileResult = result;
      })
      .catch((error: Error) => {
        webview.html = `
          <h2>Error</h2>
          <p>${error.message}</p>
        `;
      })
      .finally(() => {
        this.isTaskRunning = false;
        this.executeNextTask();
      });
  }

  requestStep(filename: string, offset: number) {
    this.targetFilename = filename;
    this.targetOffset = offset;
    this.needsStep = true;

    this.executeNextTask();
  }

  executeStep() {
    this.needsStep = false;

    // use source map to find the right output position

    const message = {
      type: "smeli:step",
      targetOffset: this.targetOffset,
    };
    this.panel.webview.postMessage(message);
  }
}

class PreviewSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    if (vscode.workspace.workspaceFolders) {
      const workspaceFolder = vscode.workspace.workspaceFolders[0];
      Preview.restore(workspaceFolder, webviewPanel, () => {});
    } else {
      webviewPanel.dispose();
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  const openPreview = vscode.commands.registerCommand(
    "smeli.openPreview",
    () => {
      // will be updated live later with the help of onDidChangeWorkspaceFolders events
      if (vscode.workspace.workspaceFolders) {
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        Preview.create(workspaceFolder, () => {});
      }
    }
  );
  context.subscriptions.push(openPreview);

  const panelSerializer = vscode.window.registerWebviewPanelSerializer(
    "smeli",
    new PreviewSerializer()
  );
  context.subscriptions.push(panelSerializer);
}
