const mongoose = require("mongoose");

const lugarSchema = new mongoose.Schema({
  ciudad: { type: String, required: true, index: true },
  provincia: { type: String, required: true, index: true },
  borrado: { type: Boolean, required: true },
});

lugarSchema.index({ ciudad: 1, provincia: 1 }, { unique: true });

const Lugar = mongoose.model("Lugar", lugarSchema);

module.exports = Lugar;
