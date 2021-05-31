function pad(number) {
  if (number < 10) {
    return "0" + number;
  }
  return number;
}

Date.prototype.fecha = function () {
  return (
    this.getFullYear() +
    "-" +
    pad(this.getMonth() + 1) +
    "-" +
    pad(this.getDate())
  );
};
Date.prototype.mes = function () {
  return this.getFullYear() + "-" + pad(this.getMonth() + 1);
};
Date.prototype.completa = function () {
  return (
    this.getDate() +
    "/" +
    pad(this.getMonth() + 1) +
    "/" +
    pad(this.getFullYear()) +
    " " +
    pad(this.getHours()) +
    ":" +
    pad(this.getMinutes()) +
    "hs"
  );
};
let h = new Date();
let hoy = h.fecha();
fecha.min = hoy;
fecha.value = hoy;

document.getElementById("origen").onchange = () => {
  let id = document.getElementById("origen").value;
  let c = document.getElementsByClassName(id).item(0).value;

  let p = document.getElementsByClassName(id).item(1).value;
  ciudadO.value = c;
  provinciaO.value = p;
};
let id = document.getElementById("origen").value;
let c = document.getElementsByClassName(id).item(0).value;

let p = document.getElementsByClassName(id).item(1).value;
ciudadO.value = c;
provinciaO.value = p;
document.getElementById("destino").onchange = () => {
  let id = document.getElementById("destino").value;
  let c = document.getElementsByClassName(id).item(0).value;

  let p = document.getElementsByClassName(id).item(1).value;
  ciudadD.value = c;
  provinciaD.value = p;
};
id = document.getElementById("destino").value;
c = document.getElementsByClassName(id).item(0).value;

p = document.getElementsByClassName(id).item(1).value;
ciudadD.value = c;
provinciaD.value = p;
function origen_destino_distintos() {
  if (origen === destino) {
    return false;
  }
  return true;
}

$(document).ready(() => {
  $("#buscarB").click(function (event) {
    jQuery.validator.addMethod(
      "igual",
      function (value, element) {
        return origen.value !== destino.value;
      },
      "El destino debe ser diferente al origen"
    );

    $("#buscar").validate({
      rules: {
        destino: {
          required: true,
          igual: true,
        },
      },

      submitHandler: function (form) {
        $(form).ajaxSubmit((data) => {
          console.log(data);
          if (data.viajes.length) {
            viajes.innerHTML = "";
            for (let i = 0; i < data.viajes.length; i++) {
              const e = data.viajes[i];
              viajes.innerHTML =
                viajes.innerHTML +
                ' <div class="card"> <div div class="card-title" style = "background-color:#0a546b; color: azure; text-align: center;" > <strong>Tipo:</strong> ' +
                e.combi.tipo +
                '</div ><div class="card-body"><div class="row"><div class="col-6"><p><strong>Origen:</strong> ' +
                e.ruta.origen.nombre +
                "</p><p><strong>Destino:</strong>" +
                e.ruta.destino.nombre +
                "</p><p><strong>Fecha y hora:</strong> " +
                new Date(Date.parse(e.fecha)).completa() +
                '</div><div class="col-6"> <p><strong>Cantidad de ascientos:</strong> ' +
                e.asientosDisponibles +
                "</p><br><p><strong>Precio:</strong> $" +
                e.precio +
                '</p></div></div></p><form action="/comprar-pasaje/'+e._id+'" method="get" ><button>Comprar</button> </form></div></div > <br> ';
            }
          } else {
            viajes.innerHTML =
              "<p>No hay viajes disponibles con esas especificaciones por favor vuelva a aintentarlo</p>";
          }
        });
      },
    });
  });
});
