//jshint esversion:6

const express = require("express");
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const ejs = require("ejs");

const Usuario = require("./js/esquema/usuarios");
const Insumo = require("./js/esquema/insumo");
const Combi = require("./js/esquema/combi");
const Lugar = require("./js/esquema/lugar");
const Viaje = require("./js/esquema/viaje");
const Ruta = require("./js/esquema/ruta");

const app = express();

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/combi19DB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// GET request al home/inicio de la pagina
app.get("/home", (req, res) => {
  res.render("home", {});
});

app.get("/lugares", (req, res) => {
  Lugar.find({}, (err, result) => {
    res.json(result);
  });
});

app.get("/cargar-lugar", (req, res) => {
  res.render("cargar-lugar", {});
});

// POST request para dar de alta a un nuevo lugar
// falta agregar un mensaje de alerta para el usuario cuando se intenta agregar un lugar ya existente
// falta normalizar los datos de entrada para que se guarden siempre capitalizados y no en minuscula o mayuscula
app.post("/cargar-lugar", (req, res) => {
  var l = new Lugar({
    ciudad: req.body.ciudad,
    provincia: req.body.provincia,
    borrado: false,
  });
  l.save((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("lugar guardado");
    }
    res.redirect("/home");
  });
});

// NO TOCAR
app.listen(3000, function () {
  console.log("Server started on port " + port);
});
