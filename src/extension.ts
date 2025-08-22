//todo: compile to static eps and svg
//todo: the async/awaits in _compile
//todo: check if gs exists before rasterise
"use strict";

import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

import util from "node:util";
import childProcess from "node:child_process";
const exec = util.promisify(childProcess.exec);

let lasy: Lasy;

type Panel = {
  panel: vscode.WebviewPanel;
  watcher: vscode.FileSystemWatcher;
}

export function activate() {
  console.log("Lasy is waking up…");
  lasy = new Lasy();
  console.log("Lasy is awake!");

  vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    ((path: Array<string>) => {
      if (path.pop() === 'asy') {
        lasy.work(path.join('.'));
      }
    })(document.uri.fsPath.split('.'));
  });
}

export function deactivate() {
  console.log("Lasy is going to sleep…");
  try {
    for (const panel of lasy.panels.values()) {
      panel.panel.webview.postMessage({ type: "requestSaveState" });
      panel.watcher.dispose();
    }
    console.log("Lasy is asleep!");
  } catch (e) {
    console.log(`Lasy could not go to sleep: ${e}`);
  }
}

class Lasy {
  private _channel: vscode.OutputChannel;
  private _config: vscode.WorkspaceConfiguration;
  private _panels: Map<string, Panel>;
  private _dir: string;

  constructor() {
    this._channel = vscode.window.createOutputChannel("lasy");
    this._config = vscode.workspace.getConfiguration("lasy");
    this._panels = new Map();
    this._dir = fs.mkdtempSync(os.tmpdir());
  }

  public get panels(): Map<string, Panel> {
    return this._panels;
  }

  public async work(filename: string): Promise<void> {
    console.log(`Lasy has begun her work with ${filename}.asy…`);
    try {
      await this._compile(filename, { filetype: "svg" });
      await this._copy(filename, "svg");

      if (this._config.get("png")) {
        await this._compile(filename, { filetype: "eps", loudly: false });
        await this._rasterise();
        await this._copy(filename, "png");
      }

      await this._updatePanel(filename, (await this._makePanel(filename)).panel);
      console.log(`Lasy has fulfilled her work with ${filename}.asy!`);
    } catch (e) {
      this._channel.appendLine(<string> e);
      console.log(`Lasy could not fulfill her work with ${filename}.asy: ${e}`);
    } finally {
      console.log("");
    }
  }

  private async _compile(filename: string, options: { filetype: string, loudly?: boolean }): Promise<void> {
    console.log(`Lasy is making ${this._dir}/temp.${options.filetype}…`);
    (({ stdout, stderr }) => {
      if (options.loudly !== false) {
        this._channel.appendLine(stdout);
        this._channel.appendLine(stderr);
      }
    })(await exec(`${this._config.get("asyPath", "asy")} -f ${options.filetype} -outname ${this._dir}/temp ${filename}`,
      { 'cwd': `${filename.split('/').slice(0, -1).join('/')}`}));
  }

  private async _copy(filename: string, filetype: string): Promise<void> {
    console.log(`Lasy is making ${filename}.${filetype}…`);
    fs.copyFileSync(`${this._dir}/temp.${filetype}`, `${filename}.${filetype}`);
  }

  private async _rasterise(): Promise<void> {
    console.log(`Lasy is rasterising ${this._dir}/temp.eps to PNG…`);
    (({ stdout, stderr }) => {
      this._channel.appendLine(stdout);
      this._channel.appendLine(stderr);
    })(await exec(`gs -q -dSAFER -dBATCH -dNOPAUSE -dEPSCrop -sDEVICE=png16m -dGraphicsAlphaBits=4 \
      -r${this._config.get("gs.dpi")} -sOutputFile=${this._dir}/temp.png ${this._dir}/temp.eps`
    ));
  }

  private async _makePanel(filename: string): Promise<Panel> {
    if (this._panels.has(filename)) {
      console.log(`Lasy has found there to already be a board for ${filename}!`);
    } else {
      console.log(`Lasy is building a board for ${filename}…`);
      let panel: vscode.WebviewPanel = vscode.window.createWebviewPanel("", `Preview: ${path.basename(filename)}`, vscode.ViewColumn.Beside, { enableScripts: true });
      let watcher: vscode.FileSystemWatcher = vscode.workspace.createFileSystemWatcher(filename);
      panel.onDidDispose(() => {
        this._panels.delete(filename);
        watcher.dispose();
      });
      watcher.onDidChange(() => {
        this._updatePanel(filename, panel);
      });

      this._panels.set(filename, {panel, watcher});
    }

    return this._panels.get(filename)!;
  }

  private async _updatePanel(filename: string, panel: vscode.WebviewPanel): Promise<void> {
    console.log(`Lasy is opening ${this._dir}/temp.svg…`);
    const fd = fs.openSync(`${this._dir}/temp.svg`, 'r');

    console.log(`Lasy is reading ${this._dir}/temp.svg…`);
    const stats = fs.fstatSync(fd);
    let svgContent = Buffer.alloc(stats.size);
    fs.readSync(fd, svgContent, 0, stats.size, null);

    console.log(`Lasy is working on the board for ${filename}…`);
    panel.webview.html = `
      <style>
        body { background: white; }
      </style>
      <h1>${[...filename.split('/')].pop()}</h1>
      <div>
        ${svgContent}
      </div>
    `;
  }
}