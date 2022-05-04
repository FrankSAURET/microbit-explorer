import * as fs from 'fs'
import * as path from 'path'
import { env } from 'vscode'
import * as vscode from 'vscode';

export default class i18n {
  static language = env.language.toLocaleLowerCase()
  static messages: Record<string, string> = {}

  static init(extensionPath: string) {
    let name = `${this.language}.json`
    let cheminI18n:string = 'locales'; //Changer le chemin si nécessaire
    if (!fs.existsSync(path.join(extensionPath, cheminI18n, name)))
      name = 'en.json' // locale not exist, fallback to English

    this.messages = JSON.parse(fs.readFileSync(path.join(extensionPath, cheminI18n, name), 'utf-8'))
  }

  static format(str: string, args: any[]) {
    return str.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] !== 'undefined'
        ? args[number].toString()
        : match
    })
  }

  static t(key: string, ...args: any[]) {
    let text = this.messages[key] || ''

    if (args && args.length)
      text = this.format(text, args)

    return text
  }
}
