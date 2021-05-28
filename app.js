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
const Pasaje = require("./js/esquema/pasaje");
const Comentario = require("./js/esquema/comentario");
const Tarjeta = require("./js/esquema/tarjeta");

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

// transformar req.fecha a Date
function transformarFecha(fecha) {
  return new Date(Date.parse(fecha));
}

// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set("useFindAndModify", false);

//
// COMENTARIO DE PRUEBA
// let c = new Comentario({
//   nombre: "Pepito",
//  apellido: "Perez3",
//  email: "pep2@gmail.com",
//  fecha: "2019-10-12T18:00:00.000+00:00",
//  texto: "asdasd",
//
// });
// c.save((err) => {
//   console.log(err);
// });

// GET request al home/inicio de la pagina
app.get("/home", (req, res) => {
  if (req.session.nombre) {
    switch (req.session.rol) {
      case "Chofer":
        res.render("home-chofer", {});
        break;
      case "Admin":
        res.render("home-admin", {});
        break;
      default:
        Comentario.find(
          {},
          null,
          { sort: { fecha: -1 } },
          (err, resultComentario) => {
            if (err) {
              console.log(err);
            } else {
              // res.locals.comentarios = resultComentario;
              res.locals.miEmail = req.session.email;
              Lugar.find({ borrado: false }, (err, result) => {
                if (result) {
                  res.locals.lugares = result;
                }
                res.render("home", {
                  data: req.session.rol,
                  comentarios: resultComentario,
                });
              });
            }
          }
        );
        break;
    }
  } else {
    res.redirect("/");
  }
});

// CRUD Comentario
//
// CREATE Comentario
app.get("/crear-comentario", (req, res) => {
  if (
    req.session.rol !== "Cliente comun" &&
    req.session.rol !== "Cliente gold"
  ) {
    res.redirect("/");
  } else {
    res.render("crear-comentario", { data: req.session });
  }
});

app.post("/crear-comentario", (req, res) => {
  Pasaje.findOne({ emailPasajero: req.body.email }, (err, found) => {
    if (err) {
      console.log(err);
    } else {
      if (found) {
        var c = new Comentario({
          nombre: req.body.nombre,
          apellido: req.body.apellido,
          email: req.body.email,
          fecha: now,
          texto: req.body.texto,
          modificado: false,
        });
        c.save((err) => {
          if (err) {
            console.log(err);
            res.json({ response: "error al guardar el comentario" });
          } else {
            res.json({ response: "bien" });
          }
        });
      } else {
        res.json({
          response: "Debe tener pasajes comprados para realizar un comentario",
        });
      }
    }
  });
});

// UPDATE Comentario
app.get("/modificar-comentario/:id", (req, res) => {
  if (
    req.session.rol !== "Cliente comun" &&
    req.session.rol !== "Cliente gold"
  ) {
    res.redirect("/");
  } else {
    Comentario.findOne({ _id: req.params.id }, (err, resultComentario) => {
      if (err) {
        res.redirect("/");
      } else {
        res.render("modificar-comentario", { data: resultComentario });
      }
    });
  }
});
app.put("/modificar-comentario", (req, res) => {
  Comentario.findOneAndUpdate(
    { _id: req.body.id },
    {
      // cambia la fecha en la modificacion? fecha: now,
      texto: req.body.texto,
      modificado: true,
    },
    (err, result) => {
      if (err) {
        console.log(err);
        res.json({
          response: "Lo sentimos ocurrio un error intentelo en un momento",
        });
      } else {
        res.json({ response: "bien" });
      }
    }
  );
});

// CRUD Lugar
//
// READ todos los lugares
app.get("/lugares", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Lugar.find({}, (err, result) => {
      res.json(result);
    });
  }
});

// READ lugares no borrados
app.get("/listar-lugares", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Lugar.find({ borrado: false }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.render("listar-lugares", { data: result });
      }
    });
  }
});

// CREATE lugar
// falta normalizar los datos de entrada para que se guarden siempre capitalizados y no en minuscula o mayuscula
app.get("/cargar-lugar", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    res.render("cargar-lugar", {});
  }
});

app.post("/cargar-lugar", (req, res) => {
  var l = new Lugar({
    ciudad: req.body.ciudad,
    provincia: req.body.provincia,
    borrado: false,
  });
  Lugar.findOne(
    {
      ciudad: req.body.ciudad,
      provincia: req.body.provincia,
      borrado: false,
    },
    (err, result) => {
      if (!err) {
        if (result) {
          res.json({ response: "Ya existe un lugar identico" });
        } else {
          l.save((err) => {
            if (err) {
              res.json({ response: "Ya existe un lugar identico" });
            } else {
              res.json({ response: "bien" });
            }
          });
        }
      }
    }
  );
});

// DELETE lugar
app.delete("/lugar/:id", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Lugar.findOne({ _id: req.params.id }, (err, resLugar) => {
      if (err) {
        res.json({
          response:
            "Error al conectar en la base de datos, intentelo en unos minutos",
        });
      } else {
        Ruta.findOne(
          {
            $or: [
              {
                "origen.nombre": resLugar.ciudad,
                "origen.provincia": resLugar.provincia,
              },
              {
                "destino.nombre": resLugar.ciudad,
                "destino.provincia": resLugar.provincia,
              },
            ],
            borrado: false,
          },
          (err, result) => {
            if (result !== null) {
              res.json({ response: "No se puede borrar, tiene ruta asignada" });
            } else {
              Lugar.updateOne(
                {
                  _id: req.params.id,
                },
                { borrado: true },
                (err) => {
                  if (err) {
                    console.log(err);
                  } else {
                    res.json({ response: "bien" });
                  }
                }
              );
            }
          }
        );
      }
    });
  }
});

