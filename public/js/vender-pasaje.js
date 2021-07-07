
$(document).ready(() => {
    $("#verificar").click(function (event) {
        $("#form").validate({
            submitHandler: function (form) {
                $(form).ajaxSubmit((data) => {
                    if (data) {
                        window.alert(data.mensaje);
                        if (data.response !== "rol") {
                            email_pasaje.value = data.usuario.email;
                            $("#datos_pasaje").show("fast");
                            if (data.usuario.categoria === "gold") {
                                descuento.value = "10%";
                                subYTotal();
                            } else {
                                descuento.value = "0%";
                                subYTotal();
                            }
                        }
                    }
                });
            }
        });
    });
})

function dosDecimales(n) {
    let t = n.toString();
    let regex = /(\d*.\d{0,2})/;
    return t.match(regex)[0];
}
function subYTotal() {
    subtotal.value = precio.value * cantidad.value;
    if (descuento.value !== "0%") {
        total.value = dosDecimales(subtotal.value * 0.9)
    } else {
        total.value = subtotal.value;
    }
}
$("#cantidad").change(function () {
    subYTotal()
});
$(document).ready(() => {
    $("#comprarB").click(function (event) {
        let v = $("#comprar").validate({
            submitHandler: function (form) {
                if (window.confirm("Esta seguro de realizar la venta por $" + total.value + " ?")) {
                    $(form).ajaxSubmit((data) => {
                        if (data.response == "bien") {
                            location.replace("/registrar-sintomas/" + data.pasaje._id)
                        } else {
                            let lugar = data.error;
                            let error = data.mensaje;
                            let mostrar = {}
                            mostrar[lugar] = error;
                            console.log(mostrar);
                            v.showErrors(
                                mostrar
                            )
                        }
                    });
                }
            },
        });
    });
});