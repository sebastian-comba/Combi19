const mongoose = require("mongoose");

const lugarSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    provincia: { type: String, required: true},
    borrado: Boolean,
  });
  
  const Lugar = mongoose.model("Lugar", lugarSchema);
  
  module.exports = Lugar;