//UPDATE lugar
app.get("/modificar-lugar/:id", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Lugar.findOne(
      { _id: req.params.id, borrado: false },
      (err, resultLugar) => {
        if (err) {
          res.redirect("/listar-lugares");
        } else {
          res.render("modificar-lugar", { data: resultLugar });
        }
      }
    );
  }
});
app.put("/modificar-lugar", (req, res) => {
  //hay que verificar si el lugar está como destino de una ruta
  Lugar.findOne({ _id: req.body.id }, (err, resLugar) => {
    if (err) {
      console.log(err);
    } else {
      Ruta.findOne(
        {
          $or: [
            {
              "origen.nombre": resLugar.ciudad,
              "origen.provincia": resLugar.provincia,
            },
            {
              "destino.nombre": resLugar.ciudad,
              "destino.provincia": resLugar.provincia,
            },
          ],
          borrado: false,
        },
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            Lugar.findOne(
              {
                ciudad: req.body.ciudad,
                provincia: req.body.provincia,
                _id: { $ne: req.body.id },
                borrado: false,
              },
              (err, found) => {
                if (err) {
                  console.log(err);
                } else {
                  if (found) {
                    res.json({
                      response:
                        "No se puede modificar ya existe un lugar con la misma ciudad y provincia",
                    });
                  } else {
                    Lugar.updateOne(
                      {
                        _id: req.body.id,
                      },
                      {
                        ciudad: req.body.ciudad,
                        provincia: req.body.provincia,
                      },
                      (err) => {
                        if (err) {
                          console.log(err);
                        } else {
                          Ruta.updateMany(
                            {
                              "origen.idLugar": req.body.id,
                            },
                            {
                              origen: {
                                nombre: req.body.ciudad,
                                provincia: req.body.provincia,
                                idLugar: resLugar._id,
                              },
                            },
                            (err) => {
                              if (err) {
                                console.log(err);
                              }
                            }
                          );
                          Ruta.updateMany(
                            {
                              "destino.idLugar": req.body.id,
                            },
                            {
                              destino: {
                                nombre: req.body.ciudad,
                                provincia: req.body.provincia,
                                idLugar: resLugar._id,
                              },
                            },
                            (err, result) => {
                              if (err) {
                                console.log(err);
                              }
                            }
                          );
                          Ruta.find(
                            {
                              $or: [
                                {
                                  "origen.nombre": req.body.ciudad,
                                  "origen.provincia": req.body.provincia,
                                },
                                {
                                  "destino.nombre": req.body.ciudad,
                                  "destino.provincia": req.body.provincia,
                                },
                              ],
                              borrado: false,
                            },
                            (err, result) => {
                              if (err) {
                                console.log(err);
                              } else {
                                result.forEach((e) => {
                                  Viaje.updateMany(
                                    { "ruta.idRuta": e._id },
                                    {
                                      ruta: {
                                        origen: {
                                          nombre: e.origen.nombre,
                                          provincia: e.origen.provincia,
                                        },
                                        destino: {
                                          nombre: e.destino.nombre,
                                          provincia: e.destino.provincia,
                                        },
                                        idRuta: e._id,
                                      },
                                    },
                                    (err) => {
                                      if (err) {
                                        console.log(err);
                                      }
                                    }
                                  );
                                });
                              }
                            }
                          );
                          res.json({ response: "bien" });
                        }
                      }
                    );
                  }
                }
              }
            );
          }
        }
      );
    }
  });
});

//CRUD Insumo
//
// READ todos los insumos
app.get("/insumos", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Insumo.find({}, (err, result) => {
      res.json(result);
    });
  }
});

// READ todos los insumos no borrados
app.get("/listar-insumos", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Insumo.find({ borrado: false }, (err, insumos) => {
      if (err) {
        console.log(err);
      } else {
        res.render("listar-insumos", { data: insumos });
      }
    });
  }
});

//CREATE insumo
//primero busca si ya hay uno con el mismo nombre
app.get("/alta-insumo", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    res.render("alta-insumo", {});
  }
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
            res.json({ response: "Ya Existe un insumo con el mismo nombre" });
          } else {
            res.json({ response: "bien" });
          }
        });
      } else {
        res.json({ response: "Ya Existe un insumo con el mismo nombre" });
      }
    }
  });
});

// DELETE Insumo
// FALTA CREAR PASAJES CON INSUMOS COMPRADOS PARA TESTEAR
app.delete("/insumo/:id", (req, res) => {
  //busca en los pasajes a futuro si hay uno con el mismo nombre
  Insumo.findOne({ _id: req.params.id }, (err, resultInsumo) => {
    Pasaje.findOne(
      {
        fecha: { $gte: hoy },
        insumos: { $elemMatch: { nombre: resultInsumo.nombre } },
      },
      (err, resultPasaje) => {
        if (resultPasaje !== null) {
          res.json({
            response:
              "No se puede eliminar el insumo porque ha sido comprado en viajes a futuro",
          });
        } else {
          Insumo.updateOne(
            { _id: resultInsumo._id },
            { borrado: true },
            (err) => {
              if (err) {
                console.log(err);
              } else {
                res.json({
                  response: "bien",
                });
              }
            }
          );
        }
      }
    );
  });
});

// UPDATE Insumo
app.get("/modificar-insumo/:id", (req, res) => {
  //findOne poner en una variable y enviar eso en el data de render
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Insumo.findOne(
      { _id: req.params.id, borrado: false },
      (err, resultInsumo) => {
        if (err) {
          res.redirect("/");
        } else {
          res.render("modificar-insumo", { data: resultInsumo });
        }
      }
    );
  }
});
app.put("/modificar-insumo", (req, res) => {
  //busca insumos con el mismo nombre, pero diferente id
  Insumo.findOne(
    { nombre: req.body.nombre, _id: { $ne: req.body.id }, borrado: false },
    (err, found) => {
      if (err) {
        console.log(err);
      } else {
        if (!found) {
          //modifica el insumo porque no hay otro con el nuevo nombre
          Insumo.findOneAndUpdate(
            { _id: req.body.id },
            {
              nombre: req.body.nombre,
              tipo: req.body.tipo,
              precio: req.body.precio,
              borrado: false,
            },
            (err) => {
              if (err) {
                res.json({
                  response:
                    "Lo sentimos ocurrio un error intentelo en un momento",
                });
              } else {
                res.json({ response: "bien" });
              }
            }
          );
        } else {
          res.json({
            response:
              "El insumo no se puede modificar porque ya existe uno con el mismo nombre",
          });
        }
      }
    }
  );
});

// CRUD Usuario
//
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
          if (us.borrado || us.suspendido) {
            res.json({ response: "suspendido" });
          } else {
            req.session.nombre = us.nombre;
            req.session.apellido = us.apellido;
            req.session.rol = us.rol;
            req.session.email = us.email;
            res.json({ response: "bien" });
          }
        } else {
          res.json({ response: "clave incorrecta" });
        }
      });
    }
  });
});

