const mongoose = require("mongoose");

const pasajeSchema = new mongoose.Schema({
  emailPasajero: { type: String, required: true},
  insumos: [
    {
      nombre: String,
      precio: String,
      cantidad: Number,
    },
  ],
  cantidad: { type: Number, required: true},
  idViaje: { type: String, required: true},
  fecha: { type: Date, required: true },
  precio: { type: String, required: true },
});


const Pasaje = mongoose.model("Pasaje", pasajeSchema);

module.exports = Pasaje;
