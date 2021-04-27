const mongoose = require("mongoose");

const rutaSchema = new mongoose.Schema({
  origen: {
    nombre: String,
    provincia: String,
    required: true,
  },
  destino: {
    nombre: String,
    provincia: String,
    required: true,
  },
  combi: {
    patente: String,
    marca: String,
    modelo:String,
    required: true,
  },
  distancia: { type: Number, required: true },
  hora: { type: Date, required: true },
  borrado: Boolean,
});

const Ruta = mongoose.model("Ruta", rutaSchema);

module.exports = Ruta;
