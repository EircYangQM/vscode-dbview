import * as path from "path";
import * as vscode from "vscode";
// import { AppInsightsClient } from "./common/appInsightsClient";
import { v4 as uuidv4 } from 'uuid';
import { Constants } from "./common/constants";
import { Global } from "./common/global";
import { IConnection } from "./model/connection";
import { ConnectionNode } from "./model/connection-node";
import { INode } from "./model/node";

export class DbTreeDataProvider implements vscode.TreeDataProvider<INode> {
  public _onDidChangeTreeData: vscode.EventEmitter<INode> = new vscode.EventEmitter<INode>();
  public readonly onDidChangeTreeData: vscode.Event<INode> = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {
  }

  public getTreeItem(element: INode): Promise<vscode.TreeItem> | vscode.TreeItem {
      return element.getTreeItem();
  }

  public getChildren(element?: INode): Thenable<INode[]> | INode[] {
      if (!element) {
          return this.getConnectionNodes();
      }

      return element.getChildren();
  }

  public async addConnection() {
    const name = await vscode.window.showInputBox({ prompt: "Connection Name", placeHolder: "name", ignoreFocusOut: true });
    if (!name) {
        return;
    }  
    const connectionString = await vscode.window.showInputBox({ prompt: "Connection String", placeHolder: "jdbc:XXX:....", ignoreFocusOut: true });
      if (!connectionString) {
          return;
      }  
    
    // AppInsightsClient.sendEvent("addConnection.start");
      // const host = await vscode.window.showInputBox({ prompt: "The hostname of the database", placeHolder: "host", ignoreFocusOut: true });
      // if (!host) {
      //     return;
      // }

      // const user = await vscode.window.showInputBox({ prompt: "The MySQL user to authenticate as", placeHolder: "user", ignoreFocusOut: true });
      // if (!user) {
      //     return;
      // }

      // const password = await vscode.window.showInputBox({ prompt: "The password of the MySQL user", placeHolder: "password", ignoreFocusOut: true, password: true });
      // if (password === undefined) {
      //     return;
      // }

      // const port = await vscode.window.showInputBox({ prompt: "The port number to connect to", placeHolder: "port", ignoreFocusOut: true, value: "3306" });
      // if (!port) {
      //     return;
      // }

      // const certPath = await vscode.window.showInputBox({ prompt: "[Optional] SSL certificate path. Leave empty to ignore", placeHolder: "certificate file path", ignoreFocusOut: true });
      // if (certPath === undefined) {
      //     return;
      // }

      let connections = this.context.globalState.get<{ [key: string]: IConnection }>(Constants.GlobalStateDbConectionsKey);

      if (!connections) {
          connections = {};
      }

      const id = uuidv4();
      connections[id] = {
        connectionString,
        name
        //   host,
        //   user,
        //   port,
        //   certPath,
      };

      // if (password) {
      //     await Global.keytar.setPassword(Constants.ExtensionId, id, password);
      // }
      await this.context.globalState.update(Constants.GlobalStateDbConectionsKey, connections);
      this.refresh();
    //   AppInsightsClient.sendEvent("addConnection.end");
  }

  public refresh(element?: INode): void {
      this._onDidChangeTreeData.fire(element);
  }

  private async getConnectionNodes(): Promise<ConnectionNode[]> {
      const connections = this.context.globalState.get<{ [key: string]: IConnection }>(Constants.GlobalStateDbConectionsKey);
      const ConnectionNodes : ConnectionNode[] = [];
      if (connections) {
          for (const id of Object.keys(connections)) {
              const password = await Global.keytar.getPassword(Constants.ExtensionId, id);
              ConnectionNodes.push(new ConnectionNode(id, connections[id].name, connections[id].connectionString));
              if (!Global.activeConnection) {
                Global.activeConnection = {
                    name: connections[id].name,
                    connectionString: connections[id].connectionString,
                };
            }

              // ConnectionNodes.push(new ConnectionNode(id, connections[id].host, connections[id].user, password, connections[id].port, connections[id].certPath));
              // if (!Global.activeConnection) {
              //     Global.activeConnection = {
              //         host: connections[id].host,
              //         user: connections[id].user,
              //         password,
              //         port: connections[id].port,
              //         certPath: connections[id].certPath,
              //     };
              // }
          }
      }
      return ConnectionNodes;
  }
}
