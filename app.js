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
function pad(number) { if (number < 10) { return "0" + number; } return number; };
Date.prototype.completa = function () {
  return (pad(this.getDate()) + "/" + pad(this.getMonth() + 1) + "/" + pad(this.getFullYear()) + " " +
    pad(this.getHours()) + ":" + pad(this.getMinutes()) + "hs");
}

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
        res.render("home-chofer", { data: req.session });
        break;
      case "Admin":
        res.render("home-admin", { data: req.session });
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
              res.locals.miEmail = req.session.email;
              Lugar.find((err, result) => {
                if (result) {
                  res.locals.lugares = result;
                }
                res.render("home", {
                  data: req.session,
                  comentarios: resultComentario,
                });
              }).sort({ ciudad: 1, provincia: 1 });
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
          fecha: new Date(),
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
// DELETE comentario
app.delete("/comentario/:id", (req, res) => {
  if (
    req.session.rol !== "Cliente comun" &&
    req.session.rol !== "Cliente gold"
  ) {
    res.redirect("/");
  } else {
    Comentario.deleteOne({ _id: req.params.id }, (err) => {
      if (err) {
        console.log(err);
        res.json({
          response: "Hubo un error, no se pudo eliminar el comentario",
        });
      } else {
        res.json({ response: "bien" });
      }
    });
  }
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
    }).sort({ ciudad: 1, provincia: 1 });
  }
});

// READ lugares
app.get("/listar-lugares", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Lugar.find((err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.render("listar-lugares", { data: result });
      }
    }).sort({ ciudad: 1, provincia: 1 });
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
  });
  Lugar.findOne(
    {
      ciudad: req.body.ciudad,
      provincia: req.body.provincia,
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
          },
          (err, result) => {
            if (result !== null) {
              res.json({ response: "No se puede borrar, tiene ruta asignada" });
            } else {
              Lugar.deleteOne(
                {
                  _id: req.params.id,
                },
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
    Lugar.findOne({ _id: req.params.id }, (err, resultLugar) => {
      if (err) {
        res.redirect("/listar-lugares");
      } else {
        res.render("modificar-lugar", { data: resultLugar });
      }
    });
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

// READ insumos
app.get("/listar-insumos", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Insumo.find((err, insumos) => {
      if (err) {
        console.log(err);
      } else {
        res.render("listar-insumos", { data: insumos });
      }
    }).sort({ nombre: 1, tipo: 1, precio: 1 });
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
    Pasaje.find(
      {
        fecha: { $gte: hoy },
        insumos: { $elemMatch: { nombre: resultInsumo.nombre } },
      },
      (err, resultPasaje) => {
        if (resultPasaje.length) {
          res.json({
            response:
              "No se puede eliminar el insumo porque ha sido comprado en viajes a futuro",
          });
        } else {
          Insumo.deleteOne({ _id: resultInsumo._id }, (err) => {
            if (err) {
              console.log(err);
            } else {
              res.json({
                response: "bien",
              });
            }
          });
        }
      }
    );
  });
});

// UPDATE Insumo
app.get("/modificar-insumo/:id", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Insumo.findOne({ _id: req.params.id }, (err, resultInsumo) => {
      if (err) {
        res.redirect("/");
      } else {
        res.render("modificar-insumo", { data: resultInsumo });
      }
    });
  }
});
app.put("/modificar-insumo", (req, res) => {
  //busca insumos con el mismo nombre, pero diferente id
  Insumo.findOne(
    { nombre: req.body.nombre, _id: { $ne: req.body.id } },
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
    Usuario.find({ rol: "Chofer" }, (err, result) => {
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
    }).sort({ nombre: 1, apellido: 1, email: 1 });
  }
});
//detalle Chofer
app.get("/detalle-chofer/:email", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Usuario.findOne(
      { email: req.params.email, rol: "Chofer" },
      (err, result) => {
        if (!result) {
          res.redirect("/listar-chofer");
        } else {
          Combi.find((err, combi) => {
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
          }).sort({ patente: 1 });
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
    suspendido: false,
    telefono: req.body.telefono,
  });
  console.log(req.body.email);
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
      { email: req.params.email, rol: "Chofer" },
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
  if (
    req.session.rol !== "Cliente comun" &&
    req.session.rol !== "Cliente gold"
  ) {
    res.redirect("/");
  } else {
    Usuario.findOne({ email: req.session.email }, (err, usuario) => {
      if (err) {
        res.redirect("/");
      } else {
        res.render("modificar-perfil", { data: usuario });
      }
    });
  }
});

