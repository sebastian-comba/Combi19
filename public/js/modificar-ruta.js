function camposVacios() {
  let form = document.getElementsByClassName("mR");
  for (let i = 0; i < form.length; i++) {
    let e = form[i];
    if (e.value === "") {
      document.getElementById("err").innerHTML =
        '<small  style="color:red"><p class="er">Todos los campos deben estar Completos </p></small>';
    }
  }
}
function limpiar() {
  let err = document.getElementsByClassName("err")
  for (let i = 0; i < err.length; i++) {
    const e = err[i];
    e.innerHTML = "";
  }
}

function modificar() {
  fetch("/modificar-ruta", {
    method: "put",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: id.value,
      origen: origen.value,
      destino: destino.value,
      combi: combi.value,
      distancia: distancia.value,
      hora: hora.value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      switch (data.response) {
        case "bien":
          location.replace("/listar-rutas")
          break;
        default:
          document.getElementById(data.response.lugar).innerHTML =
            '<small  style="color:red"><p class="er">' + data.response.mensaje + '</p></small>';
          break;
      }
    });
}

document.getElementById("modificar").onclick = function () {
  limpiar();
  camposVacios();
  let errores = document.getElementsByClassName("er").length;
  if (errores === 0) {
    modificar();
  }
};

let p = combi.value;
chofer.value = document.getElementById(p).value;

document.getElementById("combi").onchange = function () {
  let p = combi.value;
  chofer.value = document.getElementById(p).value;
};
