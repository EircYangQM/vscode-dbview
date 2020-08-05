// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {DbTreeDataProvider} from './provider';
import {ConnectionNode} from './model/connection-node';
import {INode} from	'./model/node';
import {TableNode} from './model/table-node';
import {SchemaNode} from "./model/schema-node";	 

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, "DB View" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const dbTreeDataProvider = new DbTreeDataProvider(context);
	context.subscriptions.push(vscode.window.registerTreeDataProvider("databases", dbTreeDataProvider));

	context.subscriptions.push(vscode.commands.registerCommand("databases.refresh", (node: INode) => {
			// AppInsightsClient.sendEvent("refresh");
			// mysqlTreeDataProvider.refresh(node);
	}));

	context.subscriptions.push(vscode.commands.registerCommand("databases.addConnection", () => {
		dbTreeDataProvider.addConnection();
	}));

	context.subscriptions.push(vscode.commands.registerCommand("databases.deleteConnection", (connectionNode: ConnectionNode) => {
			connectionNode.deleteConnection(context, dbTreeDataProvider);
	}));

	context.subscriptions.push(vscode.commands.registerCommand("databases.runQuery", () => {
			// Utility.runQuery();
	}));

	context.subscriptions.push(vscode.commands.registerCommand("databases.newQuery", (databaseOrConnectionNode: SchemaNode | ConnectionNode) => {
			// databaseOrConnectionNode.newQuery();
	}));

	context.subscriptions.push(vscode.commands.registerCommand("databases.selectTop1000", (tableNode: TableNode) => {
			tableNode.selectTop1000();
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