//cerrarSesion
app.get("/cerrarSesion", (req, res) => {
  if (req.session.nombre) {
    req.session.destroy(function () {
      req.session = null;
    });
  }
  res.redirect("/");
});

// READ Usuarios no borrados
// Listar choferes
app.get("/listar-chofer", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Usuario.find({ borrado: false, rol: "Chofer" }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        let dat = [];
        result.forEach(function (chofer) {
          dat.push({
            nombre: chofer.nombre,
            apellido: chofer.apellido,
            email: chofer.email,
            telefono: chofer.telefono,
            id: chofer._id,
          });
        });
        res.render("listar-choferes", {
          data: dat,
        });
      }
    });
  }
});
//detalle Chofer
app.get("/detalle-chofer/:email", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Usuario.findOne(
      { email: req.params.email, rol: "Chofer", borrado: false },
      (err, result) => {
        if (!result) {
          res.redirect("/listar-chofer");
        } else {
          Combi.find({ borrado: false }, (err, combi) => {
            if (err) {
              console.log(err);
            } else {
              let c = [];
              combi.forEach(function (combi) {
                if (combi.chofer.email === req.params.email) {
                  c.push({
                    patente: combi.patente,
                  });
                }
              });
              res.render("detalle-chofer", {
                data: { chofer: result, combi: c },
              });
            }
          });
        }
      }
    );
  }
});

// CREATE Usuario
//ingresar a registro, si ya inicio sesion lo manda a home
app.get("/", (req, res) => {
  if (req.session.nombre) {
    res.redirect("/home");
  } else {
    res.render("inicio", {});
  }
});
//guardar usuario
app.post("/registro", (req, res) => {
  let us;
  if (req.body.categoria === "gold") {
    Tarjeta.findOne({ codigo: req.body.codigo }, (err, result) => {
      if (err) {
        res.json({ response: "error en la conexion con el banco" });
      } else {
        if (!result) {
          res.json({ response: "Tarjeta inexistente" });
        } else {
          if (
            result.dni === req.body.dniT &&
            Date.parse(result.vencimiento) ==
              Date.parse(req.body.vencimiento + "-01") &&
            result.nombreCompleto === req.body.nombreT &&
            result.codSeguridad === req.body.codS
          ) {
            if (result.monto >= 250) {
              us = new Usuario({
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                email: req.body.email,
                clave: req.body.clave,
                dni: req.body.dni,
                fechaN: req.body.fechaN,
                rol: "Cliente " + req.body.categoria,
                borrado: false,
                suspendido: false,
                categoria: req.body.categoria,
                tarjeta: {
                  codigo: req.body.codigo,
                  vencimiento: req.body.vencimiento,
                  nombreCompleto: req.body.nombreT,
                  dni: req.body.dniT,
                },
              });
              us.save((err) => {
                if (err) {
                  res.json({ response: "error" });
                } else {
                  Tarjeta.updateOne(
                    { codigo: result.codigo },
                    { monto: result.monto - 250 },
                    (err) => {
                      if (err) {
                        res.json({
                          response:
                            "Problemas en la conexion con el banco. Intentelo en unos minutos ",
                        });
                      } else {
                        req.session.nombre = us.nombre;
                        req.session.apellido = us.apellido;
                        req.session.rol = us.rol;
                        req.session.email = us.email;
                        req.session.categoria = us.categoria;
                        res.json({ response: "bien" });
                      }
                    }
                  );
                }
              });
            } else {
              res.json({
                response:
                  "Tarjeta sin fondos suficientes para realizar el pago",
              });
            }
          } else {
            res.json({ response: "Datos de la tarjeta incorrectos" });
          }
        }
      }
    });
  } else {
    let nombre = req.body.nombre;
    let apellido = req.body.apellido;
    let email = req.body.email;
    us = new Usuario({
      nombre: nombre,
      apellido: apellido,
      email: email,
      clave: req.body.clave,
      dni: req.body.dni,
      fechaN: req.body.fechaN,
      rol: "Cliente " + req.body.categoria,
      borrado: false,
      suspendido: false,
      categoria: req.body.categoria,
    });
    us.save((err) => {
      if (err) {
        res.json({ response: "error" });
      } else {
        req.session.nombre = us.nombre;
        req.session.apellido = us.apellido;
        req.session.rol = us.rol;
        req.session.email = us.email;
        req.session.categoria = us.categoria;
        res.json({ response: "bien" });
      }
    });
  }
});

//altaChofer
app.get("/alta-chofer", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    res.render("alta-chofer", {});
  }
});
app.post("/alta-chofer", (req, res) => {
  let us = new Usuario({
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    email: req.body.email,
    clave: req.body.clave,
    dni: req.body.dni,
    rol: "Chofer",
    borrado: false,
    suspendido: false,
    telefono: req.body.telefono,
  });
  us.save((err) => {
    if (err) {
      res.json({ response: "error" });
    } else {
      res.json({ response: "bien" });
    }
  });
});

// UPDATE Usuario
app.get("/modificar-chofer/:email", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Usuario.findOne(
      { email: req.params.email, rol: "Chofer", borrado: false },
      (err, chofer) => {
        if (err) {
          res.redirect("/listar-chofer");
        } else {
          if (!chofer) {
            res.redirect("/listar-chofer");
          } else {
            res.render("modificar-chofer", { data: chofer });
          }
        }
      }
    );
  }
});
app.get("/modificar-perfil", (req, res) => {
  if (req.session.rol !== "Cliente comun" && req.session.rol !== "Cliente gold") {
    res.redirect("/");
  } else {
    Usuario.findOne(
      { email: req.session.email, borrado: false },
      (err, usuario) => {
        if (err) {
          res.redirect("/");
        } else {
          res.render("modificar-perfil", { data: usuario });
        }
      }
    );
  }
});

