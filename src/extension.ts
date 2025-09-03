"use strict";

import vscode from "vscode";

import fs from "fs";
import os from "os";
import path from "path";

import cp from "child_process";

let lasy: Lasy;

type Panel = {
  panel: vscode.WebviewPanel;
  watcher: vscode.FileSystemWatcher;
}

const when = <T>(condition: boolean) => (deed: () => T): T | void => { if (condition) { return deed(); } };
const _map = <T,U>(f: ($t: T) => U) => (xs: T[]): U[] => xs.map(f);

// go away linter
// but thank u for ur lintwork
// const loudly = <T>(thing: T): T => { console.log(thing); return thing; };

export function activate(): void {
  console.log("Lasy is waking up…");
  lasy = new Lasy();
  console.log("Lasy is awake!");

  const backwards = (s: string): string => [...s].reverse().join('');
  const asunder = (wedge: string) => (s: string): string[] => s.split(wedge, 2);

  vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) =>
    ((path: string[]) => (when (path[1] === 'asy') (() => lasy.work(path[0]))))
      (((_map (backwards) (asunder ('.') (backwards(document.uri.fsPath)))).reverse()))
  );
}

export function deactivate(): void {
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
  channel: vscode.OutputChannel;
  config: vscode.WorkspaceConfiguration;
  panels: Map<string, Panel>;
  dir: string;

  constructor() {
    this.channel = vscode.window.createOutputChannel("lasy");
    this.config = vscode.workspace.getConfiguration("lasy");
    this.panels = new Map();
    this.dir = fs.mkdtempSync(os.tmpdir());
  }

  async work(filename: string): Promise<void> {
    console.log(`Lasy has begun her work with ${filename}.asy…`);
    try {
      await this.wipe(filename);
      try {
        await this.compile(filename, "svg", true);
      } catch (e) {
        console.log(`Lasy has found no new work for ${filename}.asy.`);
        return;
      }
      await this.copy(filename, "svg");

      if (this.config.get("png.if")) {
        await this.compile(filename, "eps", false);
        await this.rasterise();
        await this.copy(filename, "png");
      }

      await this.updatePanel(filename, (await this.makePanel(filename)).panel);
      console.log(`Lasy has fulfilled her work with ${filename}.asy!`);
    } catch (e) {
      this.channel.appendLine(e as string);
      console.log(`Lasy could not fulfill her work with ${filename}.asy: ${e}`);
    } finally {
      console.log("");
    }
  }

  async wipe(filename: string): Promise<void> {
    console.log(`Lasy is wiping the last sketches for ${filename}…`);
    try {
      cp.execSync(`rm -f ${this.dir}/temp.* ]`);
    } catch (e) {
      console.log(`Lasy has found nothing to wipe.`);
    }
  }

  async compile(filename: string, filetype: string, loud?: boolean): Promise<void> {
    console.log(`Lasy is making ${this.dir}/temp.${filetype}…`);

    console.log(`Lasy is making a new ${this.dir}/temp.${filetype}…`);
    ((lwrit) => { if (loud) {
      console.log(lwrit);
      this.channel.appendLine(lwrit);
    }})(cp.execSync(`${this.config.get("asyPath", "asy")} -f ${filetype} -outname ${this.dir}/temp ${filename}`,
                    { 'cwd': `${filename.split('/').slice(0, -1).join('/')}`})
          .toString());

    console.log(`Lasy is seeing if there was made a new ${this.dir}/temp.${filetype}…`);
    cp.execSync(`[ -f ${this.dir}/temp.${filetype} ]`);
  }

  async copy(filename: string, filetype: string): Promise<void> {
    console.log(`Lasy is copying ${filename}.${filetype}…`);
    fs.copyFileSync(`${this.dir}/temp.${filetype}`, `${filename}.${filetype}`);
  }

  async rasterise(): Promise<void> {
    console.log(`Lasy is rasterising ${this.dir}/temp.eps to PNG…`);
    cp.execSync(`gs -q -dSAFER -dBATCH -dNOPAUSE -dEPSCrop -sDEVICE=png16m -dGraphicsAlphaBits=4 \
      -r${this.config.get("png.dpi")} -sOutputFile=${this.dir}/temp.png ${this.dir}/temp.eps`);
  }

  async makePanel(filename: string): Promise<Panel> {
    if (this.panels.has(filename)) {
      console.log(`Lasy has found there to already be a board for ${filename}.asy!`);
    } else {
      console.log(`Lasy is building a board for ${filename}.asy…`);
      ((lp: vscode.WebviewPanel) => ((lw: vscode.FileSystemWatcher) => {
        lp.onDidDispose(() => {
          this.panels.delete(filename);
          lw.dispose();
        });
        lw.onDidChange(() => this.updatePanel(filename, lp));
        this.panels.set(filename, { panel: lp, watcher: lw });
      })) (vscode.window.createWebviewPanel("", `Preview: ${path.basename(filename)}`,
            { preserveFocus: true, viewColumn: vscode.ViewColumn.Beside }, { enableScripts: true })
        ) (vscode.workspace.createFileSystemWatcher(filename));
    }

    return this.panels.get(filename)!;
  }

  async updatePanel(filename: string, panel: vscode.WebviewPanel): Promise<void> {
    console.log(`Lasy is opening ${this.dir}/temp.svg…`);
    ((lfd) => ((lstats) => ((lsvgcontent) => {
      console.log(`Lasy is reading ${this.dir}/temp.svg…`);
      fs.readSync(lfd, lsvgcontent, 0, lstats.size, null);

      console.log(`Lasy is working on the board for ${filename}.asy…`);
      panel.webview.html = `
        <style>
          body { background: white; }
        </style>
        <h1>${[...filename.split('/')].pop()}</h1>
        <div>
          ${lsvgcontent}
        </div>
      `;
    }) (Buffer.alloc(lstats.size))
    ) (fs.fstatSync(lfd))
    ) (fs.openSync(`${this.dir}/temp.svg`, 'r'));
  }
}