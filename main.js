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
        height: 800,

        webPreferences: {
            preload: path.join(__dirname, './preload.js')
        }
    })

    Menu.setApplicationMenu(Menu.buildFromTemplate(templete))

    win.loadFile('./src/views/index.html')
}

// Janela Sobre
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

// Janela Nota
let nota
function createPrin() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        nota = new BrowserWindow({
            width: 1080,
            height: 900,
            //autoHideMenuBar: true,
            //resizable: false,
            parent: main,
            modal: true,
            //ativação do preload.js
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    nota.loadFile('./src/views/nota.html')
    nota.center() //iniciar no centro da tela   
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

// recebimento dos pedidos do renderizador para abertura de janelas (botões) autorizado no preload.js
ipcMain.on('create-prin', () => {
    createPrin()
})

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

        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Nota adicionado com sucesso.",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })

    } catch (error) {
        // Tratamento da excessão "CNPJ duplicado"
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "Atenção!!!",
                message: "CNPJ já cadastrado.\nVerifique o número digitado",
                buttons: ['OK']
            }).then((result) => {
                // Se o botão OK for pressionado
                if (result.response === 0) {
                    // Encontrar o campo de CPF
                    event.reply('reset-cnpj')
                }
            })
        } else {
            console.log(error);
        }
    }
})
//==================================================================================

//= CRUD READ ======================================================================
// Validação da busca
ipcMain.on('validate-search', () => {
    dialog.showMessageBox({
        type: 'warning',
        title: 'atenção',
        message: 'Preencher o campo de busca',
        buttons: ['OK']
    })
})

ipcMain.on('search-nota', async (event, notaCad) => {
    // Teste do recebimento do nome do cliente (Passo 2)
    console.log(notaCad)
    try {
        // Passos 3 e 4 (Busca dos dados do cliente pelo nome)
        // RegExp (expresão regular 'i' -> insentive (ignorar letra maiuscula ou minuscula))
        const nota = await notaModel.find({
            nota: new RegExp(notaCad, 'i')
        })
        // teste da busca do cliente pelo nome (Passo 3 e 4)
        console.log(notaCad)
        // Melhoria da experiencia do usuario (se não existir um cliente cadastrado enviar uma mensagem)
        if (nota.length === 0) {
            // Questionar o usuario.....
            dialog.showMessageBox({
                type: 'warning',
                title: 'Aviso',
                message: 'Nota não cadastrado. \nDeseja cadastrar este nota',
                defaultId: 0,
                buttons: ['Sim', 'Não']
            }).then((result) => {
                // se o botão sim for pressionado
                if (result.response === 0) {
                    // Enviar ao pedido para renderer um pedido para recortar e copiar o nome do cliente
                    event.reply('set-nota')
                } else {
                    // Enviar ao renderer um pedido para limpar o campo
                    event.reply('reset-form')
                }
            })

        } else {
            // Enviar ao renderizador (rendererCliente) os dados do cliente (Passo 5) OBS: converter para string
            event.reply('render-nota', JSON.stringify(nota))
        }
    } catch (error) {
        console.log(error)
    }
})
//= FIM CRUD =======================================================================