app.post("/modificar-perfil", (req, res) => {

  Usuario.findOne({ email: req.session.email }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      Usuario.findOne({ email: req.body.email, _id: { $ne: result._id } }, (err, resultC) => {
        if (resultC) {
          res.json({ response: { lugar: "email", error: "El email introducido esta siendo usado por otro usuario" } });
        } else {
          let email = req.session.email;
          if (req.body.cat === "gold") {
            Tarjeta.findOne({ codigo: req.body.cod }, (err, result) => {
              if (err) {
                res.json({ response: { lugar: "err", error: "Error en la conexion con el banco" } });
              } else {
                if (!result) {
                  res.json({ response: { lugar: "err", error: "Tarjeta inexistente" } });
                } else {
                  if (
                    result.dni === req.body.dniT &&
                    Date.parse(result.vencimiento) ==
                    Date.parse(req.body.vencimiento + "-01") &&
                    result.nombreCompleto === req.body.nombreT &&
                    result.codSeguridad === req.body.seg
                  ) {
                    if (result.monto >= 250) {
                      us = new Usuario({
                        nombre: req.body.nombre,
                        apellido: req.body.apellido,
                        email: req.body.email,
                        clave: req.body.clave,
                        dni: req.body.dni,
                        fechaN: req.body.fechaN,
                        rol: "Cliente " + req.body.cat,
                        borrado: false,
                        suspendido: false,
                        categoria: req.body.cat,
                        tarjeta: {
                          codigo: req.body.cod,
                          vencimiento: req.body.vencimiento,
                          nombreCompleto: req.body.nombreT,
                          dni: req.body.dniT,
                        },
                      });
                      Tarjeta.updateOne(
                        { codigo: result.codigo },
                        { monto: result.monto - 250 },
                        (err) => {
                          if (err) {
                            res.json({ response: { lugar: "err", error: "Problemas en la conexion con el banco. Intentelo en unos minutos " } });
                          } else {
                            Usuario.deleteOne({ email: email }, (error) => {
                              if (!error) {
                                us.save((err) => {
                                  if (err) {
                                    res.json({ response: { lugar: "err", error: "Lo sentimos hubo un error al queres modificar el perfil" } });
                                  } else {
                                    Comentario.updateMany({email:email},{nombre: req.body.nombre, apellido: req.body.apellido, email:req.body.email});
                                    Pasaje.updateMany({ emailPajajero: email }, {  emailPasajero: req.body.email });
                                    req.session.nombre = us.nombre;
                                    req.session.apellido = us.apellido;
                                    req.session.rol = us.rol;
                                    req.session.email = us.email;
                                    req.session.categoria = us.categoria;
                                    res.json({ response: "bien" });
                                  }
                                });
                              } else {
                                res.json({ response: { lugar: "err", error: "Lo sentimos hubo un error al queres modificar el perfil" } })
                              }
                            });
                          }
                        })

                    } else {
                      res.json({ response: { lugar: "err", error: "Tarjeta sin fondos suficientes para realizar el pago" } });
                    }
                  } else {
                    res.json({ response: { lugar: "err", error: "Datos de la tarjeta incorrectos" } });
                  }
                }
              }
            });
          } else {
            let nombre = req.body.nombre;
            let apellido = req.body.apellido;
            us = new Usuario({
              nombre: nombre,
              apellido: apellido,
              email: req.body.email,
              clave: req.body.clave,
              dni: req.body.dni,
              fechaN: req.body.fechaN,
              rol: "Cliente " + req.body.cat,
              borrado: false,
              suspendido: false,
              categoria: req.body.cat,
            });
            Usuario.deleteOne({ email: email }, (error) => {
              if (!error) {
                us.save((err) => {
                  if (err) {
                    res.json({ response: { lugar: "err", error: "Lo sentimos hubo un error al queres modificar el perfil" } });
                  } else {
                    Comentario.updateMany({ email: email }, { nombre: req.body.nombre, apellido: req.body.apellido, email: req.body.email });
                    Pasaje.updateMany({ emailPajajero: email }, { emailPasajero: req.body.email });
                    req.session.nombre = us.nombre;
                    req.session.apellido = us.apellido;
                    req.session.rol = us.rol;
                    req.session.email = us.email;
                    req.session.categoria = us.categoria;
                    res.json({ response: "bien" });
                  }
                });
              } else {
                res.json({ response: { lugar: "err", error: "Lo sentimos hubo un error al queres modificar el perfil" } })
              }
            })
          }


        }
      })
    }
  })
});

app.put("/modificar-chofer", (req, res) => {
  Usuario.findOne({ _id: req.body.id }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      let email = result.email;
      Usuario.findOne(
        { email: req.body.email, _id: { $ne: req.body.id } },
        (err, result) => {
          if (!result) {
            Usuario.deleteOne({ _id: req.body.id }, (err) => {
              if (err) {
                console.log(err);
                res.json({ response: "error en eliminar" });
              } else {
                let us = new Usuario({
                  nombre: req.body.nombre,
                  apellido: req.body.apellido,
                  email: req.body.email,
                  clave: req.body.clave,
                  dni: req.body.dni,
                  rol: "Chofer",
                  borrado: false,
                  suspendido: false,
                  telefono: req.body.telefono,
                });
                us.save((err) => {
                  if (err) {
                    res.json({ response: "error" });
                  } else {
                    Combi.updateMany(
                      { "chofer.email": email },
                      {
                        chofer: {
                          nombre: req.body.nombre,
                          apellido: req.body.apellido,
                          email: req.body.email,
                        },
                      },
                      (err) => {
                        if (err) {
                          console.log(err);
                        }
                      }
                    );
                    Viaje.updateMany(
                      { "chofer.email": email, fecha: { $gte: hoy } },
                      {
                        chofer: {
                          nombre: req.body.nombre,
                          apellido: req.body.apellido,
                          email: req.body.email,
                        },
                      },
                      (err) => {
                        if (err) {
                          console.log(err);
                        }
                      }
                    );
                    res.json({ response: "bien" });
                  }
                });
              }
            });
          } else {
            res.json({ response: "error" });
          }
        }
      );
    }
  });
});

// DELETE Usuario

