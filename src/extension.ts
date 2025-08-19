//todo: documentation lol
//todo: learn how and why to dispose things

"use strict";

import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

import util from "node:util";
import childProcess from "node:child_process";
const exec = util.promisify(childProcess.exec);

export function activate() {
  console.log("Lasy waketh…");
  const extension = new Lasy();

  vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    extension.do([...document.uri.fsPath.split('.')].slice(0, -1).join());
  });
}

export function deactivate() {
  console.log("Lasy sleepeth.");
  console.log();
}

class Lasy {
  private _channel: vscode.OutputChannel;
  private _config: vscode.WorkspaceConfiguration;
  private _panels: Map<string, vscode.WebviewPanel>;
  private _dir: string;

  constructor() {
    this._channel = vscode.window.createOutputChannel("lasy");
    this._config = vscode.workspace.getConfiguration("lasy");
    this._panels = new Map();
    this._dir = fs.mkdtempSync(os.tmpdir());

    console.log("Lasy hath awoken!");
    console.log();
  }

  public async do(filename: string): Promise<void> {
    return this._do(filename);
  }

  private async _do(filename: string): Promise<void> {
    console.log(`Lasy begins her work with ${filename}.asy…`);
    try {
      await this._makeSvg(filename);
      await this._updatePanel(filename, await this._makePanel(filename));
    } catch (e) {
      this._channel.appendLine(<string> e);
      console.log(`Lasy hath found a mistake: ${e}`);
    } finally {
      console.log(`Lasy hath fulfilled her work with ${filename}.asy!`);
    };
  }

  private async _makeSvg(filename: string, filetype: string = "svg", isKeeping: boolean = false): Promise<void> {
    console.group();
    console.log(`Lasy buildeth ${this._dir}/temp.${filetype}…`);
    await exec(`${this._config.get("asyPath", "asy")} -f ${filetype} -outname ${this._dir}/temp ${filename}`, { 'cwd': `${filename.split('/').slice(0, -1).join('/')}`});
    if (isKeeping) {
      fs.copyFileSync(`${this._dir}/temp.${filetype}`, `${filename}.${filetype}`);
    }
    console.log(`Lasy hath built ${this._dir}/temp.${filetype}!`);
    console.groupEnd();
  }

  private async _makePanel(filename: string): Promise<vscode.WebviewPanel> {
    console.group();
    console.log(`Lasy buildeth a board for ${filename}…`);
    if (this._panels.has(filename)) {
      console.log(`Lasy hath found there to already be a board for ${filename}!`);
    } else {
      let panel: vscode.WebviewPanel = vscode.window.createWebviewPanel("", `Preview: ${path.basename(filename)}`, vscode.ViewColumn.Beside, { enableScripts: true });
      let watcher: vscode.FileSystemWatcher = vscode.workspace.createFileSystemWatcher(filename);
      panel.onDidDispose(() => {
        watcher.dispose();
      });
      watcher.onDidChange(() => {
        this._updatePanel(filename, panel);
      });

      this._panels.set(filename, panel);
      console.log(`Lasy hath built a new board for ${filename}!`);
    }
    console.groupEnd();
    return this._panels.get(filename)!;
  }

  private async _updatePanel(filename: string, panel: vscode.WebviewPanel): Promise<void> {
    console.group();
    console.log(`Lasy newly worketh the board for ${filename}…`);

    console.group();
    console.log(`Lasy openeth ${this._dir}/temp.svg…`);
    const fd = fs.openSync(`${this._dir}/temp.svg`, 'r');
    console.log(`Lasy hath opened ${this._dir}/temp.svg!`);
    console.groupEnd();

    const stats = fs.fstatSync(fd);
    let svgContent = Buffer.alloc(stats.size);

    console.group();
    console.log(`Lasy readeth ${this._dir}/temp.svg…`);
    fs.readSync(fd, svgContent, 0, stats.size, null);
    console.log(`Lasy hath read ${this._dir}/temp.svg!`);
    console.groupEnd();

    panel.webview.html = `<h1>${[...filename.split('/')].pop()}</h1>${svgContent}`;
    console.log(`Lasy hath newly worked the board for ${filename}!`);
    console.groupEnd();
  }
}