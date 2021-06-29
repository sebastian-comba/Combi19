const mongoose = require("mongoose");

const viajeSchema = new mongoose.Schema({
  ruta: {
    origen: {
      nombre: { type: String, required: true },
      provincia: { type: String, required: true },
    },
    destino: {
      nombre: { type: String, required: true },
      provincia: { type: String, required: true },
    },
    idRuta: { type: String, required: true, index: true },
  },
  combi: {
    patente: { type: String, required: true },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    tipo: { type: String, required: true },
  },
  chofer: {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    mail: { type: String, required: true },
  },
  fecha: { type: Date, required: true, index: true },
  llegada: {type: Date, required: true},
  precio: { type: Number, required: true },
  asientosDisponibles: { type: Number, required: true },
  estado: { type: String, required: true },
});



const Viaje = mongoose.model("Viaje", viajeSchema);

module.exports = Viaje;