app.post("/modificar-perfil", (req, res) => {
  Usuario.findOne({ email: req.session.email }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      Usuario.findOne(
        { email: req.body.email, _id: { $ne: result._id } },
        (err, resultC) => {
          if (resultC) {
            res.json({
              response: {
                lugar: "email",
                error:
                  "El email introducido esta siendo usado por otro usuario",
              },
            });
          } else {
            let email = req.session.email;
            if (req.body.cat === "gold") {
              Tarjeta.findOne({ codigo: req.body.cod }, (err, result) => {
                if (err) {
                  res.json({
                    response: {
                      lugar: "err",
                      error: "Error en la conexion con el banco",
                    },
                  });
                } else {
                  if (!result) {
                    res.json({
                      response: { lugar: "err", error: "Tarjeta inexistente" },
                    });
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
                              res.json({
                                response: {
                                  lugar: "err",
                                  error:
                                    "Problemas en la conexion con el banco. Intentelo en unos minutos ",
                                },
                              });
                            } else {
                              Usuario.deleteOne({ email: email }, (error) => {
                                if (!error) {
                                  us.save((err) => {
                                    if (err) {
                                      res.json({
                                        response: {
                                          lugar: "err",
                                          error:
                                            "Lo sentimos hubo un error al queres modificar el perfil",
                                        },
                                      });
                                    } else {
                                      Comentario.updateMany(
                                        { email: email },
                                        {
                                          nombre: req.body.nombre,
                                          apellido: req.body.apellido,
                                          email: req.body.email,
                                        }
                                      );
                                      Pasaje.updateMany(
                                        { emailPajajero: email },
                                        { emailPasajero: req.body.email }
                                      );
                                      req.session.nombre = us.nombre;
                                      req.session.apellido = us.apellido;
                                      req.session.rol = us.rol;
                                      req.session.email = us.email;
                                      req.session.categoria = us.categoria;
                                      res.json({ response: "bien" });
                                    }
                                  });
                                } else {
                                  res.json({
                                    response: {
                                      lugar: "err",
                                      error:
                                        "Lo sentimos hubo un error al queres modificar el perfil",
                                    },
                                  });
                                }
                              });
                            }
                          }
                        );
                      } else {
                        res.json({
                          response: {
                            lugar: "err",
                            error:
                              "Tarjeta sin fondos suficientes para realizar el pago",
                          },
                        });
                      }
                    } else {
                      res.json({
                        response: {
                          lugar: "err",
                          error: "Datos de la tarjeta incorrectos",
                        },
                      });
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
                suspendido: false,
                categoria: req.body.cat,
              });
              Usuario.deleteOne({ email: email }, (error) => {
                if (!error) {
                  us.save((err) => {
                    if (err) {
                      res.json({
                        response: {
                          lugar: "err",
                          error:
                            "Lo sentimos hubo un error al queres modificar el perfil",
                        },
                      });
                    } else {
                      Comentario.updateMany(
                        { email: email },
                        {
                          nombre: req.body.nombre,
                          apellido: req.body.apellido,
                          email: req.body.email,
                        }
                      );
                      Pasaje.updateMany(
                        { emailPajajero: email },
                        { emailPasajero: req.body.email }
                      );
                      req.session.nombre = us.nombre;
                      req.session.apellido = us.apellido;
                      req.session.rol = us.rol;
                      req.session.email = us.email;
                      req.session.categoria = us.categoria;
                      res.json({ response: "bien" });
                    }
                  });
                } else {
                  res.json({
                    response: {
                      lugar: "err",
                      error:
                        "Lo sentimos hubo un error al queres modificar el perfil",
                    },
                  });
                }
              });
            }
          }
        }
      );
    }
  });
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
                    Usuario.deleteOne({ email: req.params.email }, (err) => {
                      if (err) {
                        res.json({ response: "error" });
                      } else {
                        res.json({ response: "bien" });
                      }
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
});
// CRUD Combi
//
// READ  Combi
app.get("/listar-combi", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Combi.find((err, result) => {
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
    }).sort({ patente: 1 });
  }
});
app.get("/detalles-combi/:patente", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Combi.findOne({ patente: req.params.patente }, (err, result) => {
      if (err) {
        res.redirect("/listar-combi");
      } else {
        res.render("detalle-combi", { data: result });
      }
    });
  }
});
// CREATE Combi

//alta combi
app.get("/alta-combi", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Usuario.find({ rol: "Chofer" }, (err, result) => {
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
    }).sort({ nombre: 1, apelido: 1, email: 1 });
  }
});
//guardar combi
app.post("/alta-combi", (req, res) => {
  Usuario.findOne({ email: req.body.chofer, rol: "Chofer" }, (err, result) => {
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
  });
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
                    Combi.deleteOne({ patente: req.params.patente }, (err) => {
                      if (err) {
                        res.json({ response: "error" });
                      } else {
                        res.json({ response: "bien" });
                      }
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
});
//UPDATE Combi
app.get("/modificar-combi/:patente", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Combi.findOne({ patente: req.params.patente }, (err, combi) => {
      if (err) {
        res.redirect("/listar-combi");
      } else {
        Usuario.find({ rol: "Chofer" }, (err, result) => {
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
        }).sort({ nombre: 1, apellido: 1, email: 1 });
      }
    });
  }
});

