// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MicrobitFile, MicrobitFileProvider } from './MicrobitExplorer';

export var term: vscode.Terminal;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
	const microbitFileProvider = new MicrobitFileProvider(rootPath);
	updatePythonExtraPaths();
	
	vscode.window.registerTreeDataProvider('microbit-explorer-view', microbitFileProvider);
	//#region registerCommand
	// The command has been defined in the package.json file. The commandId parameter must match the command field in package.json.
	vscode.commands.registerCommand('microbit.sendFileToMicrobitMain', () => microbitFileProvider.sendFileToMicrobit(null, vscode.workspace.getConfiguration("microbit").get("clearComments")))
	vscode.commands.registerCommand('microbit.simul', () => microbitFileProvider.simulMicrobit())
	vscode.commands.registerCommand('microbit.sendFileToMicrobit', (fileUri: vscode.Uri) => microbitFileProvider.sendFileToMicrobit(fileUri, vscode.workspace.getConfiguration("microbit").get("clearComments")))
	vscode.commands.registerCommand('microbit.sendCleanedFileToMicrobit', (fileUri: vscode.Uri) => microbitFileProvider.sendCleanedFileToMicrobit(fileUri))
	vscode.commands.registerCommand('microbit.refreshEntry', () => microbitFileProvider.refresh());
	vscode.commands.registerCommand('microbit.uploadEntry', () => microbitFileProvider.uploadFiles());
	vscode.commands.registerCommand('microbit.downloadEntry', () => microbitFileProvider.downloadFiles());
	vscode.commands.registerCommand('microbit.deleteEntry', (node: MicrobitFile) => microbitFileProvider.deleteFile(node));
	vscode.commands.registerCommand('microbit.downloadThisFile', (node: MicrobitFile) => microbitFileProvider.downloadThisFile(node));
	vscode.commands.registerCommand('microbit.connectEntry', () => microbitFileProvider.Connect());
	vscode.commands.registerCommand('microbit.resetEntry', () => microbitFileProvider.ResetMicroBit());
	vscode.commands.registerCommand('microbit.disconnectEntry', () => microbitFileProvider.DisconnectDevice());
	
	//#endregion
}
function updatePythonExtraPaths() {
	//* Chemin des stubs
	// TODO Revoir ici le __dirname qui est sans doute déprécié
	// TODO « python.analysis.extraPaths » est-il nécessaire ? (Additional import search resolution paths)
	let cheminStubMicrobit = __dirname.replace("out", "stubs-electropol-fr\\lib"); // __dirname = Chemin du script en cours
	let cheminStubMicroPython = __dirname.replace("out", "stubs-electropol-fr\\micropython"); // __dirname = Chemin du script en cours
	// Ne laisse qu'un seul extraPaths qui pointe vers ces stubs
	//1- autocomplete
	let extraPathsInitial: String[] = vscode.workspace.getConfiguration().get("python.autoComplete.extraPaths");
	let extraPathsFinal: String[] = [cheminStubMicrobit, cheminStubMicroPython];
	for (var i in extraPathsInitial) {
		if (!extraPathsInitial[i].includes("stubs-electropol-fr")) {
			extraPathsFinal.push()
			extraPathsFinal.push(extraPathsInitial[i]);
		}
	}
	vscode.workspace.getConfiguration("python.autoComplete").update("extraPaths", extraPathsFinal, vscode.ConfigurationTarget.Global);
	//2- analysis
	extraPathsInitial = vscode.workspace.getConfiguration().get("python.analysis.extraPaths");
	extraPathsFinal = [cheminStubMicrobit, cheminStubMicroPython];
	for (var i in extraPathsInitial) {
		if (!extraPathsInitial[i].includes("stubs-electropol-fr")) {
			extraPathsFinal.push()
			extraPathsFinal.push(extraPathsInitial[i]);
		}
	}
	vscode.workspace.getConfiguration("python.analysis").update("extraPaths", extraPathsFinal, vscode.ConfigurationTarget.Global);
	//* Autres paramètres python
	vscode.workspace.getConfiguration("python").update("languageServer", "Pylance", vscode.ConfigurationTarget.Global);
	vscode.workspace.getConfiguration("python.analysis").update("autoSearchPaths", true, vscode.ConfigurationTarget.Global);
	vscode.workspace.getConfiguration("python.linting").update("enabled", true, vscode.ConfigurationTarget.Global);
	//vscode.workspace.getConfiguration("python.linting").update("pylintEnabled", true, vscode.ConfigurationTarget.Global);
}
// this method is called when your extension is deactivated
export function deactivate() { }
