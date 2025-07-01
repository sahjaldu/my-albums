const { create } = require('domain');
const { ipcMain, app, BrowserWindow, shell } = require('electron');
const fs = require('fs');
const path = require('path');

const userDataPath = app.getPath('userData');
const dataFilePath = app.isPackaged ? path.join(userDataPath, 'albums.json') : path.join(__dirname, 'albums.json');

const client_id = '3e32b0815b2145a1b59dc82f53fbd0df';
const client_secret = 'c16ef38eec3b419b9e0bea7f8a3cefde';

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
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
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

ipcMain.handle('getSpotifyToken', async () => {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ grant_type: 'client_credentials' })
        });
        const data = await response.json();
        return data.access_token;
    }
    catch (err) {
        console.log("failed to get token.", err)
        throw err;
    }
});