function camposVacios() {
    let form = document.getElementsByClassName("viaje");
    for (let i = 0; i < form.length; i++) {
        let e = form[i];
        if (e.value === "") {
            document.getElementById("err").innerHTML =
                '<small  style="color:red"><p class="er">Todos los campos deben estar Completos </p></small>';
        }
    }
}
function validarLLegada() {
    let f = fecha.value + "T" + document.getElementById("hora").value
    if (llegada.value <= f) {
        document.getElementById("err").innerHTML =
            '<small  style="color:red"><p class="er">La fecha de llegada no puede ser menor o igual a la fecha de salida </p></small>';
    }
}
function limpiar() {
    document.getElementById("err").innerHTML = "";
}

function guardar() {
    fetch("/cargar-viaje", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ruta: ruta.value,
            fecha: fecha.value,
            llegada: llegada.value,
            precio: precio.value,
            asientos: asientos.value,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            switch (data.response) {
                case "bien":
                    location.replace("/viajes")
                    break;
                default:
                    document.getElementById("err").innerHTML =
                        '<small  style="color:red"><p class="er">' + data.response + '</p></small>';
                    break;
            }
        });
}

document.getElementById("guardar").onclick = function () {
    limpiar();
    validarLLegada();
    camposVacios();
    let errores = document.getElementsByClassName("er").length;
    if (errores === 0) {
        guardar();
    }
}
function pad(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}

Date.prototype.fullFecha = function () {
    return this.getUTCFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        'T' + pad(this.getHours()) +
        ':' + pad(this.getMinutes())
};
Date.prototype.mediaFecha = function () {
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate())
};
Date.prototype.hora = function () {
    return pad(this.getHours()) +
        ':' + pad(this.getMinutes())
};
let hoy = new Date;
let mañana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1)

function minFecha() {
    if (document.getElementById("hora").value <= hoy.hora()) {
        fecha.min = mañana.mediaFecha()
        llegada.min = mañana.fullFecha()
    } else {
        fecha.min = hoy.mediaFecha();
        llegada.min = hoy.fullFecha();

    }
}


minFecha();

document.getElementById("fecha").onchange = function () {
    llegada.min = (fecha.value + "T" + document.getElementById("hora").value);
}
function obtenerLugar(id) {
    let lugar = document.getElementsByClassName(id);
    let l = [{ ciudad: 1, provincia: 1 }]

    for (let i = 0; i < lugar.length; i++) {
        const e = lugar[i];
        switch (e.name) {
            case "origen":

                l.push(e.value);
                break;
            case "destino":

                l.push(e.value);
                break;
            default:

                l.push(e.value);
                break;
        }
    }
    return (l);
}

document.getElementById("ruta").onchange = function () {
    let id = ruta.value;
    let l = obtenerLugar(id);

    ciudadO.value = l[1];
    ciudadD.value = l[2];
    combi.value = l[3];

    let r = document.getElementById("ruta").value;
    let hora = document.getElementById(r).value;
    document.getElementById("hora").value = hora;
    minFecha();

    llegada.min = (fecha.min + "T" + document.getElementById("hora").value)
}