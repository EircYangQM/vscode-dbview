// import * as mysql from "mysql";
import * as path from "path";
import * as vscode from "vscode";
// import { AppInsightsClient } from "../common/appInsightsClient";
import { Global } from "../common/global";
// import { OutputChannel } from "../common/outputChannel";
// import { Utility } from "../common/utility";
import { InfoNode } from "./info-node";
import { INode } from "./node";

export class ColumnNode implements INode {
    constructor(private readonly name: string, private readonly connectionString, private readonly catalog: string, private readonly schema: string, private readonly table: string, private readonly columnName: string, private readonly obj: Array<any>) {

    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: `${this.columnName} : ${this.obj["TYPE_NAME"]}`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: "column",
            // iconPath: path.join(__filename, "..", "..", "..", "resources", this.column.COLUMN_KEY === "PRI" ? "b_primary.png" : "b_props.png"),
            iconPath: path.join(__filename, "..", "..", "..", "resources", "b_props.png"),
        };
    }

    public async getChildren(): Promise<INode[]> {
        return [];
    }
}
