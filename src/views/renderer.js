// Validação Cnpj =============================================================
function validarCNPJ() {
    let cnpjInput = document.getElementById('inputCnpj')
    let cnpj = cnpjInput.value.replace(/\D/g, '') // Remove tudo que não for número

    // Resetando o estilo
    cnpjInput.style.border = ""

    // Verifica se tem 14 dígitos e se não é uma sequência repetida
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
        cnpjInput.style.border = "2px solid red"
        return
    }

    let tamanho = cnpj.length - 2
    let numeros = cnpj.substring(0, tamanho)
    let digitos = cnpj.substring(tamanho)
    let soma = 0
    let pos = tamanho - 7

    // Valida o primeiro dígito verificador
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--
        if (pos < 2) pos = 9
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    if (resultado !== parseInt(digitos.charAt(0))) {
        cnpjInput.style.border = "2px solid red"
        return
    }

    // Valida o segundo dígito verificador
    tamanho = tamanho + 1
    numeros = cnpj.substring(0, tamanho)
    soma = 0
    pos = tamanho - 7
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--
        if (pos < 2) pos = 9
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    if (resultado !== parseInt(digitos.charAt(1))) {
        cnpjInput.style.border = "2px solid red"
        return
    }

    // CNPJ válido
    cnpjInput.style.border = ""
}
//=============================================================================

//= RESET FORM ================================================================
function resetForm() {
    location.reload()
}
api.resetForm((args) => {
    resetForm()
})
//= FIM RESET FORM ============================================================

// Limpar Formulario ==========================================================

//=============================================================================

// Data =======================================================================
function obterData() {
    const data = new Date()
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return data.toLocaleDateString('pt-BR', options)
}

document.getElementById('dataAtual').innerHTML = obterData()

api.dbStatus((event, message) => {
    console.log(message)
    if (message === "conectado") {
        document.getElementById('iconeDB').src = "../public/img/dbon.png"
    } else {
        document.getElementById('iconeDB').src = "../public/img/dboff.png"
    }
})
//=============================================================================

// Processo de cadastro do cliente ============================================
// Captura de dados
let formNota = document.getElementById('formNota')
let nota = document.getElementById('inputNota')
let empresa = document.getElementById('inputEmpresa')
let cnpj = document.getElementById('inputCnpj')
let data = document.getElementById('inputData')
let valor = document.getElementById('inputTotal')
let item = document.getElementById('inputItem')
let quantidade = document.getElementById('inputQtd')
let unitario = document.getElementById('inputUnitario')
//============================================================================

//= CRUD CREATE ==============================================================
// Enviar ao banco de dados
formNota.addEventListener('submit', async (event) => {
    // evitar comportamento padrão de recarregar a página
    event.preventDefault()
    console.log(
        nota.value,
        empresa.value,
        cnpj.value,
        data.value,
        valor.value,
        item.value,
        quantidade.value,
        unitario.value
    )
    const newNota = {
        notaCad: nota.value,
        empresaCad: empresa.value,
        cnpjCad: cnpj.value,
        dataCad: data.value,
        valorCad: valor.value,
        itemCad: item.value,
        quantidadeCad: quantidade.value,
        unitarioCad: unitario.value
    }
    // Enviar ao main
    api.createNota(newNota)
})
//= FIM =========================================================================

//= CRUD CREATE ====================================================
// Setar o nome do cliente para fazer um novo cadastro se a busca retornar que o cliente não esta cadastrado
api.setNota((args) => {
    console.log("teste do IPC 'set-nota'")
    // "recortar" o nome na busca e setar no campo nome do form
    let busca = document.getElementById('buscarNota').value
    // foco no campo de busca
    nota.focus()
    // limpar o campo de busca
    foco.value = ""
    // copiar o nome do cliente para o campo nome
    nota.value = busca
})

function searchNota() {
    let input = document.getElementById('buscarNota').value.trim()
    console.log(input)

    if (input === "") {
        api.validateSearch()
        return
    }

    api.renderNota((event, nota) => {
        const notaData = JSON.parse(nota)
        arrayNota = notaData
        // Uso do forEach para percorrer o vetor
        arrayNota.forEach((c) => {
            nota.value = c.nota
            empresa.value = c.empresa
            cnpj.value = c.cnpj
            data.value = c.data
            valor.value = c.valor
            item.value = c.item
            quantidade.value = c.quantidade
            unitario.value = c.unitario
            //desativar o botão adicionar
            btnCreate.disabled = true
            // ativar e desativar o botão editar e excluir
            btnUpdate.disabled = false
            btnDelete.disabled = false
        })

    })
}
// FIM =======================================================================

