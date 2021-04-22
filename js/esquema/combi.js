const mongoose = require("mongoose");

const combiSchema = new mongoose.Schema({
  patente: { type: String, required: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  chofer: {type: String, required: true},
  asientos: {type: Number, required: true},
  tipo: {type: String, required: true},
  borrado: Boolean,
});

const Combi = mongoose.model("Combi", combiSchema);

module.exports = Combi;
