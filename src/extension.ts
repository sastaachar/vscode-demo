// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import AttackPanel from "./panels/AttackPanel";

// this method is called when your extension is activated

// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log("Starting my panel.");

  AttackPanel.createOrShow(context.extensionUri);

  context.subscriptions.push(
    vscode.commands.registerCommand("attackDemo.refreshWindow", () => {
      AttackPanel.kill();
      AttackPanel.createOrShow(context.extensionUri);
    })
  );
}

// this method is called when extension is deactivated
export function deactivate() {}
