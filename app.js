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
const { find } = require("./js/esquema/usuarios");

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
});

app.get("/insumos", (req, res) => {
  Insumo.find({}, (err, result) => {
    res.json(result);
  });
});

app.get("/rutas", (req, res) => {
  Ruta.find({}, (err, result) => {
    res.json(result);
  });
});

//alta de rutas
app.get("/cargar-rutas", (req, res) => {
  Lugar.find({ borrado: false }, (err, lugares) => {
    if (err) {
      console.log(err);
    } else {
      res.locals.lugares = lugares;
      Combi.find({ borrado: false }, (err, combis) => {
        if(err){
          console.log(err);
        } else {
          res.locals.combis = combis;
          res.render("cargar-rutas", {});
        }
      });
    }
  });
});
app.post("/cargar-rutas", (req,res) => {
  Lugar.findOne({_id:req.body.origen}, (err, origen) => {
    Lugar.findOne({_id:req.body.destino}, (err, destino) => {
      Combi.findOne({_id:req.body.combi}, (err, combi) => {
        var ruta = new Ruta({
          origen : {nombre:origen.ciudad,
          provincia:origen,provincia,
          idLugar:req.body.origen,
        },
          destino : {nombre:destino.ciudad,
          provincia:destino.provincia,
          idLugar:req.body.destino,
        },
          combi : {patente:combi.patente,
          marca: combi.marca,
          modelo: combi.modelo,
          idCombi:req.body.combi,
        },
        distancia: req.body.distancia,
        hora: req.body.hora,
        borrado : false,
      });
      ruta.save((err)=>{
        if(err){
          console.log(err);
          console.log("no se guardo la ruta");
        } else {
          console.log("se guardo la ruta");
        }
      });
      });
    });
  });
  
  res.redirect("/listar-rutas");
});

// GET request para listar rutas
app.get("/listar-rutas", (req,res)=>{
  Ruta.find({borrado:false}, (err,rutas)=> {
    if(err){
      console.log(err);
    } else {
       res.render("listar-rutas", {data:rutas}); 
    }
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
        } else {
          console.log("el insumo ya existe");
        }
     } 
     res.redirect("/listar-insumos");
  });
});

// Eliminar Insumo
// faltaria verificar que el insumo no está en compras a futuro, cuando hagamos el esquema de la compra/pasaje
app.delete("/insumo/:id", (req, res) => {
  Insumo.findOneAndUpdate(
    {_id:req.params.id},
    {borrado:true});
});

// modificacion de insumo
// falta testear
app.put("/insumo/:id", (req, res) => {
  Insumo.find({nombre: req.body.name}, (err,found)=>{
    if(err){
      console.log(err);
    } else {
      if(!found.length){ //modifica el insumo porque no hay otro con el nuevo nombre
        Insumo.findOneAndUpdate(
          {_id:req.params.id},
          { nombre: req.body.nombre,
            tipo: req.body.tipo,
            precio: req.body.precio,
            borrado: false,
          },
          (err) => {
            if(err){
              console.log(err);
            }
          });
      } else {
        console.log("El insumo no se puede modificar porque ya existe uno con el mismo nombre");
      }
    }
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
let now = new Date();
let hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0);

// eliminar lugar
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
        Lugar.updateOne(
          {
            _id: req.params.id,
          },
          { borrado: true },
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    }
  );
});

//modificar lugar
app.put("/lugar/:id", (req, res) => {
  Viaje.find(
    {
      ruta: { origen: { idLugar: req.params.id } },
      fecha: { $gte: hoy },
    },
    (err, result) => {
      if (result.length) {
        console.log("No se puede modificar, tiene viaje futuro");
      } else {
        Lugar.updateOne(
          {
            _id: req.params.id,
          },
          {
            ciudad: req.body.ciudad,
            provincia: req.body.ciudad,
            borrado: false,
          },
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    }
  );
});

//listar lugares
app.get("/listar-lugares", (req, res) => {
  Lugar.find({ borrado: false }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.render("listar-lugares", { data: result });
    }
  });
});

//cargar viaje
app.get("/cargar-viaje", (req, res) => {
  let rutas = [];
  Ruta.find({ borrado: false }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      rutas = result;
    }
  });
  if (rutas.lenght) {
    res.render("cargar-viaje", {data: rutas});
  } else {
    console.log("No se encontraron rutas disponibles");
    res.send("No se encontraron rutas disponibles");
  }
});
app.post("/cargar-viaje", (req, res) => {
  let ruta = [];
  let combi = [];
  Ruta.find({
    _id: req.body.ruta
  }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      ruta = result;
    }
  });
  Combi.find({
    _id: ruta.combi.idCombi
  }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      combi = result;
    }
  });
  if (req.body.fecha >= hoy) {
    if (req.body.asientos <= combi.asientos) {
      let v = new Viaje({
        ruta: {
          origen: {
            nombre: ruta.origen.ciudad,
            provincia: ruta.origen.provincia,
          },
          destino: {
            nombre:  ruta.destino.ciudad,
            provincia: ruta.destino.provincia,
          },
          idRuta: ruta._id,
        },
        combi: {
          patente: combi.patente,
          marca: combi.marca,
          modelo: combi.modelo,
        },
        chofer: {
          nombre: combi.chofer.nombre,
          apellido: combi.chofer.apellido,
          mail: combi.chofer.email,
        },
        fecha: req.body.fecha,
        precio: req.body.precio,
        asientosDisponibles: req.body.asientos,
        estado: "En espera",
        borrado: false,
      });
      v.save((err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Viaje cargado");
        }
      });
      res.redirect("/home");
    } else {
      console.log("La cantidad de asientos debe ser menor o igual a " + combi.asientos);
    }
  }else{
    console.log("La fecha debe ser mayor o igual a la actual");
  }
  }
);

// NO TOCAR
app.listen(3000, function () {
  console.log("Server started on port " + port);
});
