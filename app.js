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



app.get("/alta-insumo", (req, res) => {
  res.render("alta-insumo", {});
})

app.post("/alta-insumo", (req,res) => {
  Insumo.find(
    { nombre: req.body.nombre },
    (err, found) => {
      if (err) {
        console.log(err);
      } else {
        if (!found){
          var insumo = new Insumo({
            nombre : req.body.nombre,
            tipo : req.body.tipo,
            precio : req.body.precio,
            borrado : false
          });
          insumo.save();
        }
      }
    }
  )      
  })

//
// NO HACER EL MISMO SAVE MAS DE 1 VEZ, TIRA ERROR DE REPETIDO (como deberia),
// CAMBIAR VALOR DEL CAMPO QUE SEA UNIQUE O BORRAR EL DOCUMENTO VIEJO ANTES DE HACER UN NUEVO SAVE

// var u = new Usuario({
//   nombre: "pedro",
//   apellido: "perez",
//   email: "pedro@gmail.com",
//   clave: "123456",
//   dni: "21312321",
//   fechaN: new Date(),
//   rol: "1",
//   borrado: false,
//   suspendido: false,
//   categoria: "gold",
//   telefono: "12345",
// });
// u.save((err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("se guardo");
//   }
// });
// var insumo = new Insumo({
//   nombre: "papa",
//   tipo: "salado",
//   precio: 1.5,
//   borrado: true,
// });
// var l = new Lugar({
//   nombre: "asdasd",
//   provincia: "asdasda",
//   borrado: false,
// });
// l.save((err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("se guardo");
//   }
// });

// insumo.save((err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("se guardo");
//   }
// });

// NO TOCAR
app.listen(3000, function () {
  console.log("Server started on port " + port);
});
