
     let hoy = new Date();
     console.log(hoy);

     let ven = document.getElementById("vencimiento");
     ven.min = hoy.getFullYear() + "";

     console.log(ven);