const mongoose = require("mongoose");

const tarjetaSchema = new mongoose.Schema({
  codigo: { type: String, required: true, index: true },
  dni: { type: String, required: true },
  nombreCompleto: { type: String, required: true },
  vencimiento: { type: Date, required: true },
  codSeguridad: { type: String, required: true },
  monto: { type: String, required: true },
});

const Tarjeta = mongoose.model("Tarjeta", tarjetaSchema);

module.exports = Tarjeta;
