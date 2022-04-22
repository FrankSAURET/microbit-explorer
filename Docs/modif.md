## Suppression de fichier
* azure-pipelines.yml
## Package.json


	"scripts": {
		"vscode:prepublish": "npm install && npm run compile",
		"compile": "tsc -p ./",
		"lint": "eslint . --ext .ts,.tsx",
		"watch": "tsc -watch -p ./",
		"install": "electron-rebuild",
		"pretest": "npm run compile",
		"test": "node ./out/test/runTest.js",
		"deploy": "vsce publish --yarn"
	},
**Vers**

	"scripts": {
		"vscode:prepublish": "npm run compile",
		"compile": "tsc -p ./",
		"lint": "eslint . --ext .ts,.tsx",
		"watch": "tsc -watch -p ./",
		"pretest": "npm run compile",
		"test": "node ./out/test/runTest.js"
	},
## launch.json
	"version": "0.2.0",
	"configurations": [{
			"name": "Run Extension",
			"type": "extensionHost",
			"request": "launch",
			"runtimeExecutable": "${execPath}",
			"args": [
				"--extensionDevelopmentPath=${workspaceFolder}",
				"--enable-proposed-api",
                "vscode-samples.custom-view-samples"
			],
			"stopOnEntry": false,
            "sourceMaps": true,
			"outFiles": [
				"${workspaceFolder}/out/**/*.js"
			],
			"preLaunchTask": "npm: watch"
		}
	]
**Vers**

	"configurations": [
		{
			"name": "Run Extension",
			"type": "extensionHost",
			"request": "launch",
			"args": [
				"--extensionDevelopmentPath=${workspaceFolder}"
			],
			"outFiles": [
				"${workspaceFolder}/out/**/*.js"
			],
			"preLaunchTask": "${defaultBuildTask}"
		},
		{
			"name": "Extension Tests",
			"type": "extensionHost",
			"request": "launch",
			"args": [
				"--extensionDevelopmentPath=${workspaceFolder}",
				"--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
			],
			"outFiles": [
				"${workspaceFolder}/out/test/**/*.js"
			],
			"preLaunchTask": "${defaultBuildTask}"
		}
	]

