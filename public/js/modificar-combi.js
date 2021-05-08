function camposVacios() {
    let form = document.getElementsByClassName("alta");
    for (let i = 0; i < form.length; i++) {
        let e = form[i];
        if (e.value === "") {
            console.log(e);
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

function guardar() {
    let t = document.getElementsByName("tipo");
    let tipo;
    if (t[0].checked) {
        tipo = "Comoda"
    } else {
        tipo = "Super Comoda"
    }
    fetch("/modificar-combi", {
        method: "put",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: document.getElementById("id").value,
            patente: patente.value,
            marca: marca.value,
            modelo: modelo.value,
            chofer: chofer.value,
            asientos: asientos.value,
            tipo: tipo,
            patenteV:document.getElementById("patenteV").value
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            switch (data.response) {
                case "errorP":

                    document.getElementById("errP").innerHTML =
                        '<small  style="color:red"><p class="er">Esta patente esta registrada en otra Combi</p></small>';

                    break;
                case "errorC":
                    document.getElementById("errC").innerHTML =
                        '<small  style="color:red"><p class="er">El chofer seleccionado no existe. Por favor seleccione otro o agrege al chofer <a href="/alta-chofer">aqui</a></p></small>';
                    break;
                case "bien":
                    location.replace("/listar-combi" );
                    break;
            }
        });
}

document.getElementById("guardar").onclick = function () {
    limpiar();
    camposVacios();
    let errores = document.getElementsByClassName("er").length;
    if (errores === 0) {
        guardar();
    }
}