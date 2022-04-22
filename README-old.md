# micro-bit-fr README

A Visual Studio Code extension for students who code the BBC micro:bit with Python. 

**`First version that seems to work `**

This is based on :
> Stapted extension : https://github.com/oivron/microbit-extension-vscode


> sos82 extension : https://github.com/sos82/vscode_micropython

> microsoft garage device simulator : https://github.com/microsoft/vscode-python-devicesimulator

Thanks for their work.
<p align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=electropol-fr.micro-bit-fr"><img src="https://badgen.net/vs-marketplace/v/electropol-fr.micro-bit-fr?icon=visualstudio" alt="vs-marketplace version"></a>
<a href="https://github.com/FrankSAURET/micro-bit-fr"><img src="https://badgen.net/github/last-commit/FrankSAURET/micro-bit-fr?icon=github" alt="lien github"></a>
<img src="https://badgen.net/vs-marketplace/i/electropol-fr.micro-bit-fr" alt="vs-marketplace installs">
<img src="https://badgen.net/vs-marketplace/d/electropol-fr.micro-bit-fr" alt="vs-marketplace downloads">
<img src="https://badgen.net/vs-marketplace/rating/electropol-fr.micro-bit-fr" alt="vs-marketplace rating">
</p>

![Logo](image/microbitLogoNomCouleur.png)

## Features

* Provides stubs for microPython and micro:bit.
* Supports both micro:bit V1 and V2.
* Quickly send py file to the micro:bit.
* If wanted, clear all comments and empty line.
* Reads error messages from the micro:bit (REPL).
* Add button to send file directly in  micro:bit main file.
* Add contextual menu in file explorer to send file to micro:bit with or without comments.

## How to use

* Clic on the colored micro:bit button to send your python file into main.py on micro:bit.

or
* Right clic in the file explorer to send the file without renaming it into the micro:bit with or without comments.

Error message (and other) appear directly in the output console.


## Available Commands and keyboard shortcuts

| Command                              | Keyboard        
| -----------                          | -----------     
| __micro:bit - Upload current file in main.py on micro:bit__                 | __Ctrl+Alt+u__     
| __micro:bit - Send this file to micro:bit__               |              
| __micro:bit - Send this file - without comment and empty lines - to micro:bit__ |  
| __Show notifications list__          | __Ctrl+Alt+N__  

