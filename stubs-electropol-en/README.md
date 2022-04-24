# micro:bit Stubs Readme

The source repo is : https://github.com/oivron/microbit-stubs

```In this version all is include in the extension... Nothing to do.```

This repo is based on https://github.com/makerbit/microbit-stub. It provides type hints and type checking in your IDE while coding the BBC micro:bit with Python.

I have added support for micro:bit V2.

## How to use

Detailed description on [how to use stub files with Visual Studio Code and Pylint](https://github.com/Josverl/micropython-stubber#3---vscode-and-pylint-configuration).

In short:

1. Clone this repo to your workspace.

2. Add settings.json to your workspace and make sure it contains:

    ```
    "python.languageServer": "Pylance",
    "python.analysis.autoSearchPaths": true,
    "python.autoComplete.extraPaths": [
        "path/to/stub/files"
    ],
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true
    ```

3. You will also need a .pylintrc file in your workspace with the following:

    ```
    [MASTER]
    init-hook='import sys;sys.path[1:1] = ["path/to/stub/files",]'
    ```

## License

GNU GENERAL PUBLIC LICENSE.