import * as vscode from "vscode";
import { INode } from "./node";

export class InfoNode implements INode {
    constructor(private readonly label: string) {
    }

    public getTreeItem(): vscode.TreeItem {
        return {
            label: this.label,
        };
    }

    public getChildren(): INode[] {
        return [];
    }
}
