
function pad(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}

Date.prototype.fecha = function () {
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate())
};
Date.prototype.mes = function () {
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1)
};
let h= new Date();
let hoy= h.fecha();
fecha.min=hoy;

document.getElementById("origen").onchange = () => {
    let id = document.getElementById("origen").value;
    let c = document.getElementsByClassName(id).item(0).value;

    let p = document.getElementsByClassName(id).item(1).value;
    ciudadO.value = c;
    provinciaO.value = p

}
let id = document.getElementById("origen").value;
let c = document.getElementsByClassName(id).item(0).value;

let p = document.getElementsByClassName(id).item(1).value;
ciudadO.value = c;
provinciaO.value = p
document.getElementById("destino").onchange = () => {
    let id = document.getElementById("destino").value;
    let c = document.getElementsByClassName(id).item(0).value;

    let p = document.getElementsByClassName(id).item(1).value;
    ciudadD.value = c;
    provinciaD.value = p

}
id = document.getElementById("destino").value;
c = document.getElementsByClassName(id).item(0).value;

p = document.getElementsByClassName(id).item(1).value;
ciudadD.value = c;
provinciaD.value = p
function origen_destino_distintos () {
    if(origen===destino){
        return false;
    }
    return true
    
}
jQuery.validator.addMethod("origen-destino-distintos", origen_destino_distintos(),[ "El origen y destino no pueden ser iguales"])


$("#buscar").validate({});

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