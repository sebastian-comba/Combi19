const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true},
  email: { type: String, required: true},
  clave: { type: String, required: true },
  dni: {type: String, required: true},
  fechaN: {type: Date, required: true},
  rol: { type: String, required: true},
  borrado: Boolean,
  suspendido: Boolean,
  categoria: String,
  telefono: String
});

userSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("clave")) {
    const document = this;
    bcrypt.hash(document.clave, saltRounds, (err, hashedPassword) => {
      if (err) {
        next(err);
      } else {
        document.clave = hashedPassword;
        next();
      }
    });
  } else {
    next();
  }
});
userSchema.methods.claveCorrecta = function (clave, callback) {
  bcrypt.compare(clave, this.clave, function (err, same) {
    if (err) {
      callback(err);
    } else {
      callback(err, same);
    }
  });
};

const Usuario = mongoose.model("Usuario", userSchema);

module.exports = Usuario;
