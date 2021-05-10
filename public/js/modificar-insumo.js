function camposVacios() {
  let form = document.getElementsByClassName("minsumo");
  for (let i = 0; i < form.length; i++) {
    let e = form[i];
    if (e.value === "") {
      document.getElementById("err").innerHTML =
        '<small  style="color:red"><p class="er">Todos los campos deben estar Completos </p></small>';
    }
  }
}
function limpiar() {
  document.getElementById("err").innerHTML = "";
}

function modificar() {
  fetch("/modificar-insumo", {
    method: "put",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: id.value,
      nombre: nombre.value,
      tipo: tipo.value,
      precio: precio.value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      switch (data.response) {
        case "bien":
          location.replace("/listar-insumos");
          break;
        default:
          document.getElementById("err").innerHTML =
            '<small  style="color:red"><p class="er">' +
            data.response +
            "</p></small>";
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
