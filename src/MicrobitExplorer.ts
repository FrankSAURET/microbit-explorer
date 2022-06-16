import * as vscode from 'vscode';
import * as path from 'path';
import { commands, Uri } from 'vscode';
import i18n from './i18n';
import internal = require('stream');
import { disconnect } from 'process';
import { connect } from 'http2';

const fs = require('fs').promises;
const { SerialPort } = require('serialport');
var events = require('events');

export class MicrobitFileProvider implements vscode.TreeDataProvider<MicrobitFile> {
	private serialPort;
	private buff = "";
	private files = null;
	private eventHasData = new events.EventEmitter();
	// private clearComments: boolean = vscode.workspace.getConfiguration("microbit").get("clearComments");
	private forceSave: boolean = vscode.workspace.getConfiguration("microbit").get("forceSave");
	private WaitForReset = false;
	private Log2Output = true;
	MicroBitOutput;
	private microbitPrete: boolean = false;
	private noFile: string = i18n.t('MicrobitExplorer.no_file');
	// MicroBitTerminal;
	private premierAffichageErreur;
	private versionMicroPython: string = "";
	private erreurTrans: number = 0;

	private _onDidChangeTreeData: vscode.EventEmitter<MicrobitFile | undefined | void> = new vscode.EventEmitter<MicrobitFile | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<MicrobitFile | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string | undefined) {
		this.MicroBitOutput = vscode.window.createOutputChannel("micro:bit", "output-microbit");
		this.testConnexion();
		// this.ResetMicroBit();
		// this.term = vscode.window.createTerminal("micro:bit");
		// this.MicroBitOutput.append || appendline || clear || replace ||
		// https://code.visualstudio.com/api/references/vscode-api#OutputChannel
		// https://code.visualstudio.com/api/references/vscode-api#Terminal
	};
	//#region Liaison (View Model)
	public async testConnexion() {
		await this.Connect();

		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.error') + i18n.t('MicrobitExplorer.you_must_connect_micro_bit_board_to_continue'));
			this.MicroBitOutput.show(true);//ne prend pas le focus
			this.microbitPrete = false;
		}
		else {
			this.premierAffichageErreur = true;
			await this.ResetMicroBit();
			await this.ResetMicroBit();
			let versionmimi = this.versionMicroPython.split(";");
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.info') + versionmimi[0].trim());
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.info') + versionmimi[1].trim());
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.starting') + i18n.t('MicrobitExplorer.micro-bit-is-now-ready'));
			this.MicroBitOutput.show(true);//ne prend pas le focus
			this.microbitPrete = true;
		}

	}
	public async sendFileToMicrobit(fileUri: vscode.Uri, clearComments: string) {//@note sendFileToMicrobit
		let PyFile;
		let PyFileShort;
		if (fileUri == null) {
			if (this.forceSave) {
				await vscode.window.activeTextEditor.document.save();
			}
			PyFile = vscode.window.activeTextEditor.document.fileName;
			PyFileShort = "main.py";
		}
		else {
			PyFile = fileUri.fsPath;
			PyFileShort = PyFile.split('\\').pop().split('/').pop();
		}
		let extension: string = PyFile.split('.').pop();
		if (extension.toLowerCase() != "py") {
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.selected_file_must_be_a_py_file'));
			this.MicroBitOutput.show(true);//ne prend pas le focus
		}
		else {
			await this.Connect();
			await this.ResetMicroBit();
			await this.UploadFile(PyFile, PyFileShort, clearComments);
			this.premierAffichageErreur = true;
			await this.ResetMicroBit(PyFile.split('\\').pop().split('/').pop());
			this.MicroBitOutput.show(true);//ne prend pas le focus
		}
	}
	public sendCleanedFileToMicrobit(fileUri: vscode.Uri) {
		this.sendFileToMicrobit(fileUri, i18n.t('package.respect_the_lines'));
	}
	public simulMicrobit() {
		vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.not_yet_implemented'));
	}
	//#endregion

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}
	getTreeItem(element: MicrobitFile): vscode.TreeItem {
		return element;
	}
	getChildren(element?: MicrobitFile): Thenable<MicrobitFile[]> {
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			console.log("i18n.t('MicrobitExplorer.micro_bit_isnt_connected')");
			return Promise.resolve([]);
		}
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.no_dependency_in_empty_workspace'));
			return Promise.resolve([]);
		}

		return Promise.resolve(this.GetFilesFromMicrobit());
	}
	public async ResetMicroBit(fichierSource?: string): Promise<void> {
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.micro_bit_isnt_connected'));
			this.MicroBitOutput.show(true);//ne prend pas le focus
			return null;
		} else {
			await this.StopRunning();
			await this.SendAndRecv("import machine\r\n", false);
			await this.SendAndRecv("machine.reset()\r\n", false, undefined, fichierSource);
			await this.refresh();
			return;
		}
	}
	// public async ResetDevice(): Promise<void> {
	// 	if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
	// 		this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.micro_bit_isnt_connected'));
	// 			this.MicroBitOutput.show(true);//ne prend pas le focus
	// 		return null;
	// 	}

	// 	let result = await vscode.window.withProgress({
	// 		location: vscode.ProgressLocation.Window,
	// 		cancellable: false,
	// 		title: i18n.t('MicrobitExplorer.reset_device')
	// 	}, async (progress) => {
	// 		progress.report({ increment: 0 });
	// 		let data = await this.SendAndRecv("\x04", true);
	// 		progress.report({ increment: 100 });
	// 		return data;
	// 	});
	// 	return result;
	// }
	public async StopRunning(): Promise<void> {
		if (typeof this.serialPort === "undefined") {
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.micro_bit_isnt_connected'));
			this.MicroBitOutput.show(true);//ne prend pas le focus
			return null;
		}
		let result = await vscode.window.withProgress({
			location: vscode.ProgressLocation.Window,
			cancellable: false,
			title: 'Stop Running'
		}, async (progress) => {
			progress.report({ increment: 0 });
			let data = await this.SendAndRecv("\x03", true);
			progress.report({ increment: 100 });
			return data;
		});
		return result;
	}
	public async uploadFiles(): Promise<void> {
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.micro_bit_isnt_connected'));
			this.MicroBitOutput.show(true);//ne prend pas le focus
			return;
		}
		if (!this.workspaceRoot) {
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.no_dependency_in_empty_workspace'));
			this.MicroBitOutput.show(true);
			return;
		}
		await this.StopRunning();
		this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.info') + i18n.t('MicrobitExplorer.all_files_are_uploaded'));
		this.MicroBitOutput.show(true);//ne prend pas le focus
		await this.refresh();
		this.WaitForReset = true;
	}

	public async DisconnectDevice(): Promise<void> {
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			console.log("i18n.t('MicrobitExplorer.micro_bit_isnt_connected')");
			return;
		}
		await this.serialPort.close();
		this.refresh();
	}
	public async downloadFiles(): Promise<void> {
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.micro_bit_isnt_connected'));
			this.MicroBitOutput.show(true);//ne prend pas le focus
			return;
		}
		if (!this.workspaceRoot) {
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.no_dependency_in_empty_workspace'));
			this.MicroBitOutput.show(true);//ne prend pas le focus
			return;
		}

		await this.StopRunning();

		for (const element of this.files) {
			console.log("i18n.t('MicrobitExplorer.begin_read')" + element.filename)
			await this.DownloadFile(element.filename, path.join(this.workspaceRoot, element.filename))
			console.log("i18n.t('MicrobitExplorer.end_read')" + element.filename)

		}
		vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.downloaded_all_file'));
	}
	public async deleteFile(node: MicrobitFile): Promise<void> {
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.micro_bit_isnt_connected'));
			this.MicroBitOutput.show(true);//ne prend pas le focus
			return;
		}
		await this.StopRunning();
		await this.SendAndRecv("import os\r\n", false);
		await this.SendAndRecv("os.remove('" + node.filename + "')\r\n", false);
		this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.done_0') + i18n.t('MicrobitExplorer.the_file_0_has_been_deleted', node.filename));
		await this.refresh();
	}
	public async Connect(): Promise<void> {
		//this.MicroBitOutput.clear();
		if (!this.workspaceRoot) {
			vscode.window.showWarningMessage(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.please_open_folder_or_workspace'));
			return
		}
		let numEssais = 0;
		let connectee = false;
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			await SerialPort.list().then(
				async ports => {
					for (const index in ports) {
						if (ports[index].productId === "0204" && ports[index].vendorId === "0D28") {
							console.log(i18n.t('MicrobitExplorer.try_connect'));
							if (await this.ConnectToMicrobit(ports[index].path) == true) {
								this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.info') + i18n.t('MicrobitExplorer.micro_bit_is_connected_to_serialpath', ports[index].path));
								this.MicroBitOutput.show(true);//ne prend pas le focus
								connectee = true
								return;
							}
						}
					}
					numEssais += 1;
					if (numEssais === 3 && !connectee) {
						//vscode.window.showWarningMessage(
						this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.dont_find_any_micro_bit'));
						this.MicroBitOutput.show(true);//ne prend pas le focus
						return;
					}
				},
				err => {
					//vscode.window.showWarningMessage(
					this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.error') + i18n.t('MicrobitExplorer.error_while_trying_to_connect'));
					this.MicroBitOutput.show(true);//ne prend pas le focus
				}

			);
		}
	}
	async DownloadFile(file: string, dest: string): Promise<void> {
		try {
			await this.SendAndRecv("f = open('" + file + "', 'r')\r\n", false);
			let content = await this.SendAndRecv("print(f.read())\r\n", false);
			await this.SendAndRecv("f.close()\r\n", false);
			await fs.writeFile(dest, content);
		}
		catch (e) {
			await this.SendAndRecv("f.close()\r\n", false);
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.error') + i18n.t('MicrobitExplorer.unable_to_download_0', file));
			this.MicroBitOutput.appendLine(e.message);
		}
	}
	async downloadThisFile(node: MicrobitFile): Promise<void> {
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.micro_bit_isnt_connected'));
			this.MicroBitOutput.show(true);//ne prend pas le focus
			return;
		}
		await this.StopRunning();
		let targetFile = path.join(this.workspaceRoot, node.filename);
		//Vérifie l'existence d'un fichier avant de l'écraser
		await fs.access(targetFile, fs.F_OK, async (err) => {
			if (err) {
				await this.DownloadFile(node.filename, targetFile);
				await commands.executeCommand('vscode.open', Uri.file(targetFile));
			}
			else {
				let oui = i18n.t('MicrobitExplorer.yes');
				let non = i18n.t('MicrobitExplorer.no');
				let nomFichier = node.filename;

				vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.warning_file_nomfichier_already_exists_do_you_want_to_overwrite_it', node.filename), oui, non).
					then(async selection => {
						await this.DownloadFile(node.filename, targetFile);
						await commands.executeCommand('vscode.open', Uri.file(targetFile));
					});

			}
		});
	}
	async UploadFile(file: string, target: string, clearComments): Promise<void> {//@note UploadFile
		let result: string;
		let fileShort = file.split('\\').pop().split('/').pop();
		const fichierDeSortie: string[] = await this.traiteFichier(file, clearComments);
		try {
			await this.SendAndRecv("f = open('" + target + "', 'w')\r\n", false);
			result = await this.SendAndRecv("f.write(b'" + fichierDeSortie.join("\\x0A") + "')\r\n", false, 1000);
			let NombreDeCaractere = parseInt(result, 10);
			if (isNaN(NombreDeCaractere)) throw new Error(i18n.t('MicrobitExplorer.bad_response_from_the_micro_bit_try_again_to_send_your_file'));
			await this.SendAndRecv("f.close()\r\n", false);
			//await this.ResetMicroBit();
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.done_0') + i18n.t('MicrobitExplorer.file_fileshort_is_now_on_micro_bit_target_on_this_serialport_path', fileShort, target, this.serialPort.path));
			if (clearComments === i18n.t('package.delete_everything')) { this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.all_comments_and_blank_lines_have_been_removed')) }
			if (clearComments === i18n.t('package.respect_the_lines')) { this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.warning') + i18n.t('MicrobitExplorer.the_comments_have_been_removed_but_the_line_numbering_has_been_respected')) }
		}
		catch (e) {
			result = await this.SendAndRecv("f.close()\r\n", false);
			this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.error') + i18n.t('MicrobitExplorer.error_unable_to_send_fileshort_to_micro_bit', fileShort));
			this.MicroBitOutput.appendLine("-------> " + e.message);
			//this.ResetMicroBit();
		}
	}
	async UploadEmptyFile(): Promise<void> {
		let result: string;
		try {
			await this.SendAndRecv("f = open('" + this.noFile + "', 'w')\r\n", false);
			result = await this.SendAndRecv("f.write(b'')\r\n", false, 1000);
			await this.SendAndRecv("f.close()\r\n", false);
		}
		catch (e) {
			result = await this.SendAndRecv("f.close()\r\n", false);
		}
	}
	async traiteFichier(file, clearComments): Promise<string[]> {
		let commentaire: boolean = false;
		let ligneVide: boolean = false;
		const fs2 = require('fs');
		const fichierDeSortie: string[] = [];

		const data = fs2.readFileSync(file, {
			encoding: "utf8"
		});
		const temp = data.split("\n");
		temp.forEach((line) => {
			if (clearComments === i18n.t('package.delete_everything')) {
				line = line.trimEnd();// Suppression des espaces en fin  de ligne
				line = line.replace(/#.*/g, ""); // Suppression des commentaires mono ligne #
				line = line.replace(/^\s*"{3}(.+?)"{3}/g, ""); // Suppression des commentaires mono ligne """
				if (line.match(/^\s*"{3}/) && !commentaire) {// Suppression des commentaires multi ligne
					commentaire = true;
					line = line.replace(/"{3}.*/, "");
				}
				if (line.match(/"{3}/) && commentaire) {// Suppression des commentaires multi ligne
					commentaire = false;
					line = line.replace(/.*"{3}/, "");
				}
				line.trimStart() == "" ? ligneVide = true : ligneVide = false

				if (!commentaire && !ligneVide) {
					line = line.trimEnd();// Suppression des espaces en fin  de ligne
					line = line.replace(/'/g, "\\x27");
					fichierDeSortie.push(line);
				}
			}
			else if (clearComments === i18n.t('package.respect_the_lines')) {
				line = line.trimEnd();// Suppression des espaces en fin  de ligne
				line = line.replace(/#.*/g, ""); // Suppression des commentaires mono ligne #
				line = line.replace(/^\s*"{3}(.+?)"{3}/g, ""); // Suppression des commentaires mono ligne """
				if (line.match(/^\s*"{3}/) && !commentaire) {// Suppression des commentaires multi ligne
					commentaire = true;
					line = line.replace(/"{3}.*/, "");
				}
				if (line.match(/"{3}/) && commentaire) {// Suppression des commentaires multi ligne
					commentaire = false;
					line = line.replace(/.*"{3}/, "");
				}
				if (commentaire) {
					line = "";
				}
				line = line.trimEnd();// Suppression des espaces en fin  de ligne
				fichierDeSortie.push(line);
			}

		});
		return fichierDeSortie;
	}
	async GetFilesFromMicrobit(): Promise<MicrobitFile[]> {

		await this.StopRunning();

		let data = await this.SendAndRecv("import os\r\n", false);
		data = eval(await this.SendAndRecv("os.listdir()\r\n", false));

		this.files = []
		for (const idx in data) {
			this.files = this.files.concat(new MicrobitFile(data[idx], vscode.TreeItemCollapsibleState.None));
		}
		if (this.files.length === 0) {
			await this.UploadEmptyFile();
		}
		else if (this.files.length > 1) {
			await this.StopRunning();
			await this.SendAndRecv("import os\r\n", false);
			await this.SendAndRecv("os.remove('" + this.noFile + "')\r\n", false);
		}
		this.files = []
		data = eval(await this.SendAndRecv("os.listdir()\r\n", false));
		for (const idx in data) {
			this.files = this.files.concat(new MicrobitFile(data[idx], vscode.TreeItemCollapsibleState.None));
		}
		if (this.WaitForReset) {
			this.WaitForReset = false;
			//this.ResetDevice();
			await this.ResetMicroBit();
		}

		return this.files
	}
	private async SendAndRecv(cmd: string, allowlog: boolean, timeout: number = 1000, fichierSource?: string): Promise<any> {//@note SendAndRecv
		this.Log2Output = allowlog;
		await this.serialPort.write(cmd);

		let data = await this.WaitForReady(timeout, fichierSource);
		//***** */
		// this.MicroBitOutput.appendLine("cmd : " + cmd);
		// this.MicroBitOutput.appendLine("data : "+data);
		// if (data.search(cmd.trim()) < 0 && cmd.length>1){
		// 	await this.serialPort.write(cmd);
		// 	data = await this.WaitForReady(timeout, fichierSource);
		// 	this.MicroBitOutput.appendLine("cmd 2 : " + cmd);
		// 	this.MicroBitOutput.appendLine("data 2 : " + data);
		// }
		//***** */
		this.Log2Output = true;
		if (data != null) {
			// Ensure remove unwanted data
			let result = data.substring(data.search(cmd) + cmd.length + 1);
			//this.MicroBitOutput.appendLine("result : " + result);


			let VUP = result.search("MicroPython");
			if (VUP > -1 && this.versionMicroPython === "") {
				const ligneErreur = result.split("\n");
				this.versionMicroPython = ligneErreur[0];
			}


			return result;
		}
		else
			return null;
	}
	private async WaitForReady(timeout: number = 1000, fichierSource: string = ""): Promise<any> {//@note WaitForReady
		return new Promise((resolve) => {
			// expect have data after send request
			let waitfordata = setTimeout(() => {
				clearTimeout(waitfordata);
				if (this.buff.length == 0) {
					console.log("Min Timeout")
					clearTimeout(wait);
					this.eventHasData.removeAllListeners('data');
					resolve(null);
				}
			}, 500);

			let wait = setTimeout(() => {
				console.log("Timeout");
				let result: string = this.buff;
				let debutMessageErreur = result.search("Traceback");
				if (debutMessageErreur > -1) {
					try {
						if (this.premierAffichageErreur) {
							if (fichierSource != "") { result = result.replace("__main__", fichierSource) }
							result = result.substring(debutMessageErreur);
							const ligneErreur = result.split("\n");
							ligneErreur.forEach((ligne, index) => {
								if (index === 1 && ligne.trim() != "") {
									ligne = ligne.replace("File", i18n.t('MicrobitExplorer.file'));
									ligne = ligne.replace("line", i18n.t('MicrobitExplorer.line'));
									this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.error') + ligne.trim());
								}
								if (index > 1 && ligne.trim() != "") { this.MicroBitOutput.appendLine("-------> " + ligne.trim()); }
								// *****************************************
								// Ajouter traduction erreur python
								// 	*****************************************
							});
							this.premierAffichageErreur = false;
						}

					} finally {
						this.eventHasData.removeAllListeners('data');
						clearTimeout(waitfordata);
						clearTimeout(wait);
						resolve(null);
					}
					
				}
			}, timeout);

			this.eventHasData.on("data", function (this: any) {
				if (this.buff != null) {
					if (this.buff.search(">>> ") > -1) {
						clearTimeout(wait);
						clearTimeout(waitfordata);
						this.eventHasData.removeAllListeners('data');
						let data = this.buff.substring(0, this.buff.search("\r\n>>> "));
						this.buff = "";
						resolve(data);
					}
				}
			}.bind(this));
		});
	}
	private OnRecvData(): void {
		let data = this.serialPort.read();
		this.buff += data;
		this.eventHasData.emit("data")
	}
	private traiteErreur(chaineErreur: string): string {


		return
	}
	private async ConnectToMicrobit(serialpath: string): Promise<boolean> {
		if (this.serialPort && this.serialPort.isOpen) {
			//console.log(i18n.t('MicrobitExplorer.micro_bit_is_connected_and_trying_to_list_files'));
			return;
		}
		console.log(i18n.t('MicrobitExplorer.connecting_to_serialpath', serialpath));
		this.serialPort = new SerialPort({ path: serialpath, baudRate: 115200 });
		this.serialPort.on('readable', this.OnRecvData.bind(this));
		this.serialPort.on('close', function () { this.DisconnectDevice(); }.bind(this));

		let result = await this.StopRunning();

		if (result == null) {
			this.serialPort.close();
			return false;
		}
		else {
			this.refresh();
			return true;
		}

	}
}
export class MicrobitFile extends vscode.TreeItem {

	constructor(
		public readonly filename: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(filename, collapsibleState);
	}
	iconPath = {
		light: path.join(__filename, '..', '..', 'image', 'light', 'document.svg'),
		dark: path.join(__filename, '..', '..', 'image', 'dark', 'document.svg')
	};
	contextValue = 'MicrobitFile';
}