app.delete("/eliminar-chofer/:email", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Combi.find(
      {
        "chofer.email": req.params.email,
        borrado: false,
      },
      (err, viajes) => {
        if (err) {
          console.log(err);
        } else {
          if (viajes.length) {
            res.json({
              response: "No se puede eliminar esta asignado a combis",
            });
          } else {
            Viaje.find(
              {
                "chofer.email": req.params.email,
                borrado: false,
                fecha: { $gte: hoy },
              },
              (err, viajes) => {
                if (err) {
                  console.log(err);
                } else {
                  if (viajes.length) {
                    res.json({
                      response: "No se puede eliminar esta asignado a viajes",
                    });
                  } else {
                    Usuario.updateOne(
                      { email: req.params.email },
                      { borrado: true },
                      (err) => {
                        if (err) {
                          res.json({ response: "error" });
                        } else {
                          res.json({ response: "bien" });
                        }
                      }
                    );
                  }
                }
              }
            );
          }
        }
      }
    );
  }
});
// CRUD Combi
//
// READ  Combi
app.get("/listar-combi", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Combi.find({ borrado: false }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        let dat = [];
        result.forEach(function (combi) {
          dat.push({
            patente: combi.patente,
            marca: combi.marca,
            modelo: combi.modelo,
            tipo: combi.tipo,
            nombre: combi.chofer.nombre,
            apellido: combi.chofer.apellido,
          });
        });
        res.render("listar-combi", {
          data: dat,
        });
      }
    });
  }
});
app.get("/detalles-combi/:patente", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Combi.findOne(
      { patente: req.params.patente, borrado: false },
      (err, result) => {
        if (err) {
          res.redirect("/listar-combi");
        } else {
          res.render("detalle-combi", { data: result });
        }
      }
    );
  }
});
// CREATE Combi

//alta combi
app.get("/alta-combi", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Usuario.find({ borrado: false, rol: "Chofer" }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        let dat = [];
        result.forEach(function (chofer) {
          dat.push({
            nombre: chofer.nombre,
            apellido: chofer.apellido,
            email: chofer.email,
          });
        });
        res.render("alta-combi", {
          data: dat,
        });
      }
    });
  }
});
//guardar combi
app.post("/alta-combi", (req, res) => {
  Usuario.findOne(
    { email: req.body.chofer, rol: "Chofer", borrado: false },
    (err, result) => {
      if (err) {
        res.json({ response: "errorC" });
      } else {
        if (!result) {
          res.json({ response: "errorC" });
        } else {
          let combi = new Combi({
            patente: req.body.patente,
            marca: req.body.marca,
            modelo: req.body.modelo,
            chofer: {
              nombre: result.nombre,
              apellido: result.apellido,
              email: result.email,
            },
            asientos: req.body.asientos,
            tipo: req.body.tipo,
            borrado: false,
          });
          combi.save((err) => {
            if (err) {
              res.json({ response: "errorP" });
            } else {
              res.json({ response: "bien" });
            }
          });
        }
      }
    }
  );
});
// DELETE Combi
app.delete("/eliminar-combi/:patente", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Viaje.find(
      {
        "combi.patente": req.params.patente,
        fecha: { $gte: hoy },
        borrado: false,
      },
      (err, viajes) => {
        if (err) {
          console.log(err);
        } else {
          if (viajes.length) {
            res.json({ response: "hay viajes" });
          } else {
            Ruta.find(
              {
                "combi.patente": req.params.patente,
                borrado: false,
              },
              (err, ruta) => {
                if (err) {
                  console.log(err);
                } else {
                  if (ruta.length) {
                    res.json({
                      response:
                        "No se puede eliminar por que esta asiganada a rutas",
                    });
                  } else {
                    Combi.updateOne(
                      { patente: req.params.patente },
                      { borrado: true },
                      (err) => {
                        if (err) {
                          console.log(2);
                          res.json({ response: "error" });
                        } else {
                          res.json({ response: "bien" });
                        }
                      }
                    );
                  }
                }
              }
            );
          }
        }
      }
    );
  }
});
//UPDATE Combi
app.get("/modificar-combi/:patente", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Combi.findOne(
      { patente: req.params.patente, borrado: false },
      (err, combi) => {
        if (err) {
          res.redirect("/listar-combi");
        } else {
          Usuario.find({ borrado: false, rol: "Chofer" }, (err, result) => {
            if (err) {
              console.log(err);
            } else {
              let dat = [];
              result.forEach(function (chofer) {
                dat.push({
                  nombre: chofer.nombre,
                  apellido: chofer.apellido,
                  email: chofer.email,
                });
              });
              res.render("modificar-combi", {
                data: {
                  combi: combi,
                  choferes: dat,
                },
              });
            }
          });
        }
      }
    );
  }
});

app.put("/modificar-combi", (req, res) => {
  Usuario.findOne({ email: req.body.chofer, borrado: false }, (err, result) => {
    if (!result) {
      res.json({ response: "errorC" });
    } else {
      Combi.updateOne(
        { _id: req.body.id },
        {
          patente: req.body.patente,
          marca: req.body.marca,
          modelo: req.body.modelo,
          chofer: {
            nombre: result.nombre,
            apellido: result.apellido,
            email: result.email,
          },
          asientos: req.body.asientos,
          tipo: req.body.tipo,
        },
        (error) => {
          if (error) {
            res.json({ response: "errorP" });
          } else {
            Viaje.updateMany(
              { "combi.patente": req.body.patenteV },
              {
                combi: {
                  patente: req.body.patente,
                  marca: req.body.marca,
                  modelo: req.body.modelo,
                  tipo: req.body.tipo,
                },
              },
              (err) => {
                if (err) {
                  console.log(err);
                }
              }
            );
            Viaje.updateMany(
              { "combi.patente": req.body.patenteV, fecha: { $gte: hoy } },
              {
                chofer: {
                  nombre: result.nombre,
                  apellido: result.apellido,
                  mail: result.email,
                },
              },
              (err) => {
                if (err) {
                  console.log(err);
                }
              }
            );
            res.json({ response: "bien" });
          }
        }
      );
    }
  });
});

// CRUD Ruta
//
// READ Rutas no borradas
app.get("/listar-rutas", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Ruta.find({ borrado: false }, (err, rutas) => {
      if (err) {
        console.log(err);
      } else {
        res.render("listar-rutas", { data: rutas });
      }
    });
  }
});

