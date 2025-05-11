const { model, Schema } = require('mongoose')

const notaSchema = new Schema({
    nota: { type: String },
    empresa: { type: String },
    cnpj: { type: String, unique: true},
    data: { type: String},
    valor: { type: String },
    item: { type: String },
    quantidade: { type: String },
    unitario: { type: String }
}, {versionKey: false})

module.exports = model('Notas', notaSchema)