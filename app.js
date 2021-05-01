//jshint esversion:6

const express = require("express");
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const Usuario = require("./js/esquema/usuarios");
const Insumo = require("./js/esquema/insumo");
const Combi = require("./js/esquema/combi");
const Lugar = require("./js/esquema/lugar");
const Viaje = require("./js/esquema/viaje");
const Ruta = require("./js/esquema/ruta");
const { find } = require("./js/esquema/usuarios");

const app = express();

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(
  session({
    secret: "Ingenieria de Software II - 2021",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/session" }),
  })
);

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

// variable que devuelve la fecha de hoy
// falta implementar un cron job para que se actualice automaticamente a las 00:00hs
const now = new Date();
const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0);

// GET request al home/inicio de la pagina
app.get("/home", (req, res) => {
  if(req.session.nombre){
  switch (req.session.rol) {
    case "Cliente":
      res.render("home", {});
      break;
    case "Chofer":
      res.render("home-chofer", {});
      break;
    case "Admin":
      res.render("home-admin", {});
      break;
  }}else{
      res.redirect("/");
  }
});

// CRUD Lugar
//
// READ todos los lugares
app.get("/lugares", (req, res) => {
  Lugar.find({}, (err, result) => {
    res.json(result);
  });
});

// READ lugares no borrados
app.get("/listar-lugares", (req, res) => {
  Lugar.find({ borrado: false }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.render("listar-lugares", { data: result });
    }
  });
});

// CREATE lugar
// falta agregar un mensaje de alerta para el usuario cuando se intenta agregar un lugar ya existente
// falta normalizar los datos de entrada para que se guarden siempre capitalizados y no en minuscula o mayuscula
app.get("/cargar-lugar", (req, res) => {
  res.render("cargar-lugar", {});
});

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

