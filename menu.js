// Custom menu item
const {
    app,
    Menu,
    shell,
    ipcMain,
    BrowserWindow,
    globalShortcut,
    dialog
} = require('electron');


const path = require('path');
const fs = require('fs');

var name;

const fileMenu = {
    label: 'File',
    submenu: [
        {
            label: 'Open',
            accelerator: 'CommandOrControl + O',
            click() {
                loadFile();
            }
        },
        {
            label: 'Save',
            accelerator: 'CommandOrControl + S',
            click() {
                saveFile();
            }
        }
    ]
};

const formatMenu = {
    label: 'Format',
    submenu: [
        {
            label: 'Bold',
            accelerator: 'CommandOrControl + B',
            click() {
                const window = BrowserWindow.getFocusedWindow();
                window.webContents.send(
                    'editor-event',
                    'toggle-bold'
                );
            }
        },
        {
            label: 'Italic',
            accelerator: 'CommandOrControl + I',
            click() {
                const window = BrowserWindow.getFocusedWindow();
                window.webContents.send(
                    'editor-event',
                    'toggle-italic'
                );
            }
        },
        {
            label: "Strikethrough",
            accelerator: 'CommandOrControl + Shift + 5',
            click() {
                const window = BrowserWindow.getFocusedWindow();
                window.webContents.send(
                    'editor-event',
                    'toggle-strikethrough'
                );
            }
        }
    ]
};

const helpMenu = {
    role: 'help',
    submenu: [
        {
            label: 'About Editor Component',
            click() {
                shell.openExternal('https://simplemde.com/');
            }
        },
    ]
};





function saveFile() {
    console.log('Saving the file');
    const window = BrowserWindow.getFocusedWindow();
    window.webContents.send('editor-event', 'save');
}

function loadFile() {
    const window = BrowserWindow.getFocusedWindow();
    const options = {
        title: 'Pick a markdown file',
        filters: [
            { name: 'Markdown files', extensions: ['md'] },
            { name: 'Text files', extensions: ['txt'] }
        ]
    };
    dialog.showOpenDialog(window, options).then(
        result => {
            if (!result.canceled) {
                let paths = result.filePaths;
                if (paths && paths.length > 0) {
                    const content = fs.readFileSync(paths[0]).toString();
                    window.webContents.send('load', content);
                }
            }
        }
    );
}




app.on('ready', () => {
    globalShortcut.register('CommandOrControl+S', () => {
        // Save File
        saveFile();
    });
    globalShortcut.register('CommandOrControl+O', () => {
        // Load File
        loadFile();
    });

});

ipcMain.on('editor-reply', (event, arg) => {
    console.log(`Received reply from web page: ${arg}`);
});


ipcMain.on('save', (event, arg) => {
    console.log(`Saving content of the file`);
    const window = BrowserWindow.getFocusedWindow();
    const options = {
        title: 'Save markdown file',
        //defaultPath: app.getPath('documents') + '/new-md-file.md',
        buttonLabel: 'Save',
        filters: [
            { name: 'Markdown files', extensions: ['md'] }
        ]
    };

    dialog.showSaveDialog(window, options).then(
        result => {
            // Stating whether dialog operation was cancelled or not.
            console.log(result.canceled);
            if (!result.canceled) {
                console.log(result.filePath.toString());

                // Creating and Writing to the sample.txt file
                fs.writeFile(result.filePath.toString(),
                    arg, "utf-8", function (err) {
                        if (err) throw err;
                        console.log('Saved!');
                    });
            }
        }).catch(err => {
            console.log(err)
        });
});


const template = [
    fileMenu,
    formatMenu,
    helpMenu
];

if (process.platform === 'darwin') {
    template.unshift({
        label: app.getName(),
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    })
}

if (process.env.DEBUG) {
    template.push({
        label: 'Debbuging',
        submenu: [
            {
                label: 'Dev Tools',
                role: 'toggleDevTools'
            },
            { type: 'separator' },
            {
                role: 'reload',
                accelerator: 'Alt + R'
            }
        ]
    });
}


const menu = Menu.buildFromTemplate(template);

module.exports = menu;