// CREATE rutas
app.get("/cargar-rutas", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
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
  }
});
app.post("/cargar-rutas", (req, res) => {
  Lugar.findOne({ _id: req.body.origen }, (err, origenR) => {
    if (err) {
      res.json({
        response:
          "El lugar de Origen no existe por favor selecione uno de la lista",
      });
    } else {
      Lugar.findOne({ _id: req.body.destino }, (err, destinoR) => {
        if (err) {
          res.json({
            response:
              "El lugar de Destino no existe por favor selecione uno de la lista",
          });
        } else {
          Combi.findOne({ patente: req.body.combi }, (err, combiR) => {
            if (err) {
              res.json({
                response:
                  "La combi no existe por favor selecione uno de la lista",
              });
            } else {
              Ruta.findOne(
                {
                  "origen.nombre": origenR.ciudad,
                  "origen.provincia": origenR.provincia,
                  "origen.idLugar": origenR._id,
                  "destino.nombre": destinoR.ciudad,
                  "destino.provincia": destinoR.provincia,
                  "destino.idLugar": destinoR._id,
                  "combi.patente": combiR.patente,
                  "combi.marca": combiR.marca,
                  "combi.modelo": combiR.modelo,
                  "combi.tipo": combiR.tipo,
                  "combi.idCombi": combiR._id,
                  distancia: req.body.distancia,
                  hora: req.body.hora,
                  borrado: false,
                },
                (err, resultRuta) => {
                  if (err) {
                    console.log(err);
                  } else {
                    if (resultRuta !== null) {
                      res.json({ response: "La ruta ya existe" });
                    } else {
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
                          tipo: combiR.tipo,
                          idCombi: combiR._id,
                        },
                        distancia: req.body.distancia,
                        hora: req.body.hora,
                        borrado: false,
                      });
                      ruta.save((err) => {
                        if (err) {
                          console.log(err);
                          res.json({
                            response:
                              "Lo sentimos no se pudo guardar la ruta.Intentelo en unos minutos",
                          });
                        } else {
                          res.json({ response: "bien" });
                        }
                      });
                    }
                  }
                }
              );
            }
          });
        }
      });
    }
  });
});

// DELETE Ruta
app.delete("/ruta/:id", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Viaje.findOne(
      {
        "ruta.idRuta": req.params.id,
        fecha: { $gte: hoy },
        borrado: false,
      },
      (err, viajes) => {
        if (err) {
          console.log(err);
        } else {
          if (viajes !== null) {
            res.json({
              response:
                "No se puede eliminar la ruta porque tiene viajes a futuro",
            });
          } else {
            Ruta.updateOne(
              { _id: req.params.id },
              { borrado: true },
              (err, resultRuta) => {
                if (err) {
                  console.log(err);
                } else {
                  res.json({ response: "bien" });
                }
              }
            );
          }
        }
      }
    );
  }
});

// UPDATE Ruta
app.get("/modificar-ruta/:id", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Ruta.findOne({ _id: req.params.id, borrado: false }, (err, resultRuta) => {
      if (err) {
        console.log(err);
      } else {
        res.locals.ruta = resultRuta;
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
                res.render("modificar-ruta", {});
              }
            });
          }
        });
      }
    });
  }
});
app.put("/modificar-ruta", (req, res) => {
  Viaje.findOne(
    {
      "ruta.idRuta": req.body.id,
      fecha: { $gte: hoy },
      borrado: false,
    },
    (err, viajes) => {
      if (err) {
        console.log(err);
      } else {
        if (viajes !== null) {
          res.json({
            response:
              "No se puede modificar la ruta porque tiene viajes a futuro",
          });
        } else {
          Lugar.findOne({ _id: req.body.origen }, (err, origenR) => {
            if (err) {
              res.json({
                response:
                  "El lugar de Origen no existe por favor selecione uno de la lista",
              });
            } else {
              Lugar.findOne({ _id: req.body.destino }, (err, destinoR) => {
                if (err) {
                  res.json({
                    response:
                      "El lugar de Destino no existe por favor selecione uno de la lista",
                  });
                } else {
                  Combi.findOne({ patente: req.body.combi }, (err, combiR) => {
                    if (err) {
                      res.json({
                        response:
                          "La combi no existe por favor selecione uno de la lista",
                      });
                    } else {
                      Ruta.findOne(
                        {
                          "origen.nombre": origenR.ciudad,
                          "origen.provincia": origenR.provincia,
                          "origen.idLugar": origenR._id,
                          "destino.nombre": destinoR.ciudad,
                          "destino.provincia": destinoR.provincia,
                          "destino.idLugar": destinoR._id,
                          "combi.patente": combiR.patente,
                          "combi.marca": combiR.marca,
                          "combi.modelo": combiR.modelo,
                          "combi.tipo": combiR.tipo,
                          "combi.idCombi": combiR._id,
                          distancia: req.body.distancia,
                          hora: req.body.hora,
                          borrado: false,
                        },
                        (err, resultRuta) => {
                          if (err) {
                            console.log(err);
                          } else {
                            if (resultRuta !== null) {
                              res.json({ response: "La ruta ya existe" });
                            } else {
                              Ruta.updateOne(
                                { _id: req.body.id },
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
                                    tipo: combiR.tipo,
                                    idCombi: combiR._id,
                                  },
                                  distancia: req.body.distancia,
                                  hora: req.body.hora,
                                  borrado: false,
                                },
                                (err, updRuta) => {
                                  if (err) {
                                    console.log(err);
                                  } else {
                                    res.json({ response: "bien" });
                                  }
                                }
                              );
                            }
                          }
                        }
                      );
                    }
                  });
                }
              });
            }
          });
        }
      }
    }
  );
});

