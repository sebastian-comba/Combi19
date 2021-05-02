const mongoose = require("mongoose");

const combiSchema = new mongoose.Schema({
  patente: { type: String, required: true, unique: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  chofer: {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true },
  },
  asientos: { type: Number, required: true },
  tipo: { type: String, required: true },
  borrado: { type: Boolean, required: true },
});

const Combi = mongoose.model("Combi", combiSchema);

module.exports = Combi;
