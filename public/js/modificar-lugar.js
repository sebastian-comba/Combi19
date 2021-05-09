function camposVacios() {
    let form = document.getElementsByClassName("mlugar");
    for (let i = 0; i < form.length; i++) {
        let e = form[i];
        if (e.value === "") {
            document.getElementById("err").innerHTML =
                '<small  style="color:red"><p class="er">Todos los campos deben estar Completos </p></small>';
        }
    }
}
function limpiar() {
    let errores = document.getElementsByClassName("err");
    for (let index = 0; index < errores.length; index++) {
        errores[index].innerHTML = "";
    }
}

function modificar() {
    fetch("/modificar-lugar", {
        method: "put",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: id.value,
            ciudad:ciudad.value,
            provincia: provincia.value,
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
                        '<small  style="color:red"><p class="er">'+data.response+'</p></small>';
                break;
            }
        });
}
function hayCambios(){
    if(cv.value===ciudad.value && pv.value === provincia.value ){
 
        return false;
    }
    return true;
}

document.getElementById("modificar").onclick = function () {
    limpiar();
    camposVacios();
    let errores = document.getElementsByClassName("er").length;
    if (errores === 0 && hayCambios() ) {
        modificar();
    }
}