// CRUD Viaje
//
//CREATE viaje
app.get("/cargar-viaje", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Ruta.find({ borrado: false }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.render("cargar-viaje", { data: result });
      }
    });
  }
});
app.post("/cargar-viaje", (req, res) => {
  Ruta.findOne({ _id: req.body.ruta }, (err, resRuta) => {
    if (err) {
      res.json({ response: "la Ruta selecionada no existe" });
    } else {
      Combi.findOne({ patente: resRuta.combi.patente }, (err, resCombi) => {
        if (err) {
          res.json({ response: "la Combi selecionada no existe" });
        } else {
          if (req.body.asientos > resCombi.asientos) {
            res.json({
              response:
                "No se puede guardar el viaje, la cantidad de asientos es mayor o igual a " +
                resCombi.asientos,
            });
          } else {
            Viaje.find(
              { "ruta.idRuta": resRuta._id, borrado: false },
              (err, resultV) => {
                if (err) {
                  console.log(err);
                } else {
                  let bool = false;

                  if (!resultV.length) {
                    bool = true;
                  }
                  resultV.forEach((viaje) => {
                    if (
                      transformarFecha(req.body.fecha + "T" + resRuta.hora) >
                        viaje.llegada ||
                      transformarFecha(req.body.llegada) < viaje.fecha
                    ) {
                      bool = true;
                    }
                  });
                  if (bool) {
                    let v = new Viaje({
                      ruta: {
                        origen: {
                          nombre: resRuta.origen.nombre,
                          provincia: resRuta.origen.provincia,
                        },
                        destino: {
                          nombre: resRuta.destino.nombre,
                          provincia: resRuta.destino.provincia,
                        },
                        idRuta: req.body.ruta,
                      },
                      combi: {
                        patente: resCombi.patente,
                        marca: resCombi.marca,
                        modelo: resCombi.modelo,
                        tipo: resCombi.tipo,
                      },
                      chofer: {
                        nombre: resCombi.chofer.nombre,
                        apellido: resCombi.chofer.apellido,
                        mail: resCombi.chofer.email,
                      },
                      fecha: req.body.fecha + "T" + resRuta.hora,
                      llegada: req.body.llegada,
                      precio: req.body.precio,
                      asientosDisponibles: req.body.asientos,
                      estado: "En espera",
                      borrado: false,
                    });
                    v.save((err) => {
                      if (err) {
                        console.log(err);
                      } else {
                        res.json({ response: "bien" });
                      }
                    });
                  } else {
                    res.json({
                      response:
                        "combi en uso en ese rango de dias, por favor seleccione otra ruta o cambie la fecha ",
                    });
                  }
                }
              }
            );
          }
        }
      });
    }
  });
});

// READ VIAJES
app.get("/viajes", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Viaje.find(
      { borrado: false, fecha: { $gte: new Date() } },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.render("listar-viajes", { viajes: result });
        }
      }
    );
  }
});
app.get("/viajes-pasados", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Viaje.find(
      { borrado: false, fecha: { $lt: new Date() } },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.render("listar-viajes-pasados", { viajes: result });
        }
      }
    );
  }
});
app.post("/buscar-viajes", (req, res) => {
  let hoy = new Date();
  let f = transformarFecha(req.body.fecha);
  let h = new Date(f.getFullYear(), f.getMonth(), f.getDate()) + 1;
  let m = new Date(f.getFullYear(), f.getMonth(), f.getDate() + 2);

  if (
    f.getDate() + 1 == hoy.getDate() &&
    f.getMonth() == hoy.getMonth() &&
    f.getFullYear() == hoy.getFullYear()
  ) {
    h = hoy;
    m = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
    console.log(h + " " + m);
  }
  Viaje.find(
    {
      "ruta.origen.nombre": req.body.ciudadO,
      "ruta.origen.provincia": req.body.provinciaO,
      "ruta.destino.nombre": req.body.ciudadD,
      "ruta.destino.provincia": req.body.provinciaD,
      $and: [{ fecha: { $gte: h } }, { fecha: { $lt: m } }],
    },
    (err, result) => {
      res.json({ viajes: result });
    }
  );
});

// UPDATE VIAJE
app.get("/modificar-viaje/:id", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Ruta.find({ borrado: false }, (err, rutaResult) => {
      if (err) {
        console.log(err);
      } else {
        if (rutaResult.length) {
          Viaje.findOne({ _id: req.params.id }, (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.render("modificar-viaje", {
                viaje: result,
                rutas: rutaResult,
              });
            }
          });
        } else {
          res.send("No hay rutas disponibles");
        }
      }
    });
  }
});

app.put("/viaje", (req, res) => {
  Viaje.findOne({ _id: req.body.idViaje }, (err, viajeR) => {
    Pasaje.findOne({ idViaje: req.body.idViaje }, (err, resPasaje) => {
      if (err) {
        console.log(err);
      } else {
        if (resPasaje && viajeR.ruta.idRuta !== req.body.ruta) {
          res.json({
            response:
              "No se puede modificar la ruta del viaje, tiene pasajes comprados.",
          });
        } else {
          Ruta.findOne({ _id: req.body.ruta }, (err, resRuta) => {
            if (err) {
              res.json({ response: "la Ruta selecionada no existe" });
            } else {
              Combi.findOne(
                { patente: resRuta.combi.patente },
                (err, resCombi) => {
                  if (err) {
                    res.json({ response: "la Combi selecionada no existe" });
                  } else {
                    if (req.body.asientos > resCombi.asientos) {
                      res.json({
                        response:
                          "No se puede modificar el viaje, la cantidad de asientos es mayor o igual a " +
                          resCombi.asientos,
                      });
                    } else {
                      Viaje.findOne(
                        { _id: req.body.idViaje },
                        (err, resViaje) => {
                          if (err) {
                            console.log(err);
                          } else {
                            if (
                              transformarFecha(
                                req.body.fecha + "T" + resRuta.hora
                              ) < resViaje.fecha
                            ) {
                              res.json({
                                response:
                                  "No se puede modificar el viaje, la fecha no puede ser posterior a la establecida previamente.",
                              });
                            } else {
                              Viaje.find(
                                { "ruta.idRuta": resRuta._id, borrado: false },
                                (err, resultV) => {
                                  if (err) {
                                    console.log(err);
                                  } else {
                                    let bool = false;
                                    if (!resultV.length) {
                                      bool = true;
                                    }

                                    resultV.forEach((viaje) => {
                                      if (
                                        transformarFecha(
                                          req.body.fecha + "T" + resRuta.hora
                                        ) > viaje.llegada ||
                                        transformarFecha(req.body.llegada) <
                                          viaje.fecha ||
                                        "" + resViaje._id === "" + viaje._id
                                      ) {
                                        bool = true;
                                      }
                                    });
                                    if (bool) {
                                      Viaje.updateOne(
                                        { _id: req.body.idViaje },
                                        {
                                          ruta: {
                                            origen: {
                                              nombre: resRuta.origen.nombre,
                                              provincia:
                                                resRuta.origen.provincia,
                                            },
                                            destino: {
                                              nombre: resRuta.destino.nombre,
                                              provincia:
                                                resRuta.destino.provincia,
                                            },
                                            idRuta: resRuta._id,
                                          },
                                          combi: {
                                            patente: resRuta.combi.patente,
                                            marca: resRuta.combi.marca,
                                            modelo: resRuta.combi.modelo,
                                            tipo: resRuta.combi.tipo,
                                          },
                                          chofer: {
                                            nombre: resCombi.chofer.nombre,
                                            apellido: resCombi.chofer.apellido,
                                            mail: resCombi.chofer.email,
                                          },
                                          fecha:
                                            req.body.fecha + "T" + resRuta.hora,
                                          llegada: req.body.llegada,
                                          precio: req.body.precio,
                                          asientosDisponibles:
                                            req.body.asientos,
                                          estado: "En espera",
                                          borrado: false,
                                        },
                                        (err) => {
                                          if (err) {
                                            res.json({
                                              response:
                                                "Lo sentimos ocurrio un error al momento de modificar. Por favor intentelo de nuevo en unos minutos",
                                            });
                                          } else {
                                            res.json({
                                              response: "bien",
                                            });
                                          }
                                        }
                                      );
                                    } else {
                                      res.json({
                                        response:
                                          "combi en uso en ese rango de dias, por favor seleccione otra ruta o cambie la fecha ",
                                      });
                                    }
                                  }
                                }
                              );
                            }
                          }
                        }
                      );
                    }
                  }
                }
              );
            }
          });
        }
      }
    });
  });
});

