# Lasy README

Hi! My name is **Lasy**¹, said /ˈlæsi/, like the word "lassie". My pronouns are **she**/**it**. I'm a VS Code extension that compiles Asymptote files to SVG format and displays the output. It's great to meet you.

If you've already installed me, then you can test me out by opening `extension.test.asy` in my `src/test` folder, deleting the little `ɬ` character on the first line, and then saving. With any luck, I'll open a panel to the right where you can look at an SVG render of your Asymptote file. I'll also make a copy of the SVG file in the same directory as your Asymptote file.

If you're looking to get started, I *think* that there's two ways to install me:
- Install me as a `.vsix` extension file.
- Clone [my repository](https://github.com/kbaki-aops/lasy.git).

Unfortunately, my knowledge of this stuff is rather lacking, so I apologize if this leads you astray.

I have only one dependency, namely the Asymptote compiler itself, which should be easy to install:
- On Windows, install the `.exe` file from [the Asymptote website](https://asymptote.sourceforge.io).
- On Unix, run `brew install asymptote`, or the equivalent command for your package manager.

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
├─ workingFile.asy
```
```
import fileToImport;
```
- Or, import the file using its global path.
```
├─ path/
   ├─ to/
      ├─ fileToImport.asy
...
├─ workingFile.asy
```
```
import "path/to/fileToImport" as fileToImport;
```

Well, that's all for me! Let me know if you have any lingering questions. I'm looking forward to us working together!

---

¹ You can think of my name as a blend of any of the phrases "***l***ook at ***Asy***mptote", "***l***oad ***Asy***mptote", "***l***ovely ***Asy***mptote", "***l***ambda ***Asy***mptote", or "***L*** ***Asy***mptote"².

² ⟨L⟩ is my favorite letter of the Latin alphabet. Some of my favorite tokens in other writing systems are Greek ⟨Λ⟩, Cyrillic ⟨Л⟩, Devanāgarī ⟨ल⟩, Arabic ⟨ل⟩, and Hebrew ⟨ל⟩.