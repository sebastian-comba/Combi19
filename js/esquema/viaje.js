const mongoose = require("mongoose");

const viajeSchema = new mongoose.Schema({
  ruta: {
    origen: {
      nombre: String,
      provincia: String,
    },
    destino: {
      nombre: String,
      provincia: String,
    },
    required: true,
  },
  combi: {
    patente: String,
    marca: String,
    modelo: String,
    required: true,
  },
  chofer: {
    nombre: String,
    apellido: String,
    required: true,
  },
  fecha: { type: Date, required: true },
  precio: { type: Number, required: true },
  asientosDisponibles: Number,
  estado: String,
  borrado: Boolean,
});

const Viaje = mongoose.model("Viaje", viajeSchema);

module.exports = Viaje;
