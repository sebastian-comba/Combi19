const mongoose = require("mongoose");

const rutaSchema = new mongoose.Schema({
  origen: { type: String, required: true },
  destino: { type: String, required: true },
  combi: { type: String, required: true },
  distancia: {type: Number, required: true},
  hora : {type: Date, required: true},
  borrado: Boolean,
});

const Ruta = mongoose.model("Ruta", rutaSchema);

module.exports = Ruta;