// DELETE VIAJE
app.delete("/viaje/:id", (req, res) => {
  Pasaje.findOne({ idViaje: req.params.id }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result !== null) {
        res.json({
          response: "No se puede borrar el viaje, tiene pasajes comprados",
        });
      } else {
        Viaje.updateOne({ _id: req.params.id }, { borrado: true }, (error) => {
          if (error) {
            console.log(error);
          } else {
            res.json({
              response: "bien",
            });
          }
        });
      }
    }
  });
});

// CRUD PASAJES
//

// Obtener todos los pasajes
app.get("/pasajes", (req, res) => {
  if (
    req.session.rol !== "Cliente comun" &&
    req.session.rol !== "Cliente gold"
  ) {
    res.redirect("/");
  } else {
    Pasaje.find(
      {
        emailPasajero: req.session.email,
        fecha: { $gte: hoy },
      },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.render("listar-pasajes", { data: result });
        }
      }
    );
  }
});

// Crear pasaje
app.get("/comprar-pasaje/:id", (req, res) => {
  Insumo.find({ borrado: false }, (err, resultInsumos) => {
    if (err) {
      console.log(err);
    } else {
      Viaje.findOne({ _id: req.params.id }, (err, resultViaje) => {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          res.render("comprar-pasaje", {
            viaje: resultViaje,
            insumos: resultInsumos,
          });
        }
      });
    }
  });
});

app.post("/comprar-pasaje", (req, res) => {
  if (req.session.rol !== "Cliente") {
    res.redirect("/");
  } else {
    Tarjeta.findOne({ codigo: req.body.codigo }, (err, resultTarjeta) => {
      if (err) {
        console.log(err);
      } else {
        if (resultTarjeta.monto > req.body.total) {
          // insumos es un diccionario que va a tener el nombre de cada insumo con su cantidad comprada,
          // falta implementar la carga cuando este el front end listo
          const insumos = {};

          // obtengo todos los nombres de los insumos
          const nombresInsumos = Object.keys(insumos);

          // busco todos los insumos que esten dentro de la coleccion de nombresInsumos
          Insumo.find(
            { title: { $in: nombresInsumos } },
            (err, resultInsumos) => {
              if (err) {
                console.log(err);
              } else {
                // creo un arreglo donde van a ir todos los insumos correspondientes al pasaje
                const insumosPasaje = [];
                resultInsumos.forEach((insumo) => {
                  insumosPasaje.push({
                    nombre: insumo.nombre,
                    precio: insumo.precio,
                    cantidad: insumos[insumo.nombre],
                  });
                });
                p = new Pasaje({
                  emailPasajero: req.session.email,
                  insumos: insumosPasaje,
                  cantidad: req.body.cantidad,
                  idViaje: req.body.viaje,
                  fecha: req.body.fecha,
                  precio: req.body.precio,
                });
                p.save((err) => {
                  console.log(err);
                });
                Tarjeta.findOneAndUpdate(
                  { codigo: req.body.codigo },
                  // le resto el total al monto de la tarjeta
                  { $inc: { monto: -req.body.total } },
                  (err) => {
                    console.log(err);
                  }
                );
                res.redirect("/pasajes");
              }
            }
          );
        } else {
          res.send("No hay saldo suficiente en la tarjeta");
        }
      }
    });
  }
});
app.put("/pasaje/:id", (req, res) => {
  Pasaje.findOneAndUpdate(
    { _id: req.params.id },
    { estadoPasaje: "Cancelado" },
    (err, resultPasaje) => {
      if (err) {
        console.log(err);
      } else {
        Viaje.updateOne(
          { _id: resultPasaje.idViaje },
          { $inc: { asientosDisponibles: resultPasaje.cantidad } },
          (err) => {
            if (err) {
              console.log(err);
            } else {
              var d = resultPasaje.fecha;
              d.setDate(d.getDate() - 2);
              if (d > hoy) {
                res.json({ response: "bien48hsAntes" });
              } else {
                res.json({ response: "bien" });
              }
            }
          }
        );
      }
    }
  );
});
// Borrar pasaje
app.delete("/pasaje/:id", (req, res) => {
  Pasaje.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      console.log(err);
    } else {
      res.json({ response: "bien" });
    }
  });
});

// PERFIL CLIENTE
app.get("/perfil", (req, res) => {
  if (
    req.session.rol !== "Cliente comun" &&
    req.session.rol !== "Cliente gold"
  ) {
    res.redirect("/");
  } else {
    Usuario.findOne(
      {
        email: req.session.email,
      },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.render("perfil", { data: result });
        }
      }
    );
  }
});

// NO TOCAR
app.listen(3000, function () {
  console.log("Server started on port " + port);
});
