const mongoose = require("mongoose");

const viajeSchema = new mongoose.Schema({
  ruta: { type: String, required: true },
  fecha: { type: Date, required: true },
  precio: { type: Number, required: true },
  asientosDisponibles: Number,
  estado: String,
  borrado: Boolean,
});

const Viaje = mongoose.model("Viaje", viajeSchema);

module.exports = Viaje;