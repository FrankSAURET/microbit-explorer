# Change Log
## [0.2.5] -  juin 2022
* Ajout d'un commande permettant d'affihcer le brochage de la micro:bit.
## [0.2.4] - 22 juin 2022
* Fait une vérification de la connexion avant d'afficher microbit prêt.
* Permet la mise à jour du firmware.
* Affiche "Pas de fichier" si la microbit est vide.
* Correction de bugs dans le retour d'erreur et amélioration des messages retournés.
* Affiche la version micropython et la version micro:bit au démarrage.
* Le retour d'erreur est maintenant coloré, traduit et simplifié. Je ferais évoluer la traduction française pour la rendre plus pédagogique mais pas la version anglaise.
* Propose une option permettant de Garder des lignes vides lors de la suppression des commentaires et mettre cet envoie par défaut (Supprimer lignes vides et commentaires/Supprimer les commentaires/Garder tout).
* Traduction du readme.
### Bug
* Un bug se produit systématiquement lors de la correction d'une erreur. Je l'ai intercepté et signalé mais je n'arrive pas à le corriger. Néanmoins un renvoi du fichier corrigé (plusieurs fois éventuellement) résous toujours le problème.
## [0.2.3] - 06 juin 2022
* Traduction de l'interface en français.
* Ajoût d'icônes dans le texte pour augmenter la lisibilité.
## [0.2.1] - 24 avril 2022
* Change le chemin des stubs en fonction de la langue locale. Si la traduction n'existe pas, passe en anglais. Possibilité de forcer la langue à l'anglais dans les paramètres de l'extension.
* Début de la traduction  des commentaires micropython en  français (microbit et neopixel seulement).
## [0.2.0] - 21 avril 2022
* Réinsertion de microbit explorer.
* Microbit-fr et microbit-explorer seront désormais une seul extension que je relocaliserais sur le repo de microbit-explorer.
## [0.1.1] - 24 mars 2022
* Limitation de l'activation sur les programmes python.
## [0.0.2] - 20 mars 2022
* Ajout d'une configuration pour supprimer tous les commentaires et toutes les lignes vides lors de l'envoie. Désactivé par défaut.
* Ajout d'une entrée de menu contextuel de l'explorateur qui nettoie le fichier avant de l'envoyer.
* Le retour d'erreur s'affiche dans la console de sortie.
* Ajout des stubs pour micropython.
## [0.0.1] - 17 février 2022
* Stubs fonctionnels.
* Chargement rapide dans le main.py.
# Todo
* ??? Implémenter le flashage ???. Voir ce que ça apporte notamment, est-il possible de compiler un hex avec plusieurs modules et de l'envoyer. voir si ça produit un fichier minimaliste.
* Implémenter la simulation.
* Afficher les icônes seulement si on est sur un fichier microbit (qui contient from microbit import * ou import microbit). Créer un langage ? https://code.visualstudio.com/api/references/contribution-points#contributes.languages 
* Sélectionner les boutons à afficher.
* La fonction sélection du port devant s'imposer comme port de connexion  pour toutes les autres commandes - ouvrir un panneau de connexion qui permet d'identifier toutes les microbit connectées et d'afficher leur port de connexion sur chacune.
* nettoyer les trucs inutiles.
* Faire un pas à pas.
* Faire un lien dans le retour d'erreur avec le programme local.
* ???Ajouter une fonctionnalité de renomage dans l'explorateur.???
* Implémenter le glisser déposer pour upload et download.
* ??? Déplacement du bouton "télécharger tous les fichier" dans l'explorateur PC.???
* Afficher une liste d'exemple.
* Un bug se produit si l'explorateur micro:bit est ouvert dans le paneau de droite.





