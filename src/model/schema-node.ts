import * as fs from "fs";
// import * as mysql from "mysql";
import * as path from "path";
import * as vscode from "vscode";
// import { AppInsightsClient } from "../common/appInsightsClient";
import { Global } from "../common/global";
// import { Utility } from "../common/utility";
import { InfoNode } from "./info-node";
import { INode } from "./node";
import { JDBCHelper } from '../common/jdbc-helper';
import { TableNode } from "./table-node";

export class SchemaNode implements INode {
    constructor(private readonly name: string, private readonly connectionString: string, private readonly catalog: string, private readonly schema: string) {
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: this.name,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "database",
            iconPath: path.join(__filename, "..", "..", "..", "resources", "database.svg"),
        };
    }

    public async getChildren(): Promise<INode[]> {
        const connection = JDBCHelper.createConnection({
            name: this.name,
            connectionString: this.connectionString
        });

        return JDBCHelper.getTables<any[]>(connection, this.catalog, this.schema)
            .then((tables) => {
                return tables.map<TableNode>((table) => {
                    return new TableNode(table["TABLE_NAME"], this.connectionString, table["TABLE_CAT"], table["TABLE_SCHEM"], table["TABLE_NAME"]);
                });
            })
            .catch((err) => {
                return [new InfoNode(err)];
            })
            .finally(() => {
                connection.release(connection, () => {});
            });
    }

    public async newQuery() {
        // AppInsightsClient.sendEvent("newQuery", { viewItem: "database" });
        // Utility.createSQLTextDocument();

        // Global.activeConnection = {
        //     host: this.host,
        //     user: this.user,
        //     password: this.password,
        //     port: this.port,
        //     database: this.database,
        //     certPath: this.certPath,
        // };
    }
}
