import * as fs from "fs";
// import * as mysql from "mysql";
import * as path from "path";
import * as vscode from "vscode";
import { Global } from "../common/global";
import { InfoNode } from "./info-node";
import { INode } from "./node";
import { JDBCHelper } from '../common/jdbc-helper';
import { TableNode } from "./table-node";
import { SchemaNode } from "./schema-node";

export class CatalogNode implements INode {
    constructor(private readonly name: string, private readonly connectionString: string, private readonly catalog: string) {
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: this.catalog,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "database",
            iconPath: path.join(__filename, "..", "..", "..", "resources", "database.svg"),
        };
    }

    public async getChildren(): Promise<INode[]> {
        const connection = JDBCHelper.createConnection({
            name: this.catalog,
            connectionString: this.connectionString
        });

        return JDBCHelper.getSchemas<any[]>(connection, this.catalog)
            .then((resultSet) => {
                if (resultSet.length === 0) {
                    return [new SchemaNode("MOCK", this.connectionString, "", "")];
                } else {
                    return resultSet.map<SchemaNode>((result) => {
                        return new SchemaNode(result["TABLE_SCHEM"], this.connectionString, result["TABLE_CATALOG"], result["TABLE_SCHEM"]);
                    });
                }
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
