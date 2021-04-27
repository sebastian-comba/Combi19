const mongoose = require("mongoose");

const lugarSchema = new mongoose.Schema({
  ciudad: { type: String, required: true },
  provincia: { type: String, required: true },
  borrado: { type: Boolean, required: true },
});

const Lugar = mongoose.model("Lugar", lugarSchema);

module.exports = Lugar;
