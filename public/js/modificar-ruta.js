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
    document.getElementById("err").innerHTML = "";

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
                    location.replace("/listar-lugares")
                    break;
                default:
                    document.getElementById("err").innerHTML =
                        '<small  style="color:red"><p class="er">' + data.response + '</p></small>';
                    break;
            }
        });
}


document.getElementById("modificar").onclick = function () {
    console.log(1);
    limpiar();
    camposVacios();
    let errores = document.getElementsByClassName("er").length;
    if (errores === 0) {
        modificar();
    }
}

function obtenerLugar(id) {
    let lugar = document.getElementsByClassName(id);
    let l = [{ ciudad: 1, provincia: 1 }]

    for (let i = 0; i < lugar.length; i++) {
        const e = lugar[i];
        if (e.name === "ciudad") {

            l.push(e.value);
        } else {
            l.push(e.value);
        }

    }
    return (l);
}
let l = obtenerLugar(origen.value);
ciudadO.value = l[1];
provinciaO.value = l[2];

let d = obtenerLugar(destino.value);
ciudadD.value = d[1];
provinciaD.value = d[2];

let p = ((combi.value))
chofer.value = document.getElementById(p).value;

document.getElementById("origen").onchange = function () {
    let l = obtenerLugar(origen.value);
    ciudadO.value = l[1];
    provinciaO.value = l[2];
}
document.getElementById("destino").onchange = function () {
    let l = obtenerLugar(destino.value);
    ciudadD.value = l[1];
    provinciaD.value = l[2];
}
document.getElementById("combi").onchange = function () {
    let p = ((combi.value))
    chofer.value = document.getElementById(p).value;
}