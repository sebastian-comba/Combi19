const mongoose = require("mongoose");

const comentarioSchema = new mongoose.Schema({
  emailPasajero: { type: String, required: true },
  insumos: [
    {
      nombre: String,
      precio: String,
      cantidad: Number,
    },
  ],
  cantidad: { type: Number, required: true },
  idViaje: { type: String, required: true },
  fecha: { type: Date, required: true },
  precio: { type: String, required: true },
});

const Comentario = mongoose.model("Comentario", comentarioSchema);

module.exports = Comentario;
