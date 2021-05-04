const mongoose = require("mongoose");

const pasajeSchema = new mongoose.Schema({
  emailPasajero: { type: String, required: true, index: true },
  insumos: [
    {
      nombre: String,
      precio: String,
      cantidad: Number,
    },
  ],
  viaje: { type: String, required: true, index: true },
  fecha: { type: Date, required: true },
  precio: { type: String, required: true },
});

pasajeSchema.index({ emailPasajero: 1, viaje: 1 }, { unique: true });

const Pasaje = mongoose.model("Pasaje", pasajeSchema);

module.exports = Pasaje;
