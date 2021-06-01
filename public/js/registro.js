//iniciacion 

function pad(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}

Date.prototype.fecha = function () {
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate())
};
Date.prototype.mes = function () {
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) 
};
let hoy= new Date;
vencimiento.min = hoy.mes();
document.getElementById('gold').onclick = function () {
    document.getElementById("tarjeta").style.display = 'inline';
    document.getElementById("cat").value = "gold";
}
document.getElementById('comun').onclick = function () {
    document.getElementById("tarjeta").style.display = 'none';
    document.getElementById("cat").value = "comun";
}
let mayor=(new Date((hoy.getFullYear() - 18),hoy.getMonth(),hoy.getDate()));

let viejo = (new Date((hoy.getFullYear() - 130), hoy.getMonth(), hoy.getDate()))
fechaN.min = (viejo.fecha());
fechaN.max=mayor.fecha();
fechaN.value = (mayor.getFullYear() - 30)+'-' + pad(hoy.getMonth() + 1) +
    '-' + pad(hoy.getDate());
//metodos
function limpiar() {
    document.getElementById("errFN").innerHTML = "";
    document.getElementById("errFV").innerHTML = "";
    document.getElementById("errE").innerHTML = "";
    document.getElementById("errC1").innerHTML = "";
    document.getElementById("errC2").innerHTML = "";
    document.getElementById("errCS").innerHTML = "";
    document.getElementById("errT").innerHTML = "";
    document.getElementById("err").innerHTML = "";
}



function registrar() {
    codigo = document.getElementById("cod").value;
    nombreT = document.getElementById("nombreT").value;
    dniT = document.getElementById("dniT").value;
    vencimiento = document.getElementById("vencimiento").value;
    let seg = document.getElementById("seg").value;
    fetch("/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: nombre.value,
            apellido: apellido.value,
            email: email.value,
            clave: clave.value,
            dni: dni.value,
            fechaN: fechaN.value,
            categoria: cat.value,
            codigo: codigo,
            vencimiento: vencimiento,
            nombreT: nombreT,
            dniT: dniT,
            codS: seg,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            switch (data.response) {
                case "error":
                    document.getElementById("errE").innerHTML =
                        '<small  style="color:red"><p class="er">este Email se registro anteriormente</p></small>';
                    break;
                case "bien":
                    location.replace("/home");
                    break;
            
                default:
                    document.getElementById("errT").innerHTML =
                        '<small  style="color:red"><p class="er">'+ data.response+'</p></small>';
                    break;
            }
            if (data.response === "error") {
                
            } else {
            }
        });
}
function validarClave1() {
    if (clave.value.length < 5 && clave.value !== "") {
        document.getElementById("errC1").innerHTML =
            "<small  style='color:red'><p class='er'>La contraseña tiene que tener minimo 6 caracteres</p></small>";
    }
}
function validarClave2() {
    if (clave.value.length > 5 && clave.value !== clave1.value) {
        document.getElementById("errC2").innerHTML =
            '<small  style="color:red"><p class="er">Ambas Contraseñas deben coincidir</p></small>';
    }
}

function validarCodigoS() {
    let c = seg.value;
    let numeros=[0,1,2,3,4,5,6,7,8,9];
    if (c.length !== 3 && cat.value === "gold" && c ) {
        document.getElementById("errCS").innerHTML =
            '<small  style="color:red"><p class="er">El codigo de seguridad debe ser de 3 digitos</p></small>';

    }
    if (c.length === 3 && cat.value === "gold" && c) {
        let esNum;
        for (let i = 0; i < c.length; i++) {
            const e = c[i];
            esNum= false;
            numeros.forEach(n => {
                if (e == n) {
                    esNum = true;
                }
            })
            if (!esNum) {
                document.getElementById("errCS").innerHTML =
                    '<small  style="color:red"><p class="er">El codigo de seguridad deben ser todos numeros</p></small>';
            }
            
        }
    }


}
function validarFechaN() {
    let guion = 0;
    let año = "";
    let mes = "";
    let dia = "";
    for (let i = 0; i < fechaN.value.length; i++) {
        const e = fechaN.value[i];
        if (e === '-') {
            guion++;
        } else {
            switch (guion) {
                case 0:
                    año = año + "" + e;
                    break;
                case 1:
                    mes = mes + "" + e;
                    break;
                case 2:
                    dia = dia + "" + e;
                    break;
            }
        }

    }
    let na = new Date(año, (mes - 1), dia);
    let edad;
    if (
        hoy.getMonth() >= na.getMonth() &&
        hoy.getDate() >= na.getDate()
    ) {
        edad = hoy.getFullYear() - na.getFullYear()
    } else {
        edad = hoy.getFullYear() - na.getFullYear() - 1;
    }
    if (edad < 18) {
        document.getElementById("errFN").innerHTML =
            '<small  style="color:red"><p class="er">Debes ser mayor de 18 años</p></small>';
    }
};
function validarFechaV() {
    if (cat.value === "gold" && vencimiento.value){
    let vencimiento = document.getElementById("vencimiento");
    let guion = 0;
    let año = "";
    let mes = "";
    let dia = "";
    for (let i = 0; i < vencimiento.value.length; i++) {
        const e = vencimiento.value[i];
        if (e === '-') {
            guion++;
        } else {
            switch (guion) {
                case 0:
                    año = año + "" + e;
                    break;
                case 1:
                    mes = mes + "" + e;
                    break;
                case 2:
                    dia = dia + "" + e;
                    break;
            }
        }

    }
    let na = new Date(año, (mes - 1), dia);
    let vencida=false;
    if (
        hoy.getFullYear()>na.getFullYear()
    ) {
        vencida = true
    } else {
        if (
            hoy.getMonth() > na.getMonth() &&
            hoy.getFullYear() === na.getMonth()
        ) {
            vencida = true
        }
    }
    if (vencida) {
        document.getElementById("errFV").innerHTML =
            '<small  style="color:red"><p class="er">La tarjeta esta vencida</p></small>';
    }
}};

function camposCompletosR() {
    let camposIn;
    if (!nombre.value || !apellido.value || !dni.value || !email.value || !fechaN.value || !clave.value || !clave1.value) {
        camposIn = true;

    }
    if (
        cat.value === "gold" &&
        (!cod.value ||
            !dniT ||
            !vencimiento ||
            !nombreT ||
            !seg.value )
    ) {
        camposIn = true;
    }
    if (camposIn) {
        document.getElementById("err").innerHTML =
            '<small  style="color:red"><p class="er">Todos los campos deben estar completos</p></small>';
    }
}

document.getElementById("enviar").onclick = function () {
    limpiar();
    camposCompletosR();
    validarClave1();
    validarClave2();
    validarFechaN();
    validarCodigoS();

    validarFechaV();
    let errores = document.getElementsByClassName("er").length;
    if (errores === 0) {
        registrar();
    }
};
