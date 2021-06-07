$("#cantidad").change(function () {
  subYTotal()
});

$("#agregar").click(() => {
  var x = document.getElementsByName(insumos.value);
  if (!x.length) {
    $("<div>").append(
      $('<div>',{
        'id': insumos.value
        }).append(
            $('<input>', {
              'name': insumos.value,
              'class':'nombre',
              'type':'text',
              'value': insumos.value,
              'disabled':true,
            }),
          $('<label>', {
            'text': "Cantidad: ",
          }),
          $('<input>', {
            'name': insumos.value,
            'class': 'cantidad',
            'type': 'number',
            'value': 1,
            'onchange': 'modificarSub()',
            'onkeypress': 'modificarSub()',
            'min': 1,
          }), 
          $('<button>', {
            'name': insumos.value,
            'type': 'button',
            'onclick':'eliminarInsumo(this)',
            'text':"eliminar" 
          }),
          
      )
    ).hide().appendTo('#listInsumo').fadeIn('fast');
    subYTotal();
  }
});
function calcularSub(){
  let cantidad = document.getElementsByClassName("cantidad");
  let precioT=0;
  for (let i = 0; i < cantidad.length; i++) {
    const e = cantidad[i];
    let precio= document.getElementsByClassName(e.name);
    precioT = precioT + (precio[0].value * e.value);
  }
  return precioT;
}
function modificarSub() {
  subYTotal();
  }

eliminarInsumo = (insumo) => {
  var x = $("#" + insumo.name + "");
  x.remove().fadeIn('fast');
  subYTotal()
}; 
function dosDecimales(n) {
  let t = n.toString();
  let regex = /(\d*.\d{0,2})/;
  return t.match(regex)[0];
}
function subYTotal() { 
  subtotal.value = calcularSub() + precio.value * cantidad.value;
  if(descuento.value!== "0%"){
    total.value = dosDecimales(subtotal.value * 0.9)
  }else{
    total.value=subtotal.value;
  }
 }
 subYTotal();

function resetForm() {
  document.getElementById("divCod").innerHTML ='<input type="text" required name="cod" id="cod" class="form-control" autocomplete="off" placeholder="" value="">';
  document.getElementById("divVencimiento").innerHTML ='<input type="month" required name="vencimiento" id="vencimiento" class="form-control" autocomplete="off" placeholder="" value="">';
  document.getElementById("divNombreT").innerHTML ='<input type="text" required name="nombreT" id="nombreT" class="form-control" autocomplete="off" placeholder="" value="">';
  document.getElementById("divDniT").innerHTML ='<input type="number" required name="dniT" id="dniT" class="form-control" autocomplete="off" placeholder="" value="">';
}

 $(function() {
  $('input:radio[name="elegirT"]').change(function() {
      if ($(this).val() == '1') {
        preCargado();
      } else {  
        resetForm();
      }
  });
});
$(document).ready(() => {
  $("#comprarB").click(function (event) {
   let v= $("#comprar").validate({
      submitHandler: function (form) {
        if (window.confirm("Esta seguro de realizar la compra por $" + total.value + " ?")) {
        subYTotal();
        fetch("/comprar-pasaje", {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cantidad: cantidad.value,
            idViaje: idViaje.value,
            total: total.value,
            insumos: insumosL(),
            cod: cod.value,
            vencimiento: vencimiento.value,
            nombreT: nombreT.value,
            dniT: dniT.value,
            seg: seg.value,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.response == "bien") {
              location.replace( '/pasajes-pendientes')
            } else {
              let lugar = data.response.error;
              let error = data.response.mensaje;
              let mostrar = {}
              mostrar[lugar] = error;
              console.log(mostrar);
              v.showErrors(
                 mostrar
              )
            }
          });
       } },
    });
  });
});
function insumosL(){
  let insumo= document.getElementsByClassName("nombre");
  let listI=[]
  for (let i = 0; i < insumo.length; i++) {
    const e = insumo[i];
    let cantidad=document.getElementsByClassName("cantidad")
    for (let j = 0; j < cantidad.length; j++) {
      const r = cantidad[j];
      if(r.name == e.name){
        let precio = document.getElementsByClassName(e.name);
        listI.push({insumo:e.name, cantidad:r.value, precio:precio[0].value})
      } 
    }
  }
  return listI
}
function pad(number) {
  if (number < 10) {
    return "0" + number;
  }
  return number;
}
Date.prototype.vence = function () {
  return this.getFullYear() + '-' + pad(this.getMonth() + 1);
};
vencimiento.min=(new Date).vence();