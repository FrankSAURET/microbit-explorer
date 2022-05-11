import * as vscode from 'vscode';
import * as path from 'path';
import { commands, Uri } from 'vscode';
import i18n from './i18n';

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
	private MicroBitOutput;
	private microbitPrete: boolean = false;
	//private term;

	private _onDidChangeTreeData: vscode.EventEmitter<MicrobitFile | undefined | void> = new vscode.EventEmitter<MicrobitFile | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<MicrobitFile | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string | undefined) {
		this.MicroBitOutput = vscode.window.createOutputChannel("micro:bit");
		this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.micro-bit-is-now-ready'));
		this.MicroBitOutput.show(true);//ne prend pas le focus
		console.log(i18n.t('MicrobitExplorer.micro-bit-is-now-ready'));
		this.microbitPrete = true;
		//this.term = vscode.window.createTerminal("Terminal micro:bit");
		// this.MicroBitOutput.append || appendline || clear || replace ||
		// https://code.visualstudio.com/api/references/vscode-api#OutputChannel
	};
	//#region Liaison (View Model)
	public async sendFileToMicrobit(fileUri: vscode.Uri, clearComments:boolean) {
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
			vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.selected_file_must_be_a_py_file'));
		}
		else {
			await this.Connect();
			await this.UploadFile(PyFile, PyFileShort,clearComments);//@note sendFileToMicrobit
			await this.ResetMicroBit();
			this.MicroBitOutput.show(true);//ne prend pas le focus
		}
	}
	public sendCleanedFileToMicrobit(fileUri: vscode.Uri) {
		this.sendFileToMicrobit(fileUri,true);
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
			vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.no_dependency_in_empty_workspace_0'));
			return Promise.resolve([]);
		}

		return Promise.resolve(this.GetFilesFromMicrobit());
	}
	public async ResetMicroBit(): Promise<void> {//@note ResetMicroBit
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.micro_bit_isnt_connected'));
			return;
		}

		await this.StopRunning();

		await this.SendAndRecv("import machine\r\n", false);
		let result = await this.SendAndRecv("machine.reset()\r\n", false);
		if (result != null) {
			if (result.search("Traceback") > -1) {
				this.MicroBitOutput.appendLine(result);
			}
			else {
				this.MicroBitOutput.appendLine(i18n.t('MicrobitExplorer.micro_bit_reset_done'))
			}
		}
		//this.MicroBitOutput.show();
		//}
		await this.refresh();
	}
	public async ResetDevice(): Promise<void> {
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.micro_bit_isnt_connected'));
			return null;
		}

		let result = await vscode.window.withProgress({
			location: vscode.ProgressLocation.Window,
			cancellable: false,
			title: i18n.t('MicrobitExplorer.reset_device')
		}, async (progress) => {

			progress.report({ increment: 0 });

			let data = await this.SendAndRecv("\x04", true);

			progress.report({ increment: 100 });
			return data;
		});
		return result;
	}
	public async StopRunning(): Promise<void> {
		if (typeof this.serialPort === "undefined") {
			vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.micro_bit_isnt_connected'));
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
			vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.micro_bit_isnt_connected'));
			return;
		}
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.no_dependency_in_empty_workspace'));
			return;
		}
		await this.StopRunning();
		vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.all_files_are_uploaded'));
		await this.refresh();
		this.WaitForReset = true;
	}
	
	public async DisconnectDevice(): Promise<void> {
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			console.log("i18n.t('MicrobitExplorer.micro_bit_isnt_connected')");
			return;
		}
		this.serialPort.close();
		this.refresh();
	}
	public async downloadFiles(): Promise<void> {
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.micro_bit_isnt_connected'));
			return;
		}
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage(i18n.t('MicrobitExplorer.no_dependency_in_empty_workspace'));
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
			vscode.window.showInformationMessage("i18n.t('MicrobitExplorer.micro_bit_isnt_connected')");
			return;
		}

		await this.StopRunning();

		await this.SendAndRecv("import os\r\n", false);
		await this.SendAndRecv("os.remove('" + node.filename + "')\r\n", false);
		await this.refresh();
	}
	public async Connect(): Promise<void> {
		this.MicroBitOutput.clear();
		if (!this.workspaceRoot) {
			vscode.window.showWarningMessage('i18n.t('MicrobitExplorer.please_open_folder_or_workspace')');
			return
		}
		if (!this.microbitPrete) {
			vscode.window.showWarningMessage('i18n.t('MicrobitExplorer.wait_a_minute_please')');
			return
		}

		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			await SerialPort.list().then(
				async ports => {
					for (const index in ports) {
						if (ports[index].productId === "0204" && ports[index].vendorId === "0D28") {
							console.log("i18n.t('MicrobitExplorer.try_connect')");
							if (await this.ConnectToMicrobit(ports[index].path) == true) {
								return;
							}
						}
					}
					console.log("i18n.t('MicrobitExplorer.done')");
					vscode.window.showWarningMessage("i18n.t('MicrobitExplorer.dont_find_any_micro_bit')");
				},
				err => {
					vscode.window.showWarningMessage("i18n.t('MicrobitExplorer.dont_find_any_micro_bit')");
				}

			);
		}
	}
	async DownloadFile(file: string, dest: string): Promise<void> {
		let result = await this.SendAndRecv("f = open('" + file + "', 'r')\r\n", false);
		console.log('260' + result);

		let content = await this.SendAndRecv("print(f.read())\r\n", false);

		result = await this.SendAndRecv("f.close()\r\n", false);
		console.log('265' + result);

		await fs.writeFile(dest, content);
	}
	async downloadThisFile(node: MicrobitFile): Promise<void> {
		//@note downLoadThisFile
		if (typeof this.serialPort === "undefined" || !this.serialPort.isOpen) {
			vscode.window.showInformationMessage("i18n.t('MicrobitExplorer.micro_bit_isnt_connected')");
			return;
		}
		await this.StopRunning();
		let targetFile = path.join(this.workspaceRoot, node.filename);
		//@rappel Vérifier l'existence d'un fichier avant de l'écraser
		await fs.access(targetFile, fs.F_OK, async (err) => {
			if (err)
			{
				await this.DownloadFile(node.filename, targetFile);
				await commands.executeCommand('vscode.open', Uri.file(targetFile)); }
			else {
				let oui = 'i18n.t('MicrobitExplorer.yes')';
				let non = 'i18n.t('MicrobitExplorer.no')';
				let nomFichier = node.filename;

				vscode.window.showInformationMessage(`i18n.t('MicrobitExplorer.warning_file_nomfichier_already_exists_do_you_want_to_overwrite_it')`, oui, non).
					then(async selection => {
						await this.DownloadFile(node.filename, targetFile);
						await commands.executeCommand('vscode.open', Uri.file(targetFile));
					});

			}
		});
	}
	async UploadFile(file: string, target: string, clearComments): Promise<void> {
		//@note UploadFile3
		let result: string;
		let fileShort = file.split('\\').pop().split('/').pop();
		const fichierDeSortie: string[] = await this.traiteFichier(file, clearComments);

		try {
			await this.SendAndRecv("f = open('" + target + "', 'w')\r\n", false);
			result = await this.SendAndRecv("f.write(b'" + fichierDeSortie.join("\\x0A") + "')\r\n", false, 1000);
			let NombreDeCaractere = parseInt(result, 10);
			if (isNaN(NombreDeCaractere)) throw new Error("i18n.t('MicrobitExplorer.this_is_not_a_number')");
			await this.SendAndRecv("f.close()\r\n", false);
			this.MicroBitOutput.appendLine(`i18n.t('MicrobitExplorer.file_fileshort_is_now_on_micro_bit_target_on_this_serialport_path')`);
			if (clearComments) { this.MicroBitOutput.appendLine("i18n.t('MicrobitExplorer.all_comments_and_blank_lines_have_been_removed')")}
		}
		catch (e) {
			result = await this.SendAndRecv("f.close()\r\n", false);
			//this.MicroBitOutput.appendLine("277" + result);
			this.MicroBitOutput.appendLine(`i18n.t('MicrobitExplorer.error_unable_to_send_fileshort_to_micro_bit')`);
		}
	}
	async traiteFichier(file, clearComments): Promise<string[]> {
		//@note traiteFichier
		let commentaire: boolean = false;
		let ligneVide: boolean = false;
		const fs2 = require('fs');
		const fichierDeSortie: string[] = [];

		const data = fs2.readFileSync(file, {
			encoding: "utf8"
		});
		const temp = data.split("\n");
		temp.forEach((line) => {
			if (clearComments) {
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
			}
			if (!commentaire && !ligneVide) {
				line = line.trimEnd();// Suppression des espaces en fin  de ligne
				line = line.replace(/'/g, "\\x27");
				//line = line + "\\x0A";
				fichierDeSortie.push(line);
			}
		});
		return fichierDeSortie;
	}
	async GetFilesFromMicrobit(): Promise<MicrobitFile[]> {

		await this.StopRunning();

		let data = await this.SendAndRecv("import os\r\n", false);
		data = eval(await this.SendAndRecv("os.listdir()\r\n", false));
		console.log('332' + data)

		this.files = []
		for (const idx in data) {
			this.files = this.files.concat(new MicrobitFile(data[idx], vscode.TreeItemCollapsibleState.None));
		}

		if (this.WaitForReset) {
			this.WaitForReset = false;
			this.ResetDevice();
		}

		return this.files
	}
	private async SendAndRecv(cmd: string, allowlog: boolean, timeout: number = 1000): Promise<any> {
		this.Log2Output = allowlog;
		this.serialPort.write(cmd);

		let data = await this.WaitForReady(timeout);
		this.Log2Output = true;
		if (data != null) {
			// Ensure remove unwanted data
			let result = data.substring(data.search(cmd) + cmd.length + 1);
			return result;
		}
		else
			return null;
	}
	private async WaitForReady(timeout: number = 1000): Promise<any> {
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
				try {
					let messageErreur = "Traceback " + this.buff.split("Traceback").pop();
					this.MicroBitOutput.appendLine(messageErreur);
				} finally {
					this.eventHasData.removeAllListeners('data');
					clearTimeout(waitfordata);
					clearTimeout(wait);
					resolve(null);
				}
			}, timeout);

			this.eventHasData.on("data", function (this: any) {
				if (this.buff != null) {
					if (this.buff.search(">>> ") > -1) {
						clearTimeout(wait);
						clearTimeout(waitfordata);
						this.eventHasData.removeAllListeners('data');
						let data = this.buff.substring(0, this.buff.search("\r\n>>> "));
						if (this.Log2Output && data != "") {
							this.MicroBitOutput.append(data);
						}
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
			console.log('i18n.t('MicrobitExplorer.micro_bit_is_connected_and_trying_to_list_files')');
			return;
		}
		console.log(`i18n.t('MicrobitExplorer.connecting_to_serialpath')`);
		this.serialPort = new SerialPort({ path: serialpath, baudRate: 115200 });
		this.serialPort.on('readable', this.OnRecvData.bind(this));
		this.serialPort.on('close', function () { this.DisconnectDevice(); }.bind(this));

		let result = await this.StopRunning();

		if (result == null) {
			this.serialPort.close();
			vscode.window.showErrorMessage(`i18n.t('MicrobitExplorer.cannot_connect_to_serialpath')`);
			return false;
		}
		else {
			vscode.window.showInformationMessage(`i18n.t('MicrobitExplorer.micro_bit_is_connected_to_serialpath')`);
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