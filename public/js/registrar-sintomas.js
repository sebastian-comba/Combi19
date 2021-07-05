

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
function alerta(form){
    window.alert("El pasajero es sospechoso de covid. Avisele que le sera devuelto la totalidad del/ de los pasaje/s y que por 15 dias no podra comprar otros pasajes, y serán cancelados los que tenga comprados");
    location.replace("/listar-pasajeros/" + idViaje.value);
}