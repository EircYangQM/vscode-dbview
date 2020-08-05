import * as fs from "fs";
// import * as mysql from "mysql";
import * as path from "path";
import * as vscode from "vscode";
import { Constants } from "../common/constants";
import { DbTreeDataProvider } from "../provider";
import { IConnection } from "./connection";
import { INode } from "./node";
import { CatalogNode } from "./catalog-node";
import { InfoNode} from "./info-node";
import { JDBCHelper } from "../common/jdbc-helper";
import { TableNode } from "./table-node";

export class ConnectionNode implements INode {
    // constructor(private readonly id: string, private readonly host: string, private readonly user: string,
    //             private readonly password: string, private readonly port: string,
    //             private readonly certPath: string) {
    // }

    constructor(private readonly id: string, private readonly name: string, private readonly connectionString: string) {}
    
    public getTreeItem(): vscode.TreeItem {
        return {
            label: this.name,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "connection",
            iconPath: path.join(__filename, "..", "..", "..", "resources", "server.png"),
        };
    }

    public async getChildren(): Promise<INode[]> {
        const connection = JDBCHelper.createConnection({
            name: this.name,
            connectionString: this.connectionString
        });

        return JDBCHelper.getCatalogs<any[]>(connection)
            .then((resultSet) => {
                if (resultSet.length === 0) {
                    return [new CatalogNode("MOCK", this.connectionString, "")];
                } else {
                    return resultSet.map<CatalogNode>((result) => {
                        return new CatalogNode(result["TABLE_CAT"], this.connectionString, result["TABLE_CAT"]);
                    });
                }
            })
            .catch((err) => {
                return [new InfoNode(err)];
            })
            .finally(() => {
                connection.release(connection, () => {});
            });
        // let results = await JDBCHelper.getTables<any[]>(connection,"", "")
        //     .then((resultSet) => {
        //         return resultSet.map<TableNode>((result) => {
        //             console.log(`TABLE: ${ result["TABLE_NAME"]}`);
        //             return new TableNode(this.name, this.connectionString,"", "", result["TABLE_NAME"]);
        //         });
        //     })
        //     .catch((err) => {
        //         return [new InfoNode(err)];
        //     })
        //     .finally(() => {
        //         connection.release(connection, () => {});
        //     });
        // return results;
    }

    public async newQuery() {
        // AppInsightsClient.sendEvent("newQuery", { viewItem: "connection" });
        // Utility.createSQLTextDocument();

        // Global.activeConnection = {
        //     host: this.host,
        //     user: this.user,
        //     password: this.password,
        //     port: this.port,
        //     certPath: this.certPath,
        // };
    }

    public async deleteConnection(context: vscode.ExtensionContext, dbTreeDataProvider: DbTreeDataProvider) {
        // AppInsightsClient.sendEvent("deleteConnection");
        const connections = context.globalState.get<{ [key: string]: IConnection }>(Constants.GlobalStateDbConectionsKey);
        if (connections !== undefined && [this.id] !== null) {
            delete connections[this.id];
            await context.globalState.update(Constants.GlobalStateDbConectionsKey, connections);
            // await Global.keytar.deletePassword(Constants.ExtensionId, this.id);
            dbTreeDataProvider.refresh();
        }
    }
}
