function camposCompletos() {
  if (
    !emailI.value ||
    !claveI.value 
  ) {
    document.getElementById("errorI").innerHTML =
      '<small  style="color:red"><p class="errorIni">Todos los campos deben estar completos</p></small>';
  }
}
function iniciar() {
  let email = document.getElementById("emailI").value;
  let pass = document.getElementById("claveI").value;
  fetch("/iniciar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, clave: pass }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.response === "bien") {
            location.replace("/home");
      } else {
          document.getElementById("errorI").innerHTML =
        '<small  style="color:red"><p class="errorIni">Email o Contraseña incorrecta</p></small>';
      }
    });
}
document.getElementById("inicio").onclick = function () {
  document.getElementById("errorI").innerHTML = "";
  camposCompletos();
  let errores = document.getElementsByClassName("errorIni").length;
  if (errores === 0) {
    iniciar();
  }
};

