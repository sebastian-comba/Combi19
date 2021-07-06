
$(document).ready(() => {
    $("#iniciar").click(function (event) {
        let v = $("#iniciar_form").validate({
            submitHandler: function (form) {
                $(form).ajaxSubmit((data) => {
                    if (data.response === "bien") {
                        estado.innerHTML = "En viaje";
                        botones.innerHTML = '<form id="terminar_form" action="/terminar-viaje/'+idViaje.value+'" method="GET"> <button class="btn btn-primary"  id="terminar">Terminar</button></form><br>'
                        if (asientos.innerHTML > 0) {
                            botones.innerHTML += '<form id="vender_form" action="/vender-pasaje/'+idViaje.value +'" method="GET"> <button class="btn btn-primary"  id="vender">Vender Pasaje</button></form>'
                        }
                    }
                });
            }
        });
    });
    $("#terminar").click(function (event) {
        if (window.confirm("Estas seguro que desea finalizar el Viaje?")) {
            let v = $("#terminar_form").validate({
                submitHandler: function (form) {
                    $(form).ajaxSubmit((data) => {
                        if (data.response === "bien") {
                            location.replace("/listar-pasajeros/" + idViaje.value);
                        }
                    });
                }
            });
        }
    });

})