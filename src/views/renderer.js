// Ação ao clicar no botão Limpar =============================================
document.querySelector('button[type="reset"]').addEventListener('click', function () {
    const inputs = document.querySelectorAll('input')
    inputs.forEach(input => {
        input.value = ''
        input.classList.remove('is-invalid')
    })
})
//=============================================================================

// Limpar Formulario ==========================================================

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