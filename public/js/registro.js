//iniciacion 
let hoy = new Date();
let mes = hoy.getMonth() + 1;
if ((mes / 10) < 1) {
    mes = '0' + mes;
}
let dia = hoy.getDate();
if (dia / 10 < 1) {
    dia = "0" + dia;
}

vencimiento.min = hoy.getFullYear() + "-" + mes;
document.getElementById('gold').onclick = function () {
    document.getElementById("tarjeta").style.display = 'inline';
    document.getElementById("cat").value = "gold";
}
document.getElementById('comun').onclick = function () {
    document.getElementById("tarjeta").style.display = 'none';
    document.getElementById("cat").value = "comun";
}

fechaN.max = hoy.getFullYear() + '-' + mes + '-' + dia;
//metodos
function limpiar() {
    document.getElementById("errFN").innerHTML = "";
    document.getElementById("errE").innerHTML = "";
    document.getElementById("errC1").innerHTML = "";
    document.getElementById("errC2").innerHTML = "";
    document.getElementById("errT").innerHTML = "";
    document.getElementById("err").innerHTML = "";
}



function registrar() {
    codigo = document.getElementById("cod").value;
    nombreT = document.getElementById("nombreT").value;
    dniT = document.getElementById("dniT").value;
    vencimiento = document.getElementById("vencimiento").value;
    seg = document.getElementById("seg").value;
    fetch("/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: nombre.value,
            apellido: apellido.value,
            email: email.value,
            clave: clave.value,
            dni: dni.value,
            fechaN: fechaN.value,
            categoria: cat.value,
            codigo: codigo,
            vencimiento: vencimiento,
            nombreT: nombreT,
            dniT: dniT,
            codSeguridad: seg,
      }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.response === "error") {
                document.getElementById("errE").innerHTML =
                    '<small  style="color:red"><p class="er">este Email se registro anteriormente</p></small>';
            } else {
                location.replace("/home");
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
function validarFechaN() {
    let guion = 0;
    let año = "";
    let mes = "";
    let dia = "";
    for (let i = 0; i < fechaN.value.length; i++) {
        const e = fechaN.value[i];
        if (e === '-') {
            guion++;
        } else {
            switch (guion) {
                case 0:
                    año = año + "" + e;
                    break;
                case 1:
                    mes = mes + "" + e;
                    break;
                case 2:
                    dia = dia + "" + e;
                    break;
            }
        }

    }
    let na = new Date(año, (mes - 1), dia);
    let edad;
    if (
        hoy.getMonth() >= na.getMonth() &&
        hoy.getDate() >= na.getDate()
    ) {
        edad = hoy.getFullYear() - na.getFullYear()
    } else {
        edad = hoy.getFullYear() - na.getFullYear() - 1;
    }
    if (edad < 18) {
        document.getElementById("errFN").innerHTML =
            '<small  style="color:red"><p class="er">Debes ser mayor de 18 años</p></small>';
    }
};
function validarCodigoS() {
    let c = seg.value;
    if (c.length !== 3 && cat.value === "gold") {
        document.getElementById("errT").innerHTML =
            '<small  style="color:red"><p class="er">Tarjeta no valida</p></small>';

    }

}
function camposCompletos() {
    let camposIn;
    if (!nombre.value || !apellido.value || !dni.value || !email.value || !fechaN.value || !clave.value || !clave1.value) {
        camposIn = true;
    }
    if (
        cat.value === "gold" &&
        (!cod.value ||
            !dniT.value ||
            !vencimiento.value ||
            !nombreT.value ||
            !seg.value)
    ) {
        camposIn = true;
    }
    if (camposIn) {
        document.getElementById("err").innerHTML =
            '<small  style="color:red"><p class="er">Todos los campos deben estar completos</p></small>';
    }
}

document.getElementById("enviar").onclick = function () {

    limpiar();
    camposCompletos();
    validarClave1();
    validarClave2();
    validarFechaN();
    validarCodigoS();
    let errores = document.getElementsByClassName("er").length;
    if (errores === 0) {
        registrar();
    }
};
