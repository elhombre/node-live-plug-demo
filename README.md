# Dynamic Plugin Loading in Node.js

## Translations
- [Русский](README.ru.md)

## Introduction

Dynamic plugin loading and unloading in Node.js unlocks new possibilities for developers to build modular and extendable applications. This approach allows for adding or updating functionality without restarting the entire application, which is particularly valuable for systems requiring high availability.

This project demonstrates the concept of dynamic plugin management in Node.js. The repository is organized as a monorepo using TurboRepo, with all source code written in TypeScript. The “host” application is built on the NestJS platform, which handles routing requests to plugins. Each plugin is an independent NPM package and can be built using esbuild. Upon each build, a new version of the plugin is created and stored in a separate subdirectory marked with a build number. The application includes a plugin manager that monitors the plugin directories, unloading older versions and loading newer ones as they become available. Notably, plugins maintain compatibility with the debugger even after a new version is loaded.

Additionally, the project supports automatic request data validation for plugins using JSON schemas. These schemas are automatically generated from the plugin's DTO code written in TypeScript. This simplifies data validation and ensures its correctness.

## Setup and Usage

### Install Dependencies
```sh
yarn install
```

### Start the Application in Development Mode
```sh
yarn workspace backend dev
```

### Build a Plugin
```sh
yarn workspace sample-plugin build
```

### Example of a JSON Schema request for a test plugin
```sh
curl --location 'localhost:3100/plugins/sample-plugin/schema'
```

### Example of a request to the functionality of a test plugin
```sh
curl --location 'localhost:3100/plugins/sample-plugin/process' \
--header 'Content-Type: application/json' \
--data '{
    "action": "echo",
    "payload": {
        "message": "test"
    }
}'
```

## Debugging in VSCode

### Set Up Yarn SDK for TypeScript
```sh
yarn dlx @yarnpkg/sdks vscode
```

Then select the local TypeScript version in VSCode:
1. Open any `.ts` file.
2. Run the command **"TypeScript: Select TypeScript Version..."** → **"Use Workspace Version"**.

For debugging:
1. Enable auto-attach for the debugger: **"Debug: Toggle Auto Attach"** → **"Smart ..."**.
2. Start the application in the terminal in development mode. The debugger should automatically attach.

If debugging doesn’t start, restart your development environment.

## Additional Features

- **Biome**: A fast linter and formatter. Install the [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) for VSCode.
  Example setup for auto-formatting:
  ```json
  {
    "editor.codeActionsOnSave": {
      "quickfix.biome": "explicit",
      "source.fixAll": "explicit",
      "source.organizeImports.biome": "explicit"
    },
    "editor.formatOnSave": true
  }
  ```
- **Husky and Commitlint**: Ensures commits comply with [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
