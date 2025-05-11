console.log("Processo Principal")

// shell acessar links e aplicações externas

const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')

const path = require('node:path')

const { conectar, desconectar } = require('./database.js')

const notaModel = require('./src/models/nota.js')

// Importação da biblioteca nativa do js para manipular arquivos
const fs = require('fs')

// IMportação do pacote jspdf (arquivos pdf) npm install jspdf
const { jspdf, default: jsPDF } = require('jspdf')

//Janela Principal
let win
const createWindow = () => {
    nativeTheme.themeSource = 'light'
    win = new BrowserWindow({
        width: 1000,
        height: 900,

        webPreferences: {
            preload: path.join(__dirname, './preload.js')
        }
    })

    Menu.setApplicationMenu(Menu.buildFromTemplate(templete))

    win.loadFile('./src/views/index.html')
}

let about
function aboutWindow() {
    nativeTheme.themeSource = 'light'

    const mainWindow = BrowserWindow.getFocusedWindow()

    if (mainWindow) {
        about = new BrowserWindow({
            width: 415,
            height: 350,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            parent: mainWindow,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, './preload.js')
            }
        })
    }

    about.loadFile('./src/views/sobre.html')

    ipcMain.on('about-exit', () => {
        if (about && !about.isDestroyed()) {
            about.close()
        }

    })
}

app.whenReady().then(() => {
    createWindow()

    ipcMain.on('db-connect', async (event) => {
        const conectado = await conectar()
        if (conectado) {
            setTimeout(() => {
                event.reply('db-status', "conectado")
            }, 500)
        }
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('before-quit', async () => {
    await desconectar()
})

app.commandLine.appendSwitch('log-level', '3')

const templete = [
    {
        label: 'Cadastro',
        submenu: [
            {
                label: 'Sair',
                accelerator: 'Esc'
            }
        ]
    },
    {
        label: 'Relatórios',
        submenu: [
            {
                label: 'Notas',
                click: () => relatorioNotas()
            }
        ]
    },
    {
        label: 'Ferramentas',
        submenu: [
            {
                label: 'Ampliar',
                role: 'zoomIn',
                accelerator: 'Ctrl+='
            },
            {
                label: 'Reduzir',
                role: 'zoomOut',
                accelerator: 'Ctrl+-'
            },
            {
                label: 'Tamanho padrão',
                role: 'resetZoom',
                accelerator: 'Ctrl+0'
            },
            {
                type: 'separator'
            },
            {
                label: 'Recarregar',
                role: 'reload'
            },
            {
                label: 'DevTools',
                role: 'toggleDevTools',
                accelerator: 'Ctrl+Shift'
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Repositório',
                click: () => shell.openExternal('https://github.com/PatrickHeiisen/Cadastro_Nota.git')
            },
            {
                label: 'Sobre',
                click: () => aboutWindow()
            }
        ]
    }
]

//= CRUD CREATE - CADASTRAR NOTA ==================================================
ipcMain.on('create-nota', async (event, newNota) => {
    console.log(newNota)
    try {
        const newNotas = notaModel({
            nota: newNota.notaCad,
            empresa: newNota.empresaCad,
            cnpj: newNota.cnpjCad,
            data: newNota.dataCad,
            valor: newNota.valorCad,
            item: newNota.itemCad,
            quantidade: newNota.quantidadeCad,
            unitario: newNota.unitarioCad
        })

        await newNotas.save()

    } catch (error) {
        console.log(error)
    }
})
//==================================================================================
