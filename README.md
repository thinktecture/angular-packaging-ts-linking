# angular-packaging-ts-linking

This repository shows a sample of how to use typescript linking. 
Within this repository there are two Angular projects:

- [company](company): Represents an application built by a company.
- [core](core): A sample package, which will be consumed by the company app.

You can use this method of developing Angular packages either within a mono repository (like this) or with a repository per Angular package. 
Using the latter it's important, that they are cloned side-by-side, since the company app is going to reference the core package via file system. 
More on that later.

Also take a look at this [blog post](https://manuel-rauber.com/2017/12/07/packaging-angular-libraries/) for more thoughts about other methods for creating/developing Angular packages.

## Changes

The first three commits of this repository are important.
The [first one](https://github.com/thinktecture/angular-packaging-ts-linking/commit/eb02dc7a389e3939af621228bfbbed6fd52307c6) is simply creating two new Angular CLI projects. 
Within the core folder, the whole app has been moved to a `playground` folder for testing the core module itself.
Within the `src` folder of core, the `CoreModule` is developed.
The [second commit](https://github.com/thinktecture/angular-packaging-ts-linking/commit/1f875e37b9b103f1128aeb983578ba6cb84565fa) shows the changes done in the core folder to support typescript linking.
More on that in the next section within this readme.
The [third commit](https://github.com/thinktecture/angular-packaging-ts-linking/commit/73ba82068a4cb542afeb32dbf51140f714a022de) shows the changes done in the company folder to support typescript linking.
More on that in the next section within this readme.

### Core

In this section, the [changes](https://github.com/thinktecture/angular-packaging-ts-linking/commit/1f875e37b9b103f1128aeb983578ba6cb84565fa) within the core folder are explained.

#### src/package.json

A second `package.json` is needed, since we are going to `npm link` the source folder directly instead of the whole core folder. 
Within that `package.json`, all dependencies are `peerDependencies`.
It's important to include the entry `main` pointing to your module entry point, which in this case is `core.module.ts` and the entry `typings` pointing to your module typing entry point, which in this case is `core.module.d.ts`.
Without those two entries, the compilation will fail later on.

#### src/core.module.d.ts

This file has to be created manually, only doing a `export * from './core.module'` to point to the main file for finding all the typescript definitions for the compiler during the build process.

### Company

In this section, the [changes](https://github.com/thinktecture/angular-packaging-ts-linking/commit/73ba82068a4cb542afeb32dbf51140f714a022de) within the company folder are explained.

#### .angular-cli.json

The first change is done in the `.angular-cli.json` to enable the option `preserveSymlinks`, so we are able to compile symlinked code during the build process.

#### package.json

In the `package.json` two changes are done.
The first change is to add two npm scripts. 
A `preinstall` script calling `npm run link` and the actual `link` script.
The latter just does a `npm link ../core/src --production`.
It uses `npm link` to symlink to the `../core/src` folder.
It's important to symlink the `src` and not the core folder, otherwise the build process will crash.

The second change is to include the dependency `@company/core`.
Be careful to exactly match the version of your package.
Otherwise npm tries to look up the package `@company/core` within the registry and will fail, since it's not there. 

Btw. If you don't like the `preinstall` script, you can remove it. 
It just done, so no one has to remember it. 
And, it may break your CI, so for dev it's nice, for CI not so much. :-)

#### app.component.ts/app.module.ts

Well, actual usage of Angular modules and components. 
Nothing special.

#### src/tsconfig.app.json

Adds the `include` configuration for the typescript compiler.
The compiler will not pickup any typescript files, which are not included in the `src` folder.
If it encounters such a file, it will throw an error like this:

```
Module build failed: Error: [...]/angular-packaging-ts-linking/core/src/components/index.ts is not part of the compilation. Please make sure it is in your tsconfig via the 'files' or 'include' property.
```

This is why we have to manually include all the files we need for compilation.
After adding that property, no file will be included by default. 
That's why we need to add `./**/*.ts` to include all files within our `src` folder.
And we add all files from our `@company/core` module, which is located within the `node_modules` folder.
*Do not* use the local file system path, which would work on your dev system, but not on the CI, where the package (containing the sources) could be loaded via your custom private npm registry.

#### tsconfig.json

The last change is done in the `tsconfig.json` located in the root folder of the company folder.
This change is not needed for the actual compilation, but for the IDEs.
At first we need to add a `baseUrl` which is mandatory, since we are adding the `paths` property as well.
The `baseUrl` just points to the current directory, where the `tsconfig.json` is located.

Within the `paths` property, we specify the package name of the `CoreModule` which is `@company/core` (so the same value of `core/src/package.json`'s `name` property).
The value points *to your local file system*, where the package is located. 
*Do not* use the path to `node_modules` here, it won't work, since it's a symlinked folder, which most IDEs don't like. 
For example:

> In general, WebStorm doesn't play well with symlinks, they cause various issues
- [Elena Pogorelova](https://intellij-support.jetbrains.com/hc/en-us/community/posts/115000240504-Debug-not-stopping-on-breakpoints-in-npm-linked-modules?page=1#community_comment_115000264424)

> a linked dir is not just another folder with more generated code (which would be covered by an outFiles glob pattern). Instead it is a location which is seen by the node runtime with a different path than by VS Code
- [Andre Weinland](https://github.com/Microsoft/vscode-node-debug/issues/73#issuecomment-248415990) 

### Summary

That's it! 
With those very little changes, WebStorm is able to resolve and auto-import all the stuff.
Unfortunately, I was not able to get VSCode's IntelliSense running correctly. 
You may can add `node_modules/@company` to the `tsconfig.json`'s `typeRoots` to get the IntelliSense working, but the auto import goes horribly wrong.
This issue _may_ get fixed with VSCode 1.19. 
If there is another trick. please let me know. :-)

## Setup

If you want to get this demo to run, clone it at first and just use `npm install` in both folders. 
After that, if you run `npm start` within the core folder, the playground starts, where you would normally develop your package independently.
If you run `npm start` within the company folder, the app starts.
It will automatically live-reload, even if you do a change within the core folder.
Awesome for development! :-)