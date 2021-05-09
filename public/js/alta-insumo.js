function camposVacios() {
    let form = document.getElementsByClassName("insumo");
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

function modificar() {
    fetch("/alta-insumo", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: nombre.value,
            tipo: tipo.value,
            precio: precio.value,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            switch (data.response) {
                case "bien":
                    location.replace("/listar-insumos")
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
    camposVacios();
    let errores = document.getElementsByClassName("er").length;
    if (errores === 0) {
        modificar();
    }
}