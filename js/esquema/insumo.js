const mongoose = require("mongoose");

const insumoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  tipo: { type: String, required: true },
  precio: { type: String, required: true },
});

const Insumo = mongoose.model("Insumo", insumoSchema);

module.exports = Insumo;
