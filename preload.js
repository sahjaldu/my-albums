const { contextBridge, ipcMain, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const dataPathArg = process.argv.find(arg => arg.startsWith('--dataPath='));
const dataFilePath = dataPathArg ? dataPathArg.split('=')[1] : null;

const safeRead = () => {
  if (!fs.existsSync(dataFilePath)) return [];
  return JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
};

const safeWrite = (albums) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(albums, null, 2));
};

contextBridge.exposeInMainWorld('versions', {

    // readAlbums: () => {
    //     const filePath = path.join(__dirname, 'albums.json');
    //     return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // },

    // writeAlbum: (album) => {
    //     const filePath = path.join(__dirname, 'albums.json');
    //     const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    //     data.push(album);
    //     fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    // },

    // updateAlbum: (updated_data) => {
    //     const filePath = path.join(__dirname, 'albums.json');
    //     const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    //     const index = data.findIndex(a => a.name === updated_data.name);
    //     if (index != -1) {
    //         data[index].date_listened = updated_data.date_listened;
    //         data[index].favorite = updated_data.favorite;
    //         data[index].description = updated_data.description;
    //         fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    //     }
    //     else {
    //         console.log("Could not update album");
    //     }
    // },

    // deleteAlbum: (name) => {
    //     const filePath = path.join(__dirname, 'albums.json');
    //     let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    //     data = data.filter(a => a.name !== name);
    //     fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    // }

    readAlbums: safeRead,

    writeAlbum: (album) => {
        const albums = safeRead();
        albums.push(album);
        safeWrite(albums);
    },

    updateAlbum: (updated_data) => {
        let albums = safeRead();
        const index = albums.findIndex(a => a.name === updated_data.name);
        if (index !== -1) {
            albums[index].date_listened = updated_data.date_listened;
            albums[index].favorite = updated_data.favorite;
            albums[index].description = updated_data.description;
            safeWrite(albums);
        }
        else {
            console.log("could not update album");
        }
        // albums = albums.map(album => album.name === updatedAlbum.name ? updatedAlbum : album);
    },

    deleteAlbum: (name) => {
        let albums = safeRead();
        albums = albums.filter(a => a.name !== name);
        safeWrite(albums);
    }
});