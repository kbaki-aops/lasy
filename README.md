# Lasy README

Hi! My name is **Lasy**¹, said /ˈlæsi/, like the word "lassie". My pronouns are **she**/**it**. Perhaps you've met my brother [Jaxy](https://github.com/kbaki-aops/jaxy.git). I'm a VS Code extension that compiles Asymptote files to SVG format and displays the output. It's great to meet you.

## Quick start

You can install me by downloading my repository's file `lasy-*.vsix`, where `*` denotes the version number, and then following [the instructions on the VS Code documentation](https://code.visualstudio.com/docs/configure/extensions/extension-marketplace#_install-from-a-vsix). You'll also need to install the Asymptote compiler itself:
- On Windows, install the `.exe` file from [the Asymptote website](https://asymptote.sourceforge.io).
- On Unix, run `brew install asymptote`, or the equivalent command for your package manager.

Once you've installed me, you can test me out by opening `extension.test.asy` in my `/lasy/src/test` folder, deleting the little `ɬ` character on the first line, and then saving. With any luck, I'll open a panel to the right where you can look at an SVG render of your Asymptote file. I'll also make a copy of the SVG file in the same directory as your Asymptote file.

## Slow start

If you'd like to acquire my codebase for testing, improvement, and other whatnots, then you can clone my [repository](https://github.com/kbaki-aops/lasy.git). Once you've done this, your choices are manifold:
- If you'd just like to build me as a `.vsix` file, then run `vsce package` from the folder `/lasy`.
- If you'd like to iterate on me:
  * Run `npm install | npm run test` from the folder `/lasy` to acquire my dependencies;
  * Press `F5` to open a new VS Code window in which I'll be active.

I compile Asymptote files using the shell command `asy`. If I'm having trouble locating the Asymptote installation, then you can manually let me know in the `lasy.asyPath` property of my `package.json` file.

I run automatically whenever you save a `.asy` file. I try not to be too loud, but if your Asymptote file is having trouble compiling, then I'll tell you the error in my output channel, also called `lasy`. If you run VS Code from a terminal, then you'll get console logs that let you track my progress.

## Imports

You can import base modules like usual, by just calling `import` followed by the module name.
```
import graph;
import geometry;
import markers;
```
But if you're importing any other Asymptote file, then you have to do one of two things:
- Put the file in the same directory as your working file;
```
├─ fileToImport.asy
└─ workingFile.asy
```
```
import fileToImport;
```
- Or, import the file using its global path.
```
└─ path/
   └─ to/
      └─ fileToImport.asy
...
└─ workingFile.asy
```
```
import "path/to/fileToImport" as fileToImport;
```

Well, that's all for me! Let me know if you have any lingering questions. I'm looking forward to us working together!

---

¹ You can think of my name as a blend of any of the phrases "***l***ook at ***Asy***mptote", "***l***ocal ***Asy***mptote", "***l***oad ***Asy***mptote", "***l***ovely ***Asy***mptote", "***l***ambda ***Asy***mptote", or "***L*** ***Asy***mptote"².

² ⟨L⟩ is my favorite letter of the Latin alphabet. Some of my favorite tokens in other writing systems are Greek ⟨Λ⟩, Cyrillic ⟨Л⟩, Devanāgarī ⟨ल⟩, Arabic ⟨ل⟩, and Hebrew ⟨ל⟩.