// DELETE lugar
app.delete("/lugar/:id", (req, res) => {
  Viaje.find(
    {
      ruta: { origen: { idLugar: req.params.id } },
      fecha: { $gte: new Date() },
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

//UPDATE lugar
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

//CRUD Insumo
//
// READ todos los insumos
app.get("/insumos", (req, res) => {
  Insumo.find({}, (err, result) => {
    res.json(result);
  });
});

// READ todos los insumos no borrados
app.get("/listar-insumos", (req, res) => {
  Insumo.find({ borrado: false }, (err, insumos) => {
    if (err) {
      console.log(err);
    } else {
      res.render("listar-insumos", { data: insumos });
    }
  });
});

//CREATE insumo
//primero busca si ya hay uno con el mismo nombre
app.get("/alta-insumo", (req, res) => {
  res.render("alta-insumo", {});
});

app.post("/alta-insumo", (req, res) => {
  Insumo.find({ nombre: req.body.nombre }, (err, found) => {
    if (err) {
      console.log(err);
    } else {
      if (!found.length) {
        var insumo = new Insumo({
          nombre: req.body.nombre,
          tipo: req.body.tipo,
          precio: req.body.precio,
          borrado: false,
        });
        insumo.save((err) => {
          if (err) {
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

app.get("/rutas", (req, res) => {
  Ruta.find({}, (err, result) => {
    res.json(result);
  });
});

// DELETE Insumo
// faltaria verificar que el insumo no está en compras a futuro, cuando hagamos el esquema de la compra/pasaje
app.delete("/insumo/:id", (req, res) => {
  Insumo.findOneAndUpdate({ _id: req.params.id }, { borrado: true });
});

// UPDATE Insumo
// falta testear
app.put("/insumo/:id", (req, res) => {
  Insumo.find({ nombre: req.body.name }, (err, found) => {
    if (err) {
      console.log(err);
    } else {
      if (!found.length) {
        //modifica el insumo porque no hay otro con el nuevo nombre
        Insumo.findOneAndUpdate(
          { _id: req.params.id },
          {
            nombre: req.body.nombre,
            tipo: req.body.tipo,
            precio: req.body.precio,
            borrado: false,
          },
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );
      } else {
        console.log(
          "El insumo no se puede modificar porque ya existe uno con el mismo nombre"
        );
      }
    }
  });
});

// CRUD Usuario
//
// READ Usuarios no borrados

// CREATE Usuario
//ingresar a registro, si ya inicio sesion lo manda a home
app.get("/", (req, res) => {
  if(!req.session){
    res.redirect("/home");
  }else{
  res.render("inicio", {});
  }
});
//guardar usuario
app.post("/registro", (req, res) => {
  let nombre = req.body.nombre;
  let apellido = req.body.apellido;
  let email = req.body.email;
  let us = new Usuario({
    nombre: nombre,
    apellido: apellido,
    email: email,
    clave: req.body.clave,
    dni: req.body.dni,
    fechaN: req.body.fechaN,
    rol: "Cliente",
    borrado: false,
    suspendido: false,
    categoria: req.body.categoria,
    tarjeta: {
      codigo: req.body.codigo,
      vencimiento: req.body.vencimiento,
      nombreCompleto: req.body.nombreT,
      dni: req.body.dniT
    },
  });
  us.save(err => {
    if (err) {
      res.json({ response: "error" });
    } else {
      req.session.nombre = us.nombre;
      req.session.apellido = us.apellido;
      req.session.rol = us.rol;
      req.session.email = us.email;
      res.json({ response: "bien" });
    }
  })
});
//inicio de sesion
app.post("/iniciar", (req, res) => {
  Usuario.findOne({ email: req.body.email }, (err, us) => {
    if (err) {
      res.json({ response: "Error al autenticar el usuario" });
    } else if (!us) {
      res.json({ response: "Usuario no existe" });
    } else {
      us.claveCorrecta(req.body.clave, (err, result) => {
        if (err) {
          res.json({ response: "Error al autenticar el usuario " });
        } else if (result) {
          req.session.nombre = us.nombre;
          req.session.apellido = us.apellido;
          req.session.rol = us.rol;
          req.session.email = us.email;
          res.json({ response: "bien" });
        } else {
          res.json({ response: "clave incorrecta" });
        }
      });
    }
  });
});
  //cerrarSesion
  app.get("/cerrarSesion",(req,res)=>{
    if(req.session){  
      req.session.destroy(function () {
      req.session = null;
    });
    }
      res.redirect("/");
  })

// UPDATE Usuario

// DELETE Usuario

// CRUD Ruta
//
// READ Rutas no borradas
app.get("/listar-rutas", (req, res) => {
  Ruta.find({ borrado: false }, (err, rutas) => {
    if (err) {
      console.log(err);
    } else {
      res.render("listar-rutas", { data: rutas });
    }
  });
});

// CREATE rutas
app.get("/cargar-rutas", (req, res) => {
  Lugar.find({ borrado: false }, (err, lugares) => {
    if (err) {
      console.log(err);
    } else {
      res.locals.lugares = lugares;
      Combi.find({ borrado: false }, (err, combis) => {
        if (err) {
          console.log(err);
        } else {
          res.locals.combis = combis;
          res.render("cargar-rutas", {});
        }
      });
    }
  });
});
app.post("/cargar-rutas", (req, res) => {
  Lugar.findOne({ _id: req.body.origen }, (err, origenR) => {
    Lugar.findOne({ _id: req.body.destino }, (err, destinoR) => {
      Combi.findOne({ _id: req.body.combi }, (err, combiR) => {
        var ruta = new Ruta({
          origen: {
            nombre: origenR.ciudad,
            provincia: origenR.provincia,
            idLugar: origenR._id,
          },
          destino: {
            nombre: destinoR.ciudad,
            provincia: destinoR.provincia,
            idLugar: destinoR._id,
          },
          combi: {
            patente: combiR.patente,
            marca: combiR.marca,
            modelo: combiR.modelo,
            idCombi: combiR._id,
          },
          distancia: req.body.distancia,
          hora: req.body.hora,
          borrado: false,
        });
        ruta.save((err) => {
          if (err) {
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

// DELETE Ruta
app.delete("/ruta/:id", (req, res) => {
  Viaje.find({ ruta:{idRuta:req.params.id},
    fecha:{$gte:hoy},
    borrado:false,},(err, viajes) => {
    if(err){
      console.log(err);
    } else {
      if(viajes.length){
        console.log("No se puede eliminar la ruta porque tiene viajes a futuro");
      } else {
        Ruta.findOneAndUpdate({ _id: req.params.id }, { borrado: true });        
      }
    }
  });
});

// UPDATE Ruta
app.put("/ruta/:id", (req, res) => {
  Viaje.find({ ruta:{idRuta:req.params.id},
    fecha:{$gte:hoy},
    borrado:false,},(err, viajes) => {
    if(err){
      console.log(err);
    } else {
      if(viajes.length){
        console.log("No se puede modificar la ruta porque tiene viajes a futuro");
      } else {
        Lugar.findOne({ _id: req.body.origen }, (err, origenR) => {
          Lugar.findOne({ _id: req.body.destino }, (err, destinoR) => {
            Combi.findOne({ _id: req.body.combi }, (err, combiR) => {
              Ruta.findOneAndUpdate({ _id: req.params.id },
              {
               origen: {
                 nombre: origenR.ciudad,
                 provincia: origenR.provincia,
                 idLugar: origenR._id,
               },
               destino: {
                 nombre: destinoR.ciudad,
                 provincia: destinoR.provincia,
                 idLugar: destinoR._id,
               },
               combi: {
                 patente: combiR.patente,
                 marca: combiR.marca,
                 modelo: combiR.modelo,
                 idCombi: combiR._id,
               },
               distancia: req.body.distancia,
               hora: req.body.hora,
               borrado: false,
              });
            });
          });
        });
      }           
    }
  });
});

// CRUD Viaje
//
//CREATE viaje
app.get("/cargar-viaje", (req, res) => {
  Ruta.find({ borrado: false }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (rutas.lenght) {
        res.render("cargar-viaje", { data: rutas });
      } else {
        console.log("No se encontraron rutas disponibles");
        res.send("No se encontraron rutas disponibles");
      }
    }
  });
});
app.post("/cargar-viaje", (req, res) => {
  Ruta.find(
    {
      _id: req.body.ruta,
    },
    (err, rutaResult) => {
      if (err) {
        console.log(err);
      } else {
        Combi.find(
          {
            _id: rutaResult.combi.idCombi,
          },
          (err, combiResult) => {
            if (err) {
              console.log(err);
            } else {
              if (req.body.fecha >= hoy) {
                if (req.body.asientos <= combiResult.asientos) {
                  let v = new Viaje({
                    ruta: {
                      origen: {
                        nombre: rutaResult.origen.ciudad,
                        provincia: rutaResult.origen.provincia,
                      },
                      destino: {
                        nombre: rutaResult.destino.ciudad,
                        provincia: rutaResult.destino.provincia,
                      },
                      idRuta: rutaResult._id,
                    },
                    combi: {
                      patente: combiResult.patente,
                      marca: combiResult.marca,
                      modelo: combiResult.modelo,
                    },
                    chofer: {
                      nombre: combiResult.chofer.nombre,
                      apellido: combiResult.chofer.apellido,
                      mail: combiResult.chofer.email,
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
                  console.log(
                    "La cantidad de asientos debe ser menor o igual a " +
                    combi.asientos
                  );
                }
              } else {
                console.log("La fecha debe ser mayor o igual a la actual");
              }
            }
          }
        );
      }
    }
  );
});

// UPDATE VIAJE

// DELETE VIAJE

// NO TOCAR
app.listen(3000, function () {
  console.log("Server started on port " + port);
});


