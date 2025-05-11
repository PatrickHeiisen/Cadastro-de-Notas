const { ipcRenderer, contextBridge } = require('electron')

ipcRenderer.send('db-connect')

contextBridge.exposeInMainWorld('api', {
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    aboutExit: () => ipcRenderer.send('about-exit'),
    createNota: (newNota) => ipcRenderer.send('create-nota', newNota),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
    searchNota: (notaCad) => ipcRenderer.send('search-nota', notaCad),
    validateSearch: () => ipcRenderer.send('validate-search'),
    renderNota: (nota) => ipcRenderer.on('render-nota', nota),
    setNota: (args) => ipcRenderer.on('set-nota', args)
})