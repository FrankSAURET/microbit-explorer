// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MicrobitFile, MicrobitFileProvider } from './MicrobitExplorer';
import { env } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import i18n from './i18n';
import { Utils } from 'vscode-uri';

export var term: vscode.Terminal;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	i18n.init(context.extensionPath)
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
	const microbitFileProvider = new MicrobitFileProvider(rootPath);
	updatePythonExtraPaths(context.extensionPath);

	vscode.window.registerTreeDataProvider('microbit-explorer-view', microbitFileProvider);
	//#region registerCommand
	// The command has been defined in the package.json file. The commandId parameter must match the command field in package.json.
	vscode.commands.registerCommand('Microbit-Explorer.sendFileToMicrobitMain', () => microbitFileProvider.sendFileToMicrobit(null, vscode.workspace.getConfiguration("Microbit-Explorer").get("clearComments")))
	vscode.commands.registerCommand('Microbit-Explorer.simul', () => microbitFileProvider.simulMicrobit())
	vscode.commands.registerCommand('Microbit-Explorer.sendFileToMicrobit', (fileUri: vscode.Uri) => microbitFileProvider.sendFileToMicrobit(fileUri, vscode.workspace.getConfiguration("Microbit-Explorer").get("clearComments")))
	vscode.commands.registerCommand('Microbit-Explorer.sendCleanedFileToMicrobit', (fileUri: vscode.Uri) => microbitFileProvider.sendCleanedFileToMicrobit(fileUri))
	vscode.commands.registerCommand('Microbit-Explorer.refreshEntry', () => microbitFileProvider.refresh());
	vscode.commands.registerCommand('Microbit-Explorer.uploadEntry', () => microbitFileProvider.uploadFiles());
	vscode.commands.registerCommand('Microbit-Explorer.downloadEntry', () => microbitFileProvider.downloadFiles());
	vscode.commands.registerCommand('Microbit-Explorer.deleteEntry', (node: MicrobitFile) => microbitFileProvider.deleteFile(node));
	vscode.commands.registerCommand('Microbit-Explorer.downloadThisFile', (node: MicrobitFile) => microbitFileProvider.downloadThisFile(node));
	vscode.commands.registerCommand('Microbit-Explorer.connectEntry', () => microbitFileProvider.Connect());
	vscode.commands.registerCommand('Microbit-Explorer.resetEntry', () => microbitFileProvider.ResetMicroBit());
	vscode.commands.registerCommand('Microbit-Explorer.disconnectEntry', () => microbitFileProvider.DisconnectDevice());
	vscode.commands.registerCommand('Microbit-Explorer.updateFirmware', () => updateFirmware());
	vscode.commands.registerCommand('Microbit-Explorer.showPinMap', () => showPinMap(context.extensionUri));

	//#endregion
	async function updateFirmware() {
		try {
			await findPipLocation();
			let dir = "";
			await installModule(dir, "uflash");
			await flashMicrobit("", "");
			await microbitFileProvider.UploadEmptyFile();
			await microbitFileProvider.refresh();
		} catch (error) {
			console.log(error);
		}
	}
	async function findPipLocation() {
		//Vérifie que pip est installé et retourne sa version et son chemin ou génère une erreur
		const { spawn } = require('child_process');
		const child = spawn('pip', ['-V']);

		try {
			let data = "";
			for await (const chunk of child.stdout) {
				console.log('stdout: ' + chunk);
				data += chunk;
			}
			let error = "";
			for await (const chunk of child.stderr) {
				console.error('stderr: ' + chunk);
				error += chunk;
			}
			const exitCode = await new Promise((resolve, reject) => {
				child.on('close', resolve);
				let path = "";
				path = data.substring(
					data.lastIndexOf(":") - 1,
					data.lastIndexOf("pip")
				);
				console.log("Python third-party dir: " + path);
				vscode.workspace.getConfiguration("python").update("thirdPartyModulesDirectory", path, vscode.ConfigurationTarget.Global);
			});
			if (exitCode) {
				throw new Error(`subprocess error exit ${exitCode}, ${error}`);
			}
			return data;
		} catch (error) {
			console.log(error);
		}
	}
	async function installModule(target: string, module: string) {
		// Installe un module avec pip et retourne le message post installation
		const { spawn } = require('child_process');
		const args = "pip install " + target + " " + module;
		const child = spawn("powershell.exe", [args]);

		try {
			let data = "";
			for await (const chunk of child.stdout) {
				console.log('stdout: ' + chunk);
				data += chunk;
				console.log(`Module ${module} succesfully installed,${module}`);
			}
			let error = "";
			for await (const chunk of child.stderr) {
				console.error('stderr: ' + chunk);
				error += chunk;
				vscode.window.showErrorMessage(error);
			}
			const exitCode = await new Promise((resolve, reject) => {
				child.on('close', resolve);
			});
			if (exitCode) {
				throw new Error(`subprocess error exit ${exitCode}, ${error}`);
			}
			return data;
		} catch (error) {
			console.log(error);
		}
	}
	async function flashMicrobit(fichier: string, destination: string) {
		// flash un fichier sur une ou plusieurs microbit. S'il y a plusieurs destination les chemins doivent être séparés par une espace
		// https://github.com/ntoll/uflash

		const { spawn } = require('child_process');
		const args = "uflash " + fichier + " " + destination;
		const child = spawn("powershell.exe", [args]);

		try {
			vscode.window.showInformationMessage(i18n.t('extension.its_a_long_operation_wait_for_the_end_of_process_information_bottom_right_of_the_screen_to_continue'))
			microbitFileProvider.MicroBitOutput.appendLine(i18n.t('extension.its_a_long_operation_wait_for_the_end_of_process_information_bottom_right_of_the_screen_to_continue'));
			microbitFileProvider.MicroBitOutput.show(true);//ne prend pas le focus
			let data = "";
			for await (const chunk of child.stdout) {
				console.log('stdout: ' + chunk);
				data += chunk;
				if (fichier != "") {
					vscode.window.showInformationMessage(`${fichier} send to ${destination}, ${fichier} ${destination}`);
				}
				else {
					vscode.window.showInformationMessage(i18n.t('extension.firmware_correctly_send'));
					microbitFileProvider.MicroBitOutput.appendLine(i18n.t('extension.firmware_correctly_send'));
					microbitFileProvider.MicroBitOutput.show(true);//ne prend pas le focus
				}
			}
			let error = "";
			for await (const chunk of child.stderr) {
				console.error('stderr: ' + chunk);
				error += chunk;
				vscode.window.showErrorMessage(error);
			}
			const exitCode = await new Promise((resolve, reject) => {
				child.on('close', resolve);
			});
			if (exitCode) {
				throw new Error(`subprocess error exit ${exitCode}, ${error}`);
			}
			return data;
		} catch (error) {
			console.log(error);
		}
	}
}
function updatePythonExtraPaths(cheminExtension: string) {
	//* Chemin des stubs
	// TODO Revoir ici le __dirname qui est sans doute déprécié
	// TODO « python.analysis.extraPaths » est-il nécessaire ? (Additional import search resolution paths)
	// Change le chemin des stubs en fonction de la langue locale. Si la traduction n'existe pas passe en anglais. Possibilité de forcer la langue à l'anglais dans les paramètres de l'extension.

	let cheminStub = "stubs-electropol-" + env.language.toLocaleLowerCase();
	if (!fs.existsSync(path.join(cheminExtension, cheminStub)) || vscode.workspace.getConfiguration().get("Microbit-Explorer.forceStubsEn")) {
		cheminStub = "stubs-electropol-en";
	}
	let cheminStubMicrobit = path.join(cheminExtension, cheminStub, "lib"); // __dirname = Chemin du script en cours
	let cheminStubMicroPython = path.join(cheminExtension, cheminStub, "micropython"); // __dirname = Chemin du script en cours

	// Ne laisse qu'un seul extraPaths qui pointe vers ces stubs
	//1- autocomplete
	let extraPathsInitial: String[] = vscode.workspace.getConfiguration().get("python.autoComplete.extraPaths");
	let extraPathsFinal: String[] = [cheminStubMicrobit, cheminStubMicroPython];
	for (var i in extraPathsInitial) {
		if (!extraPathsInitial[i].includes("stubs-electropol")) {
			extraPathsFinal.push()
			extraPathsFinal.push(extraPathsInitial[i]);
		}
	}
	vscode.workspace.getConfiguration("python.autoComplete").update("extraPaths", extraPathsFinal, vscode.ConfigurationTarget.Global);
	//2- analysis
	extraPathsInitial = vscode.workspace.getConfiguration().get("python.analysis.extraPaths");
	extraPathsFinal = [cheminStubMicrobit, cheminStubMicroPython];
	for (var i in extraPathsInitial) {
		if (!extraPathsInitial[i].includes("stubs-electropol")) {
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
function showPinMap(cheminExtension): any {
	const titre = i18n.t('extension.micro_bit_pins')
	const panel = vscode.window.createWebviewPanel(
		i18n.t('extension.pins'),
		titre,
		vscode.ViewColumn.Active, {
	});
	const imagePinOut = panel.webview.asWebviewUri(vscode.Uri.file(Utils.joinPath(cheminExtension, "image", i18n.t('extension.pinoutv2v1_png')).fsPath));
		
	let CodeHTML =`
	<!DOCTYPE html>
	<html>
		<head>
			<meta charset="UTF-8">
			<title>${titre}</title>
		</head>
		<body>
			<img src="${imagePinOut}"/>
		</body>
	</html>`;
	panel.webview.html = CodeHTML;



}


// this method is called when your extension is deactivated
export function deactivate() { }


