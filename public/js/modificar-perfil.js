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
Date.prototype.yearMonth = function () {
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1)
};
let hoy=new Date;

function requerir(){
    cod.required=true;
    vencimiento.required = true;
    nombreT.required = true;
    dniT.required = true;
    seg.required = true;
}
function noRequerir(){
    cod.required = false;
    vencimiento.required = false;
    nombreT.required = false;
    dniT.required = false;
    seg.required = false;
}
vencimiento.min = hoy.yearMonth();
document.getElementById('gold').onclick = function () {
    $("#tarjeta").show("fast")
    $("#tar").show("fast")
    requerir()
    document.getElementById("cat").value = "gold";
}
document.getElementById('comun').onclick = function () {
    $("#tarjeta").hide("fast")
    $("#tar").hide("fast")
    noRequerir()
    document.getElementById("cat").value = "comun";
}
let mayor= hoy.setFullYear(hoy.getFullYear()-18)
fechaN.max = (new Date(mayor)).mediaFecha();
$(document).ready(() => {
    $("#modificarB").click(function (event) {
       let v= $("#modificar").validate({
            rules: {
                clave1: {
                    required: true,
                    equalTo: "#clave",
                }
            },
            messages:{
                clave1:{
                    equalTo:"Las claves deben coincidir"
                },
                fechaN:{
                    max:"Debe ser mayor de edad"
                }
            },
            submitHandler: function (form) {

                $(form).ajaxSubmit((data) => {
                    if(data.response!=="bien"){

                        let lugar = data.response.lugar;
                        let error = data.response.error;
                        let mostrar = {}
                        mostrar[lugar] = error;
                        v.showErrors(
                            mostrar
                        )
                    }else{
                        location.replace("/perfil");
                    }
                });
            }
        });
    });

})
