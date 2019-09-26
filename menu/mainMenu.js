const {Menu} = require('electron')
const electron = require('electron')
const app = electron.app

const template = [
    {
        label: 'Fichier',
        submenu: [
          { label:'Quitter',
            role: 'quit' }
        ]
      },
    {
      label: 'Edition',
      submenu: [
        {
           label: 'Annuler',
            role: 'undo'
        },
        {
            label: 'Rétablir',
            role: 'redo'
        },
        {
          type: 'separator'
        },
        {
           label:'Couper',
            role: 'cut'
        },
        {
          label: 'Copier', 
          role: 'copy'
        },
        {
          label: 'Coller',  
          role: 'paste'
        },
        { 
          label: 'Coller avec la mise en forme' , 
          role: 'pasteandmatchstyle'
        },
        {
           label: 'Supprimer',
            role: 'delete'
        },
        {
            label: 'Sélectionner tout',
            role: 'selectall'
        }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        {
          label: 'Recharger',
          accelerator: 'CmdOrCtrl+R',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload()
          }
        },
        {
          label: 'Inspecter (console)',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools()
          }
        },
        {
          type: 'separator'
        },
        {
           label: 'Restaurer le zoom',
            role: 'resetzoom'
        },
        {
            label: 'Zoom avant',
            role: 'zoomin'
        },
        {
            label: 'Zoom arrière',
            role: 'zoomout'
        },
        {
          type: 'separator'
        },
        {
            label: 'Réduire',
            role: 'minimize'
        },
        {
            label: 'Activer/désactivre le mode plein écran',
            role: 'togglefullscreen'
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Contacter',
          click () { require('electron').shell.openExternal('mailto:Geraldine.GEOFFROY@univ-cotedazur.fr') }
        }
      ]
    }
  ]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)