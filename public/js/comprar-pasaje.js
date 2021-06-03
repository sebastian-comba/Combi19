$("#cantidad").change(function () {
  $("#subtotal").val(precio.value * cantidad.value);
});

$("#agregar").click(() => {
  var x = document.getElementsByName(insumos.value);
  console.log(x);
  if (!x.length) {
    listInsumo.innerHTML =
      listInsumo.innerHTML +
      '<div id="' +
      insumos.value +
      '"><input type="text" class="nombre" disabled name="' +
      insumos.value +
      '" value="' +
      insumos.value +
      '"> <label name="' +
      insumos.value +
      '">Cantidad:</label> <input type="number" class="cantidad" name="' +
      insumos.value +
      '" value="1" min="1"> <button type="button" onclick="eliminarInsumo(this)" name="' +
      insumos.value +
      '">Eliminar</button> <br></div>';
  }
});

eliminarInsumo = (insumo) => {
  var x = $("#" + insumo.name + "");
  console.log(x);
  x.remove();
}; 