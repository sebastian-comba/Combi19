//jshint esversion:6

const express = require("express");
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const ejs = require("ejs");

const Usuario = require('./js/esquema/usuarios');
const Insumo = require('./js/esquema/insumo');
const Combi = require('./js/esquema/combi');
const Lugar = require('./js/esquema/lugar');
const Viaje = require('./js/esquema/viaje');
const Ruta = require('./js/esquema/ruta');

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

app.get("/", (req, res) => {
  res.render("home", {});
});

app.listen(3000, function () {
  console.log("Server started on port " + port);
});
