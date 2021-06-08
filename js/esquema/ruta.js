const mongoose = require("mongoose");

const rutaSchema = new mongoose.Schema({
  origen: {
    nombre: { type: String, required: true },
    provincia: { type: String, required: true },
    idLugar: { type: String, required: true },
  },
  destino: {
    nombre: { type: String, required: true },
    provincia: { type: String, required: true },
    idLugar: { type: String, required: true },
  },
  combi: {
    patente: { type: String, required: true },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    tipo: { type: String, required: true },
    idCombi: { type: String, required: true },
  },
  distancia: { type: Number, required: true },
  hora: { type: String, required: true },
});

const Ruta = mongoose.model("Ruta", rutaSchema);

module.exports = Ruta;
