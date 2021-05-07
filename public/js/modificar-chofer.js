
function limpiar() {
    document.getElementById("errE").innerHTML = "";
    document.getElementById("errC1").innerHTML = "";
    document.getElementById("errC2").innerHTML = "";
    document.getElementById("err").innerHTML = "";
}

function modificar() {
    fetch("/modificar-chofer", {
        method: "put",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: nombre.value,
            apellido: apellido.value,
            email: email.value,
            clave: clave.value,
            dni: dni.value,
            telefono: telefono.value,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.response === "error") {
                document.getElementById("errE").innerHTML =
                    '<small  style="color:red"><p class="er">este Email se registro anteriormente</p></small>';
            } else {
                location.replace("/listar-chofer");
            }
        });
}
function validarClave1() {
    if (clave.value.length < 5 && clave.value !== "") {
        document.getElementById("errC1").innerHTML =
            "<small  style='color:red'><p class='er'>La contraseña tiene que tener minimo 6 caracteres</p></small>";
    }
}
function validarClave2() {
    if (clave.value.length > 5 && clave.value !== clave1.value) {
        document.getElementById("errC2").innerHTML =
            '<small  style="color:red"><p class="er">Ambas Contraseñas deben coincidir</p></small>';
    }
}

function camposCompletos() {
    if (
        !nombre.value ||
        !apellido.value ||
        !dni.value ||
        !email.value ||
        !clave.value ||
        !clave1.value || !telefono.value
    ) {
        document.getElementById("err").innerHTML =
            '<small  style="color:red"><p class="er">Todos los campos deben estar completos</p></small>';
    }

}

document.getElementById("enviar").onclick = function () {
    limpiar();
    camposCompletos();
    validarClave1();
    validarClave2();
    let errores = document.getElementsByClassName("er").length;
    if (errores === 0) {
        modificar();
    }
};

