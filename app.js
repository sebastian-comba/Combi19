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

app.get("/alta-insumo", (req, res) => {
  res.render("alta-insumo", {});
})

app.get("/insumos", (req, res) => {
  Insumo.find({}, (err, result) => {
    res.json(result);
  });
})

// GET request para listar insumos
//listar los que no tengan marca de borrado
//
app.get("/listar-insumos", (req,res)=>{
 Insumo.find({borrado:false}, (err,insumos)=> {
   if(err){
     console.log(err);
   } else {
      res.render("listar-insumos", {data:insumos}); 
   }
 });
})

//POST request para dar de alta un insumo
//primero busca si ya hay uno con el mismo nombre
app.post("/alta-insumo", (req,res) => {
  Insumo.find(
    { nombre: req.body.nombre },
    (err, found) => {
      if (err) {
        console.log(err);
      } else {
        if (!found.length){
          var insumo = new Insumo({
            nombre : req.body.nombre,
            tipo : req.body.tipo,
            precio : req.body.precio,
            borrado : false,
          });
          insumo.save((err)=>{
            if(err){
              console.log(err);
            } else {
              console.log("se guardo el insumo");
            }
          });
        } 
     } 
     res.redirect("/listar-insumos");
  });
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

// variable que devuelve la fecha de hoy
//let hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0);

// eliminar lugar
// falta testear
app.delete("/lugar/:id", (req, res) => {
  Viaje.find(
    {
      ruta: { origen: { idLugar: req.params.id } },
      fecha: { $gte: new Date },
    },
    (err, result) => {
      if (result.length) {
        console.log("No se puede borrar, tiene viaje futuro");
      } else {
        Lugar.findOneAndUpdate(
          {
            _id: req.params.id,
          },
          { borrado: true }
        );
      }
    }
  );
});

// NO TOCAR
app.listen(3000, function () {
  console.log("Server started on port " + port);
});
