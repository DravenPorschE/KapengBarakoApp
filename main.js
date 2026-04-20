const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron');
require('electron-reload')(__dirname);

ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (result.canceled) return null;
    return result.filePaths[0];
});

ipcMain.handle('select-image', async (event, startPath) => {
    const win = BrowserWindow.fromWebContents(event.sender);

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        defaultPath: startPath, // 👈 THIS LINE
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'avif'] }
        ]
    });

    return canceled ? null : filePaths[0];
});

app.on('ready', () => {
    const window = new BrowserWindow({ 
        width: 800, 
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    window.loadURL(`file://${__dirname}/main.html`);
    window.setMenu(null);
    // window.webContents.openDevTools(); 

    globalShortcut.register('CommandOrControl+R', () => {
        window.reload();
    });
});