function camposVacios(){
    let form = document.getElementsByClassName("alta");
    for (let i = 0; i < form.length; i++) {
        let e = form[i];
        if(e.value===""){
            console.log(e);
            document.getElementById("err").innerHTML =
                '<small  style="color:red"><p class="er">Todos los campos deben estar Completos </p></small>';
        }   
    }
}
function limpiar(){
    let errores = document.getElementsByClassName("err");
    for (let index = 0; index < errores.length; index++) {
        errores[index].innerHTML="";
    }
}

function guardar() {
    let t= document.getElementsByName("tipo");
    let tipo;
    if(t[0].checked){
        tipo="Comoda"
    }else{
        tipo="Super Comoda"
    }
    fetch("/alta-combi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            patente:patente.value,
            marca: marca.value,
            modelo: modelo.value,
            chofer: chofer.value,
            asientos: asientos.value,
            tipo:tipo,
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
                    location.replace("/listar-combi");
                    break;
            }
        });
}

document.getElementById("guardar").onclick=function(){
    limpiar();
    camposVacios();
    let errores = document.getElementsByClassName("er").length;
    if (errores === 0) {
        guardar();
    }
}
document.getElementById("chofer").onchange=function(){
    let n= document.getElementById("chofer").value;
    nombre.value="";
    nombre.value = document.getElementById(n).value
}