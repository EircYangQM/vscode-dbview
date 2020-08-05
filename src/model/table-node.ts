// import * as mysql from "mysql";
import * as path from "path";
import * as vscode from "vscode";
// import { AppInsightsClient } from "../common/appInsightsClient";
import { Global } from "../common/global";
// import { OutputChannel } from "../common/outputChannel";
// import { Utility } from "../common/utility";
import { ColumnNode } from "./column-node";
import { InfoNode } from "./info-node";
import { INode } from "./node";
import { JDBCHelper } from "../common/jdbc-helper";
import { OutputChannel } from "../common/output-channel";
import { AppInsightsClient } from "../common/appInsightsClient";

export class TableNode implements INode {
    constructor(private readonly name: string, private readonly connectionString, private readonly catalog: string, private readonly schema: string, private readonly table: string) {
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: this.table,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "table",
            iconPath: path.join(__filename, "..", "..", "..", "resources", "table.svg"),
        };
    }

    public async getChildren(): Promise<INode[]> {
        const connection = JDBCHelper.createConnection({
            name: this.name,
            connectionString: this.connectionString
        });

        return JDBCHelper.getColumns<any[]>(connection, this.catalog, this.schema, this.table)
            .then((columns) => {
                return columns.map<ColumnNode>((column) => {
                    return new ColumnNode(column["COLUMN_NAME"], this.connectionString, column["TABLE_CAT"], column["TABLE_SCHEM"], column["TABLE_NAME"], column["COLUMN_NAME"], column);
                });
            })
            .catch((err) => {
                return [new InfoNode(err)];
            })
            .finally(() => {
                connection.release(connection, () => {});
            });
    }

    public async selectTop1000() {
        const connection = JDBCHelper.createConnection({
            name: this.name,
            connectionString: this.connectionString
        });

        let sql = `SELECT * FROM ${this.schema}.${this.name}`;
        OutputChannel.appendLine("[Start] Start the top 100 query.");
        OutputChannel.appendLine(`[Query] ${sql}`);
        return JDBCHelper.queryPromise<any[]>(connection, sql)
            .then((rows) => {
                if (Array.isArray(rows)) {
                    if (rows.some(((row) => Array.isArray(row)))) {
                        rows.forEach((row, index) => {
                            if (Array.isArray(row)) {
                                 JDBCHelper.showQueryResult(row, "Results " + (index + 1));
                            } else {
                                OutputChannel.appendLine(JSON.stringify(row));
                            }
                        });
                    } else {
                        JDBCHelper.showQueryResult(rows, "Results");
                    }
                } else {
                    OutputChannel.appendLine(JSON.stringify(rows));
                }

                OutputChannel.appendLine("[Done] Finished query.");
            })
            .catch((err) => {
                if (err) {
                    OutputChannel.appendLine(err);
                    AppInsightsClient.sendEvent("runQuery.end", { Result: "Fail", ErrorMessage: err });
                } else {
                    AppInsightsClient.sendEvent("runQuery.end", { Result: "Success" });
                }
            })
            .finally(() => {
                connection.release(connection, () => {});
            });

        // AppInsightsClient.sendEvent("selectTop1000");
        // const sql = `SELECT * FROM \`${this.database}\`.\`${this.table}\` LIMIT 1000;`;
        // Utility.createSQLTextDocument(sql);

        // const connection = {
        //     host: this.host,
        //     user: this.user,
        //     password: this.password,
        //     port: this.port,
        //     database: this.database,
        //     certPath: this.certPath,
        // };
        // Global.activeConnection = connection;

        // Utility.runQuery(sql, connection);
    }
}
