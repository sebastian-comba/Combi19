const mongoose = require("mongoose");

const pasajeSchema = new mongoose.Schema({
  emailPasajero: { type: String, required: true },
  insumos: [
    {
      nombre: String,
      precio: String,
      cantidad: Number,
    },
  ],
  cantidad: { type: Number, required: true },
  origen: {
    nombre: { type: String, required: true },
    provincia: { type: String, required: true },
  },
  destino: {
    nombre: { type: String, required: true },
    provincia: { type: String, required: true },
  },
  tipoServicio: { type: String, required: true },
  fecha: { type: Date, required: true },
  precio: { type: String, required: true },
  estadoPasaje: { type: String, required: true },
  idViaje: { type: String, required: true },
});


const Pasaje = mongoose.model("Pasaje", pasajeSchema);

module.exports = Pasaje;
