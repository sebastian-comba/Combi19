$("#cantidad").change(function () {
  subtotal.value = calcularSub() + precio.value * cantidad.value;
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
