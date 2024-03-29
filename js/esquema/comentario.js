const mongoose = require("mongoose");

const comentarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true},
  email: { type: String, required: true },
  fecha: { type: Date, required: true },
  texto: { type: String, required: true },
  modificado: { type: Boolean, required: true },
});

const Comentario = mongoose.model("Comentario", comentarioSchema);

module.exports = Comentario;
