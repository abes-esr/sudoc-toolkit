# SudocToolkit

Une Interface utilisateur pour faire tourner les web services de l'Abes sans être développeur.

Application réalisée avec le framework Javascript [Electron](https://electronjs.org/)

![Exemple](assets/img/example.jpg)

Les web services utilisés : 

1. [isbn2ppn](http://documentation.abes.fr/sudoc/manuels/administration/aidewebservices/index.html#isbn2ppn) : renvoie le (ou les) ppn à partir d'un ISBN

2. [issn2ppn](http://documentation.abes.fr/sudoc/manuels/administration/aidewebservices/index.html#issn2ppn) : renvoie le (ou les) ppn à partir d'un ISSN

3. [merged](http://documentation.abes.fr/sudoc/manuels/administration/aidewebservices/index.html#merged) : renvoie le ppn actif (en cas de fusion de notices) à partir d'un ppn

4. [multiwhere](http://documentation.abes.fr/sudoc/manuels/administration/aidewebservices/index.html#multiwhere) : renvoie les RCR localisés à partir d'un ppn

## Installation

### Dernière mise à jour : octobre 2021

* Node v14.17.1
* Dernière version stable du framework Electron : 15.1.2
* Update de toutes les dépendances

### En mode développement dans l'environnement Node.js

* Cloner le dépôt : git clone https://github.com/abes-esr/SudocToolkit.git
* Installer les dépendances : npm install
* Lancer : npm run start
* Automatiser les mises à jour dans l'interface en cas de modification du code source (hot-reload) : décommenter la 1ère ligne require('electron-reload')(__dirname) dans main.js
* Debug avec les devtools : pour afficher la console automatiquement, décommenter cette ligne dans main.js : contents.openDevTools()
Sinon la console est accessible manuellement par le menu Affichage -> Inspecter (console).
* Build (avec electron-packager) et création de l'exécutable dans /dist : npm run build


### Télécharger l'exécutable Windows

* Télécharger la dernière release https://github.com/abes-esr/SudocToolkit/releases
* Dézipper où vous voulez sur votre PC
* Double-cliquer sur SudocToolkit.exe
* Créer un raccourci sur le bureau : clic droit sur SudocToolkit.exe -> envoyer vers Bureau