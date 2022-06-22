import * as vscode from 'vscode';
import * as path from 'path';
//import Niveau1 as Niveau1 from 

export function translateError(stringToTranslate: string, pathToTranslationFile: string, separateur: string): string {
    /**
     * @summary Translate string in two level separated by "separateur".
     * @param {string} stringToTranslate - The string to translate
     * @param {string} pathToTranslationFile - The json file containing the translations. "level1" is "niveau1" and "level2" is "niveau2".
     * @param {string} separateur - The separator between to level in the string to translate. Typically ":" in micropython error.
     * @returns {string} - The translated string with originals parameters.
     */

    let jsonData = require(pathToTranslationFile);
    let Niveau1: string[] = jsonData.Niveau1;
    let Niveau2: string[] = jsonData.Niveau2;
    let N1Anglais = Object.keys(Niveau1)
    let N2Anglais = Object.keys(Niveau2)
    let chaineON1: string = stringToTranslate.split(separateur)[0];
    let chaineON2: string = stringToTranslate.split(separateur)[1];
    let chaineTN1: string = Niveau1[chaineON1];
    let chaineTN2: string = Niveau2[chaineON2];

    N2Anglais.forEach((anglais: string) => {
        // déspécialisation de tous les caractères spéciaux dans la regex
        let caractereSpéciauxRegex: string[] = ['?', '/', '\\', '[', ']', '{', '}', '(', ')', '+', '*', '|']
        caractereSpéciauxRegex.forEach((car: string) => {
            anglais = anglais.replace(car, "\\" + car);
        });
        //Remplacement des ❰param❱ dans la regex
        let re = /❰[^❱]*❱/g;
        let regex = new RegExp(anglais.replace(re, ".*"))
        let index: number[] = [];
        let longueurBout: number[] = [];

        if (regex.test(chaineON2)) {
            //Découpage en bout de chaine entre ❰param❱
            let ch1 = anglais.replace(re, "€€€");
            let chaineATraiter = ch1.split("€€€");
            let nombreParam = chaineATraiter.length - 1;
            // remplacement des ❰param❱ dans la chaine traduite
            chaineATraiter.forEach((boutDeChaine: string) => {
                longueurBout.push(boutDeChaine.length);
                index.push(chaineON2.search(boutDeChaine));
            });
            chaineTN2 = Niveau2[anglais];
            for (let j = 0; j < nombreParam; j++) {
                let debut = longueurBout[j] + index[j];
                let fin = index[j + 1];
                let paramCourant = chaineON2.substring(debut, fin);
                let numParam = j + 1;
                let regex2 = new RegExp("❰param" + numParam + "❱", 'g');
                chaineTN2 = chaineTN2.replace(regex2, paramCourant);
            }
        }
    });
    return chaineTN1 + separateur + chaineTN2;
}
