//live reload
//require('electron-reload')(__dirname);

require('@electron/remote/main').initialize();

// Modules to control application life and create native browser window
const path = require('path')
const { app, BrowserWindow, dialog } = require('electron')

let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1300,
    height: 1000,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')
  const contents = win.webContents
  //Open the devTools
	//contents.openDevTools()
	require('@electron/remote/main').enable(contents)
  require('./menu/mainMenu')
	win.on('ready-to-show', () => {
		win.show()
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