app.put("/modificar-combi", (req, res) => {
  Usuario.findOne({ email: req.body.chofer }, (err, result) => {
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
// READ Rutas
app.get("/listar-rutas", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Ruta.find((err, rutas) => {
      if (err) {
        console.log(err);
      } else {
        res.render("listar-rutas", { data: rutas });
      }
    }).sort({
      "origen.nombre": 1,
      "origen.provincia": 1,
      "destino.nombre": 1,
      "destino.provincia": 1,
      hora: -1,
      "combi.patente": 1,
    });
  }
});

// CREATE rutas
app.get("/cargar-rutas", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Lugar.find((err, lugares) => {
      if (err) {
        console.log(err);
      } else {
        res.locals.lugares = lugares;
        Combi.find((err, combis) => {
          if (err) {
            console.log(err);
          } else {
            res.locals.combis = combis;
            res.render("cargar-rutas", {});
          }
        }).sort({ patente: 1 });
      }
    }).sort({ ciudad: 1, provincia: 1 });
  }
});
app.post("/cargar-rutas", (req, res) => {
  Lugar.findOne({ _id: req.body.origen }, (err, origenR) => {
    if (err) {
      res.json({
        response: {
          lugar: "errO",
          mensaje:
            "El lugar de Origen no existe por favor selecione uno de la lista",
        },
      });
    } else {
      Lugar.findOne({ _id: req.body.destino }, (err, destinoR) => {
        if (err) {
          res.json({
            response: {
              lugar: "errD",
              mensaje:
                "El lugar de Destino no existe por favor selecione uno de la lista",
            },
          });
        } else {
          Combi.findOne({ patente: req.body.combi }, (err, combiR) => {
            if (err) {
              res.json({
                response: {
                  lugar: "errC",
                  mensaje:
                    "La combi no existe por favor selecione uno de la lista",
                },
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
                },
                (err, resultRuta) => {
                  if (err) {
                    console.log(err);
                  } else {
                    if (resultRuta !== null) {
                      res.json({
                        response: {
                          lugar: "err",
                          mensaje: "La ruta ya existe",
                        },
                      });
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
                      });
                      ruta.save((err) => {
                        if (err) {
                          console.log(err);
                          res.json({
                            response: {
                              lugar: "err",
                              mensaje:
                                "Lo sentimos no se pudo guardar la ruta. Intentelo en unos minutos",
                            },
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
            Ruta.deleteOne({ _id: req.params.id }, (err) => {
              if (err) {
                console.log(err);
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

// UPDATE Ruta
app.get("/modificar-ruta/:id", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Ruta.findOne({ _id: req.params.id }, (err, resultRuta) => {
      if (err) {
        console.log(err);
      } else {
        res.locals.ruta = resultRuta;
        Lugar.find((err, lugares) => {
          if (err) {
            console.log(err);
          } else {
            res.locals.lugares = lugares;
            Combi.find((err, combis) => {
              if (err) {
                console.log(err);
              } else {
                res.locals.combis = combis;
                res.render("modificar-ruta", {});
              }
            }).sort({ patente: 1 });
          }
        }).sort({ ciudad: 1, provincia: 1 });
      }
    });
  }
});
app.put("/modificar-ruta", (req, res) => {
  Viaje.findOne(
    {
      "ruta.idRuta": req.body.id,
      fecha: { $gte: hoy },
    },
    (err, viajes) => {
      if (err) {
        console.log(err);
      } else {
        if (viajes !== null) {
          res.json({
            response: {
              lugar: "err",
              mensaje:
                "No se puede modificar la ruta porque tiene viajes a futuro",
            },
          });
        } else {
          Lugar.findOne({ _id: req.body.origen }, (err, origenR) => {
            if (err) {
              res.json({
                response: {
                  lugar: "errO",
                  mensaje:
                    "El lugar de Origen no existe por favor selecione uno de la lista",
                },
              });
            } else {
              Lugar.findOne({ _id: req.body.destino }, (err, destinoR) => {
                if (err) {
                  res.json({
                    response: {
                      lugar: "errD",
                      mensaje:
                        "El lugar de Destino no existe por favor selecione uno de la lista",
                    },
                  });
                } else {
                  Combi.findOne({ patente: req.body.combi }, (err, combiR) => {
                    if (err) {
                      res.json({
                        response: {
                          lugar: "errC",
                          mensaje:
                            "La combi no existe por favor selecione uno de la lista",
                        },
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
                          _id: { $ne: req.body.id },
                        },
                        (err, resultRuta) => {
                          if (err) {
                            console.log(err);
                          } else {
                            if (resultRuta !== null) {
                              res.json({
                                response: {
                                  lugar: "err",
                                  mensaje: "La ruta ya existe",
                                },
                              });
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
    Ruta.find((err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.render("cargar-viaje", { data: result });
      }
    }).sort({
      "origen.nombre": 1,
      "origen.provincia": 1,
      "destino.nombre": 1,
      "destino.provincia": 1,
      hora: -1,
      "combi.patente": 1,
    });
  }
});
app.post("/cargar-viaje", (req, res) => {
  Ruta.findOne({ _id: req.body.ruta }, (err, resRuta) => {
    if (err) {
      res.json({
        response: { lugar: "errR", mensaje: "la Ruta selecionada no existe" },
      });
    } else {
      Combi.findOne({ patente: resRuta.combi.patente }, (err, resCombi) => {
        if (err) {
          res.json({
            response: {
              lugar: "err",
              mensaje: "la Combi selecionada no existe",
            },
          });
        } else {
          if (req.body.asientos > resCombi.asientos) {
            res.json({
              response: {
                lugar: "errA",
                mensaje:
                  "No se puede guardar el viaje, la cantidad de asientos es mayor o igual a " +
                  resCombi.asientos,
              },
            });
          } else {
            Viaje.find(
              {
                $and: [
                  {
                    $or: [
                      { "combi.patente": resCombi.patente },
                      { "chofer.mail": resCombi.chofer.email },
                    ],
                  },
                  {
                    $or: [
                      {
                        $and: [
                          {
                            llegada: {
                              $gte: transformarFecha(req.body.llegada),
                            },
                          },
                          {
                            fecha: { $lte: transformarFecha(req.body.llegada) },
                          },
                        ],
                      },
                      {
                        $and: [
                          {
                            llegada: {
                              $gte: transformarFecha(
                                req.body.fecha + "T" + resRuta.hora
                              ),
                            },
                          },
                          {
                            fecha: {
                              $lte: transformarFecha(
                                req.body.fecha + "T" + resRuta.hora
                              ),
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              (err, resultV) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(req.body.ruta);
                  if (!resultV.length) {
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
                      asientosTotales: req.body.asientos,
                      asientosDisponibles: req.body.asientos,
                      estado: "En espera",
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
                      response: {
                        lugar: "err",
                        mensaje:
                          "El chofer o la combi tienen otro viaje en esa fecha, por favor seleccione otra ruta o cambie la fecha ",
                      },
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
    Viaje.find({ fecha: { $gte: new Date() } }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.render("listar-viajes", { viajes: result });
      }
    }).sort({ fecha: 1, llegada: 1 });
  }
});
app.get("/viajes-pasados", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Viaje.find({ fecha: { $lt: new Date() } }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.render("listar-viajes-pasados", { viajes: result });
      }
    }).sort({ fecha: -1, llegada: -1 });
  }
});
app.post("/buscar-viajes", (req, res) => {
  let hoy = new Date();
  if (req.body.fecha) {
    let f = transformarFecha(req.body.fecha);
    let h = new Date(f.getFullYear(), f.getMonth(), f.getDate() + 1);
    let m = new Date(f.getFullYear(), f.getMonth(), f.getDate() + 2);

    if (
      f.getDate() + 1 == hoy.getDate() &&
      f.getMonth() == hoy.getMonth() &&
      f.getFullYear() == hoy.getFullYear()
    ) {
      h = hoy;
      m = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
    }
    Viaje.find(
      {
        asientosDisponibles: { $gt: 0 },
        "ruta.origen.nombre": req.body.ciudadO,
        "ruta.origen.provincia": req.body.provinciaO,
        "ruta.destino.nombre": req.body.ciudadD,
        "ruta.destino.provincia": req.body.provinciaD,
        estado: "En espera",
        $and: [{ fecha: { $gte: h } }, { fecha: { $lt: m } }],
      },
      (err, result) => {
        res.json({ viajes: result });
      }
    ).sort({ fecha: 1, llegada: 1 });
  } else {
    Viaje.find(
      {
        asientosDisponibles: { $gt: 0 },
        "ruta.origen.nombre": req.body.ciudadO,
        "ruta.origen.provincia": req.body.provinciaO,
        "ruta.destino.nombre": req.body.ciudadD,
        "ruta.destino.provincia": req.body.provinciaD,
        estado: "En espera",
        fecha: { $gte: hoy },
      },
      (err, result) => {
        res.json({ viajes: result });
      }
    ).sort({ fecha: 1, llegada: 1 });
  }
});

// UPDATE VIAJE
app.get("/modificar-viaje/:id", (req, res) => {
  if (req.session.rol !== "Admin") {
    res.redirect("/");
  } else {
    Ruta.find((err, rutaResult) => {
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
    }).sort({
      "origen.nombre": 1,
      "origen.provincia": 1,
      "destino.nombre": 1,
      "destino.provincia": 1,
      hora: -1,
      "combi.patente": 1,
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
            response: {
              lugar: "err",
              mensaje:
                "No se puede modificar la ruta del viaje, tiene pasajes comprados.",
            },
          });
        } else {
          Ruta.findOne({ _id: req.body.ruta }, (err, resRuta) => {
            if (err) {
              res.json({
                response: {
                  lugar: "errR",
                  mensaje: "la Ruta selecionada no existe",
                },
              });
            } else {
              Combi.findOne(
                { patente: resRuta.combi.patente },
                (err, resCombi) => {
                  if (err) {
                    res.json({
                      response: {
                        lugar: "errR",
                        mensaje: "la Combi selecionada no existe",
                      },
                    });
                  } else {
                    if (req.body.asientos > resCombi.asientos) {
                      res.json({
                        response: {
                          lugar: "err",
                          mensaje:
                            "No se puede modificar el viaje, la cantidad de asientos es mayor o igual a " +
                            resCombi.asientos,
                        },
                      });
                    } else {
                      Viaje.findOne(
                        { _id: req.body.idViaje },
                        (err, resViaje) => {
                          if (err) {
                            console.log(err);
                          } else {
                            console.log(req.body);
                            if (
                              transformarFecha(
                                req.body.fecha + "T" + resRuta.hora
                              ) < resViaje.fecha
                            ) {
                              res.json({
                                response: {
                                  lugar: "errF",
                                  mensaje:
                                    "la fecha no puede ser posterior a la establecida previamente.",
                                },
                              });
                            } else {
                              Viaje.find(
                                {
                                  $and: [
                                    {
                                      $or: [
                                        { "combi.patente": resCombi.patente },
                                        {
                                          "chofer.mail": resCombi.chofer.email,
                                        },
                                      ],
                                    },
                                    {
                                      $or: [
                                        {
                                          $and: [
                                            {
                                              llegada: {
                                                $gte: transformarFecha(
                                                  req.body.llegada
                                                ),
                                              },
                                            },
                                            {
                                              fecha: {
                                                $lte: transformarFecha(
                                                  req.body.llegada
                                                ),
                                              },
                                            },
                                          ],
                                        },
                                        {
                                          $and: [
                                            {
                                              llegada: {
                                                $gte: transformarFecha(
                                                  req.body.fecha +
                                                  "T" +
                                                  resRuta.hora
                                                ),
                                              },
                                            },
                                            {
                                              fecha: {
                                                $lte: transformarFecha(
                                                  req.body.fecha +
                                                  "T" +
                                                  resRuta.hora
                                                ),
                                              },
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                  _id: { $ne: req.body.idViaje },
                                },
                                (err, resultV) => {
                                  if (err) {
                                    console.log(err);
                                  } else {
                                    if (!resultV.length) {
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
                                        },
                                        (err) => {
                                          if (err) {
                                            res.json({
                                              response: {
                                                lugar: "err",
                                                mensaje:
                                                  "Lo sentimos ocurrio un error al momento de modificar. Por favor intentelo de nuevo en unos minutos",
                                              },
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
                                        response: {
                                          lugar: "err",
                                          mensaje:
                                            "El chofer o la combi tienen otro viaje en esa fecha, por favor seleccione otra ruta o cambie la fecha ",
                                        },
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
app.get("/iniciar-viaje/:id", (req, res) => {
  Viaje.updateOne(
    { _id: req.params.id },
    {
      estado: "En viaje",
    },
    (err, result) => {
      if (!err) {
        res.json({ response: "bien" });
      } else {
        console.log(err);
      }
    }
  );
});
app.get("/terminar-viaje/:id", (req, res) => {
  Viaje.updateOne(
    { _id: req.params.id },
    {
      estado: "Finalizado",
      llegada: new Date(),
    },
    (err, result) => {
      if (!err) {
        Pasaje.updateMany(
          { idViaje: req.params.id, estadoPasaje: "Activo" },
          {
            estadoPasaje: "Finalizado",
          },
          (err, result) => {
            if (!err) {
              res.json({ response: "bien" });
            } else {
              console.log(err);
            }
          }
        );
      } else {
        console.log(err);
      }
    }
  );
});
// DELETE VIAJE
app.delete("/viaje/:id", (req, res) => {
  Pasaje.findOne(
    { idViaje: req.params.id, estadoPasaje: { $ne: "Cancelado" } },
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result !== null) {
          res.json({
            response: "No se puede borrar el viaje, tiene pasajes comprados",
          });
        } else {
          Viaje.deleteOne({ _id: req.params.id }, (error) => {
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
    }
  );
});

// Listado de viajes asignados a un chofer
app.get("/viajes-chofer-pendientes", (req, res) => {
  if (req.session.rol !== "Chofer") {
    res.redirect("/");
  } else {
    Viaje.find(
      {
        fecha: { $gte: new Date() },
        "chofer.mail": req.session.email,
        estado: { $ne: "Finalizado" },
      },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.render("viajes-chofer", { viajes: result });
        }
      }
    ).sort({ fecha: 1, llegada: 1 });
  }
});

// CRUD PASAJES
//

// Obtener todos los pasajes pendientes pasajero
app.get("/pasajes-pendientes", (req, res) => {
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
        estadoPasaje: "Pendiente",
      },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.render("listar-pasajes-pendientes", { data: result });
        }
      }
    );
  }
});
// Obtener todos los pasajes cancelados
app.get("/pasajes-cancelados", (req, res) => {
  if (
    req.session.rol !== "Cliente comun" &&
    req.session.rol !== "Cliente gold"
  ) {
    res.redirect("/");
  } else {
    Pasaje.find(
      {
        emailPasajero: req.session.email,
        estadoPasaje: "Cancelado",
      },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.render("listar-pasajes-cancelados", { data: result });
        }
      }
    ).sort({ fecha: 1 });
  }
});

// Obtener todos los pasajeros de un viaje
app.get("/listar-pasajeros/:idViaje", (req, res) => {
  if (req.session.rol !== "Chofer") {
    res.redirect("/");
  } else {
    Viaje.findOne(
      {
        _id: req.params.idViaje,
      },
      (err, resultViaje) => {
        if (err) {
          console.log(err);
        } else {
          res.locals.viaje = resultViaje;
          Pasaje.find(
            {
              idViaje: req.params.idViaje,
              motivoCancelacion: { $ne: "El pasajero cancelo" },
            },
            (err, resultPasaje) => {
              if (err) {
                console.log(err);
              } else {
                res.locals.pasajes = resultPasaje;
                res.render("listar-pasajeros");
              }
            }
          );
        }
      }
    );
  }
});

// Crear pasaje
app.get("/comprar-pasaje/:id", (req, res) => {
  Insumo.find((err, resultInsumos) => {
    if (err) {
      console.log(err);
    } else {
      Viaje.findOne({ _id: req.params.id }, (err, resultViaje) => {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          Usuario.findOne({ email: req.session.email }, (err, usuario) => {
            if (err) {
              res.redirect("/");
            } else {
              res.render("comprar-pasaje", {
                viaje: resultViaje,
                insumos: resultInsumos,
                tipo: req.session.rol,
                usr: usuario,
              });
            }
          });
        }
      });
    }
  }).sort({ nombre: 1 });
});

app.post("/comprar-pasaje", (req, res) => {
  function compra() {
    Tarjeta.findOne({ codigo: req.body.cod }, (err, resultTarjeta) => {
      if (err) {
        res.json({
          response: {
            error: "errT",
            mensaje: "Error en la conexion con el banco",
          },
        });
      } else {
        if (resultTarjeta) {
          if (
            resultTarjeta.dni === req.body.dniT &&
            Date.parse(resultTarjeta.vencimiento) ==
            Date.parse(req.body.vencimiento + "-01") &&
            resultTarjeta.nombreCompleto === req.body.nombreT &&
            resultTarjeta.codSeguridad === req.body.seg
          ) {
            if (resultTarjeta.monto > parseFloat(req.body.total)) {
              Viaje.findOne({ _id: req.body.idViaje }, (err, result) => {
                if (err) {
                } else {
                  if (result) {
                    if (result.asientosDisponibles >= req.body.cantidad) {
                      p = new Pasaje({
                        emailPasajero: req.session.email,
                        insumos: req.body.insumos,
                        cantidad: req.body.cantidad,
                        idViaje: req.body.idViaje,
                        fecha: result.fecha,
                        precio: parseFloat(req.body.total),
                        "origen.nombre": result.ruta.origen.nombre,
                        "origen.provincia": result.ruta.origen.provincia,
                        "destino.nombre": result.ruta.destino.nombre,
                        "destino.provincia": result.ruta.destino.provincia,
                        estadoPasaje: "Pendiente",
                        tipoServicio: result.combi.tipo,
                      });
                      p.save((err) => {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log("Monto descontado de la tarjeta");
                          res.json({ response: "bien" });
                          let as =
                            result.asientosDisponibles -
                            parseFloat(req.body.cantidad);
                          Viaje.updateOne(
                            { _id: req.body.idViaje },
                            {
                              asientosDisponibles: as,
                            },
                            (err) => {
                              if (err) {
                                console.log(err);
                              }
                            }
                          );
                        }
                      });
                    } else {
                      res.json({
                        response: {
                          error: "errT",
                          mensaje:
                            "Hay " +
                            result.asientosDisponibles +
                            " asientos disponibles cambie la cantidad de pasajes o busque otro viaje",
                        },
                      });
                    }
                  }
                }
              });
            } else {
              res.json({
                response: {
                  error: "errT",
                  mensaje: "No hay saldo suficiente en la tarjeta",
                },
              });
            }
          } else {
            res.json({
              response: {
                error: "errT",
                mensaje: "Datos de la tarjeta incorrecta",
              },
            });
          }
        } else {
          res.json({
            response: { error: "errT", mensaje: "La tarjeta no existe" },
          });
        }
      }
    });
  }
  Usuario.findOne({ email: req.session.email }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.suspendido) {
        let fS = new Date((result.fechaSuspendido).setDate((result.fechaSuspendido.getDate() + 15)));
        if (fS >= (new Date())) {
          res.json({
            response: {
              error: "errT",
              mensaje: "Usted esta suspendido por sospecha de Covid. Estara suspendido hasta el " + fS.completa(),
            },
          });
        } else {
          Usuario.updateOne({ email: req.session.email }, {
            suspendido: false,
            fechaSuspendido: ""
          }, (err) => {
            if (err) {
              console.log(err);
            }
          })
          compra()
        }
      } else {
        compra()
      }
    }
  });

});
app.get("/vender-pasaje/:idViaje", (req, res) => {
  Viaje.findOne({ _id: req.params.idViaje }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.render("vender-pasaje", { viaje: result });
    }
  });
});
app.post("/verificar", (req, res) => {
  Usuario.findOne({ email: req.body.email }, (err, result) => {
    if (!result) {
      let us = new Usuario({
        nombre: "Nombre Temporal",
        apellido: "Apellido Temporal",
        email: req.body.email,
        clave: req.body.email,
        dni: "12345678",
        fechaN: new Date(),
        rol: "Cliente comun",
        suspendido: false,
        categoria: "comun",
      });
      us.save((err) => {
        if (err) {
          console.log(err);
        } else {
          res.json({
            response: "no existe",
            mensaje:
              "Se a creado un nuevo usuario con datos por defecto. Informar al cliente que se le ha enviado un email con la contraseña y que debera cambiar los datos del perfil",
            usuario: us,
          });
        }
      });
    } else {
      if (result.rol === "Admin" || result.rol === "Chofer") {
        res.json({
          response: "rol",
          mensaje:
            "El email esta registrado para un " +
            result.rol +
            ".El email debe de pertenecer a un Cliente",
          usuario: result,
        });
      } else {
        res.json({
          response: "existe",
          mensaje: "El email esta registrado",
          usuario: result,
        });
      }
    }
  });
});
app.put("/pasaje/:id", (req, res) => {
  Pasaje.findOneAndUpdate(
    { _id: req.params.id },
    {
      estadoPasaje: "Cancelado",
      fechaCancelado: now,
      motivoCancelacion: "El pasajero cancelo",
    },
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

// CHOFER registrar sintomas
app.get("/registrar-sintomas/:id", (req, res) => {
  Pasaje.findOne(
    {
      _id: req.params.id,
    },
    (err, resultPasaje) => {
      if (err) {
        console.log(err);
      } else {
        res.render("registrar-sintomas", { data: resultPasaje });
      }
    }
  );
});

app.post("/cancelar-pasaje-chofer", (req, res) => {
  if (req.body.motivo == "Sospechoso de covid") {
    Pasaje.findOne({ _id: req.body.idPasaje},(err,resultP)=>{
      if(err){
        console.log(err)
      }else{
        
        Usuario.findOneAndUpdate(
          {
            email: req.body.emailPasajero,
          },
          {
            suspendido: true,
            fechaSuspendido: new Date(),
          },
          (err) => {
            if (err) {
              console.log(err);
            } else {
              Pasaje.updateMany(
                {
                  emailPasajero: req.body.emailPasajero,
                  fecha: { $gte: (resultP.fecha), $lt: (new Date()).setDate(new Date().getDate() + 15) },
                },
                {
                  estadoPasaje: "Cancelado",
                  fechaCancelado: now,
                  motivoCancelacion: "Sospechoso de covid",
                },
                (err) => {
                  if (err) {
                    console.log(err);
                  } else {
                    Pasaje.find({
                      emailPasajero: req.body.emailPasajero,
                      fecha: { $gte: resultP.fecha, $lt: (new Date()).setDate(new Date().getDate() + 15) },
                    }, (err, resultPasajes) => {
                      if (err) {
                        console.log(err);
                      } else {
                        resultPasajes.forEach(viaje => {
                          Viaje.updateMany(
                            {
                              _id: viaje.idViaje,
                              fecha: { $gte: resultP.fecha, $lt: (new Date()).setDate(new Date().getDate() + 15) },
                            },
                            {
                              $inc: { asientosDisponibles: viaje.cantidad },
                            },
                            (err) => {
                              if (err) {
                                console.log(err);
                              }
                            }
                          );
                        });
                        res.json({ response: "bien" });
                      }
                    });
                  }
                }
              );
            }
          }
        );
      }
    })
   
  } else {
    if (req.body.motivo == "Ausente") {
      Pasaje.findOneAndUpdate(
        {
          _id: req.body.idPasaje,
        },
        {
          estadoPasaje: "Cancelado",
          fechaCancelado: now,
          motivoCancelacion: "Ausente",
        },
        (err, resultPasaje) => {
          if (err) {
            console.log(err);
          } else {
            Viaje.findOneAndUpdate(
              {
                _id: resultPasaje.idViaje,
              },
              {
                $inc: { asientosDisponibles: resultPasaje.cantidad },
              },
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
  }
});

app.post("/registrar-sintomas", (req, res) => {
  Pasaje.findOneAndUpdate(
    {
      _id: req.body.idPasaje,
    },
    {
      estadoPasaje: "Activo",
    },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        res.json({ response: "bien" });
      }
    }
  );
});

app.post("/vender-pasaje", (req, res) => {
  function venta() {
    Viaje.find({ _id: req.body.viaje_id }, (err, viaje) => {
      if (err) {
        console.log(err);
      } else {
        console.log(viaje[0].asientosDisponibles);
        if (viaje[0].asientosDisponibles >= req.body.cantidad) {
          Viaje.findOneAndUpdate(
            { _id: req.body.viaje_id },
            { $inc: { asientosDisponibles: -req.body.cantidad } }, (err) => {
              if (err) {
                console.log(err);
              }
            }
          );
          p = new Pasaje({
            emailPasajero: req.body.email_pasaje,
            insumos: [],
            cantidad: req.body.cantidad,
            idViaje: req.body.viaje_id,
            fecha: viaje[0].fecha,
            precio: parseFloat(req.body.total),
            "origen.nombre": viaje[0].ruta.origen.nombre,
            "origen.provincia": viaje[0].ruta.origen.provincia,
            "destino.nombre": viaje[0].ruta.destino.nombre,
            "destino.provincia": viaje[0].ruta.destino.provincia,
            estadoPasaje: "Pendiente",
            tipoServicio: viaje[0].combi.tipo,
          });
          p.save((err) => {
            console.log(err)
          });
          res.json({ response: "bien", pasaje: p });
        } else {
          res.json({
            response: "mal",
            error: "err",
            mensaje: "La Cantidad de pasajes es mayor a la cantidad de asientos disponible",
          });
        }
      }
    });
  };
  Usuario.findOne({ email: req.body.email_pasaje}, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.suspendido) {
        let fS = new Date((result.fechaSuspendido).setDate((result.fechaSuspendido.getDate() + 15)));
        if (fS >= (new Date())) {
          res.json({
            response:"mal", 
              error: "err",
              mensaje: "El usuario esta suspendido por sospecha de Covid. Estara suspendido hasta el " + fS.completa(),
            
          });
        } else {
          Usuario.updateOne({ email: req.body.email_pasaje}, {
            suspendido: false,
            fechaSuspendido: ""
          }, (err) => {
            if (err) {
              console.log(err);
            }
          })
          venta()
        }
      } else {
        venta()
      }
    }
  });

});

app.get("/pasajes-pasados-pasajero", (req, res) => {
  if (
    req.session.rol !== "Cliente comun" &&
    req.session.rol !== "Cliente gold"
  ) {
    res.redirect("/");
  } else {
    Pasaje.find({ emailPasajero: req.session.email, estadoPasaje: "Finalizado" }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.render("pasajes-pasados-pasajero", { data: result });
      }
    }).sort({ fecha: -1, llegada: -1 });
  }
});

app.get("/viajes-chofer-pasados", (req, res) => {
  if (req.session.rol !== "Chofer") {
    res.redirect("/");
  } else {
    Viaje.find(
      { estado: "Finalizado", "chofer.mail": req.session.email },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.render("viajes-chofer-pasados", { viajes: result });
        }
      }
    ).sort({ fecha: -1, llegada: -1 });
  }
});

// NO TOCAR
app.listen(3000, function () {
  console.log("Server started on port " + port);
});
