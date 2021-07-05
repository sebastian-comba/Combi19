

function check(valor) {
    let checkboxes= document.getElementsByName(valor.name);
    let contador=0;
    for (let i = 0; i < checkboxes.length; i++) {
        const e = checkboxes[i];
        if (e.checked){
            contador=contador +1
        }
    }
    if (contador>=2){
        alerta(valor.name);
    }
};
function temp(fiebre){
    if(fiebre.value>=38){
            alerta(fiebre.name)
    }
}

function cancelarPasaje(){
    fetch("/cancelar-pasaje-chofer", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            idPasaje:idPasaje.value,
            emailPasajero: emailPasajero.value,
            cantidadAsientos: cantidadAsientos.value,
            idViaje:idViaje.value,
            motivo: "Sospechoso de covid"
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            switch (data.response) {
                case "bien":
                    location.replace("/listar-pasajeros/" + idViaje.value);
                    break;
            }
        });
}

function alerta(form){
    window.alert("El pasajero es sospechoso de covid. Avisele que le sera devuelto la totalidad del/ de los pasaje/s y que por 15 dias no podra comprar otros pasajes, y serán cancelados los que tenga comprados");
    cancelarPasaje();
}

function camposVacios() {
    let form = document.getElementsByClassName("sintoma");
    for (let i = 0; i < form.length; i++) {
        let e = form[i];
        if (e.value === "") {
            document.getElementById("err").innerHTML =
                '<small  style="color:red"><p class="er">Todos los campos deben estar Completos </p></small>';
        }
    }
}
function limpiar() {
    document.getElementById("err").innerHTML ="";
    
}

function validar() {
    fetch("/registrar-sintomas", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            idPasaje:idPasaje.value,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            switch (data.response) {
                case "bien":
                    location.replace("/listar-pasajeros/" + idViaje.value);
                    window.alert("El pasajero no es sospechoso de covid");
                    break;
            }
        });
}

document.getElementById("validar").onclick = function () {
    limpiar();
    camposVacios();
    let errores = document.getElementsByClassName("er").length;
    if (errores === 0) {
        validar();
    }
}