const { create } = require('domain');
const { ipcMain, app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const userDataPath = app.getPath('userData');
const dataFilePath = app.isPackaged ? path.join(userDataPath, 'albums.json') : path.join(__dirname, 'albums.json');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1400,
        height: 1000,
        // resizable: true,
        // frame: false,
        // show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.resolve(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            additionalArguments: [`--dataPath=${dataFilePath}`],
            icon: path.join(__dirname, '/icon.ico')
        }
    });
    win.setMinimumSize(1200, 800); // Best practice still
    win.loadFile('index.html');
}

app.whenReady().then(() => {
    if (!fs.existsSync(dataFilePath)) {
        fs.writeFileSync(dataFilePath, '[]');
    }
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

