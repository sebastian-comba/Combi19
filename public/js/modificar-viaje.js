function camposVacios() {
    let form = document.getElementsByClassName("mV");
    for (let i = 0; i < form.length; i++) {
        let e = form[i];
        if (e.value === "") {
            document.getElementById("err").innerHTML =
                '<small  style="color:red"><p class="er">Todos los campos deben estar Completos </p></small>';
        }
    }
}

const minF = fecha.value;
function limpiar() {
    let err = document.getElementsByClassName("err");
    for (let i = 0; i < err.length; i++) {
        const e = err[i];
        e.innerHTML = ""
    }
}


function modificar() {
    fetch("/viaje", {
        method: "put",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            idViaje: idViaje.value,
            ruta: ruta.value,
            fecha: fecha.value,
            llegada: llegada.value,
            precio: precio.value,
            asientos: asientos.value,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            switch (data.response) {
                case "bien":
                    location.replace("/viajes")
                    break;
                default:
                    document.getElementById(data.response.lugar).innerHTML =
                        '<small  style="color:red"><p class="er">' + data.response.mensaje + '</p></small>';
                        
                    break;
            }
        });
}

function validarLLegada() {
    let f = fecha.value + "T" + document.getElementById(ruta.value).value
    if (llegada.value <= f) {
        document.getElementById("errL").innerHTML =
            '<small  style="color:red"><p class="er">La fecha de llegada no puede ser menor o igual a la fecha de salida </p></small>';
    }
}
function validarFecha() {
    if (fecha.value < minF) {
        document.getElementById("errF").innerHTML =
            '<small  style="color:red"><p class="er">La fecha de salida no puede ser menor o igual a '+minF+' </p></small>';
    }
}

document.getElementById("modificar").onclick = function () {
    limpiar();
    validarFecha();
    validarLLegada();
    camposVacios();
    let errores = document.getElementsByClassName("er").length;
    if (errores === 0) {
        modificar();
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
    llegada.min = (fecha.value + "T" + document.getElementById(ruta.value).value)
}

fecha.min=fecha.value;
minFecha();

document.getElementById("fecha").onchange = function () {
    minFecha(); 
}
function datosC(id) {
    let Rid = document.getElementsByClassName(id)
    let list = []
    for (let i = 0; i < Rid.length; i++) {
        const e = Rid[i];
        list[e.name] = e.value

    }
    return list;
}
document.getElementById("ruta").onchange = function () {
    let r = document.getElementById("ruta").value;
    minFecha();
    let datos = datosC(r);
    document.getElementById("modelo").value = datos.modelo;
    marca.value = datos.marca;
    tipo.value = datos.tipo;
}
let r = document.getElementById("ruta").value;
let datos = datosC(r);
modelo.value = datos.modelo;
marca.value = datos.marca;
tipo.value = datos.tipo;