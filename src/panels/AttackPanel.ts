import * as vscode from "vscode";

import getNonce from "../utils/nonce";

export default class AttackPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: AttackPanel | undefined;

  public static readonly viewType = "attackPanel";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (AttackPanel.currentPanel) {
      AttackPanel.currentPanel._panel.reveal(column);
      console.log("panel already avaialale");
      return;
    }

    console.log("Crating new panel", extensionUri);
    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      AttackPanel.viewType,
      "Attack Panel",
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "media"),
          vscode.Uri.joinPath(extensionUri, "out"),
        ],
      }
    );

    AttackPanel.currentPanel = new AttackPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      (e) => {
        if (this._panel.visible) {
          this._update();
          console.log("Updated");
        }
      },
      null,
      this._disposables
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "alert":
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public _update() {
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
  }

  public dispose() {
    AttackPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  public static kill() {
    AttackPanel.currentPanel?.dispose();
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(
      this._extensionUri,
      "out/AttackPanel",
      "bundle.js"
    );

    // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "reset.css"
    );
    const styleVscodePath = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "vscode.css"
    );
    const stylesPathMainPath = vscode.Uri.joinPath(
      this._extensionUri,
      "out/AttackPanel",
      "style.css"
    );

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
    const stylesVscodeUri = webview.asWebviewUri(styleVscodePath);

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesVscodeUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
				<title>Cat Coding</title>
			</head>
			<body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
