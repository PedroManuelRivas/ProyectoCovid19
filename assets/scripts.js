//Creando función para verificar si existe un token en sesión
$(document).ready(async function () {
    const token = localStorage.getItem("token");
    if (token) {
        postLogin()
    }
})

//Conexión con URL de API
const getData = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/total');
        const datosConsultaAPI = await response.json() //Devuelve objeto de arreglos con paises y datos de paises.
        return datosConsultaAPI;
    }
    catch (err) {
        console.error(err);
    }
}
//Fin de conexión a API

// Creación de la gráfica
(async () => {
    const response = await getData()
    let res = response.data
    data = res.filter(element => element.active > 200000)
    const barCharData = {
        labels: data.map(element => element.location),
        datasets: [{
            label: "Activos",
            backgroundColor: 'rgb(153, 102, 255)', //Morado
            data: data.map(element => element.active)
        },
        {
            label: "Recuperados",
            backgroundColor: 'rgb(54, 162, 235)', //Azul
            data: data.map(element => element.recovered)
        },
        {
            label: "Fallecidos",
            backgroundColor: 'rgb(255, 99, 132)', //Rojo
            data: data.map(element => element.deaths)
        },
        {
            label: "Confirmados",
            backgroundColor: 'rgb(42, 221, 39)', //Verde
            data: data.map(element => element.confirmed)
        }
        ]
    }

    var ctx = document.getElementById('canvasPaises').getContext('2d');
    window.myBar = new Chart(ctx, {
        type: "bar",
        data: barCharData,
        options: {
            responsive: true,
            position: 'top',
            title: {
                display: true,
                text: 'Casos COVID-19 a nivel mundial (más de 200.000 casos)',
                fontSize: 25,
                fontColor: 'black'
            }
        },
    })
    imprimirData()
})()
// Fin de bloque Gráfica

// Imprimir data obtenida en tabla de HTML
const imprimirData = async () => {
    try {
        const datosAPI = await getData();
        const data = datosAPI.data;
        data.forEach(async element => {
            $("#tablaCasos").append(`
        <tr> 
        <td style="vertical-align:middle;"><b>${element.location}</b></td>
        <td style="vertical-align:middle;">${Intl.NumberFormat().format(element.confirmed)}</td>
        <td style="vertical-align:middle;">${Intl.NumberFormat().format(element.deaths)}</td>
        <td style="vertical-align:middle;">${Intl.NumberFormat().format(element.recovered)}</td>
        <td style="vertical-align:middle;">${Intl.NumberFormat().format(element.active)}</td>
        <td style="vertical-align:middle;"><button type="button" class="btn btn-secondary" onclick="modalDetallePaises('${element.location}')" data-toggle="modal" data-target="#exampleModal">Gráfico</button></td>
        </tr>
        `)
        })
    }
    catch (err) {
        console.log(err)
    }
}
//Fin de bloque Tabla en HTML

//Creando modal para detalles 
const modalDetallePaises = async (country) => {
    try {
        $('.modal-title').html("")
        $('#graficaModal').html("")
        $('#footerDetalle').html("")
        const response = await fetch(`http://localhost:3000/api/countries/${country}`); //Me trae consulta con país
        const resolve = await response.json()
        const data = resolve.data
        $('#graficaModal').html('<canvas id="canvasModal"></canvas>')
        $(".modal-title").html(`<b><a>País seleccionado: </a>${data.location}</b>`)
        graficaDetalle(data.location, data.deaths, data.recovered, data.active, data.confirmed)
        $('#footerDetalle').html(`
        <div class="row">
            <div class="col-6">
            Fallecidos: <b>${Intl.NumberFormat().format(data.deaths)}</b>
            </div>
            <div class="col-6">
            Recuperados: <b>${Intl.NumberFormat().format(data.recovered)}</b>
            </div>
            <div class="col-6">
            Activos: <b>${Intl.NumberFormat().format(data.active)}</b>
            </div>
            <div class="col-6">
            Confirmados: <b>${Intl.NumberFormat().format(data.confirmed)}</b>
            </div>
        </div>
        `)
    }
    catch (err) {
        console.error(err);
    }
}
//Final de bloque modal para detalles

//Generar gráfica pie detalle para modal
const graficaDetalle = (pais, muertos, recuperados, activos, confirmados) => {
    var ctx = document.getElementById('canvasModal').getContext('2d');
    var myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [
                    muertos,
                    recuperados,
                    activos,
                    confirmados,
                ],
                backgroundColor: [
                    'rgb(255, 99, 132)', //Rojo
                    'rgb(54, 162, 235)', //Azul
                    'rgb(153, 102, 255)', //Purpura
                    'rgb(42, 221, 39)' //Verde
                ],
                label: pais
            }],
            labels: [
                'Muertos',
                'Recuperados',
                'Activos',
                'Confirmados',
            ]
        },
        options: {
            responsive: true
        }
    });
}
//Fin de bloque Gráfica en modal

//Lógica de Botones

//Creando logica de modal de inicio sesion
$("#botonLogIn").click(async () => { //Botón dentro de modal de inicio sesión
    let guardarCorreo = $("#email").val();
    let guardarContrasena = $("#password").val();
    await getAuth(guardarCorreo, guardarContrasena)
    postLogin()
    $("#botonSituacionChile").click()
})
//Fin de bloque inicio de sesión

//Creación de evento Cerrar Sesión
$("#botonLogOut").click(function () {
    localStorage.removeItem('token')
    location.reload();
})
//Fin de bloque Cerrar Sesión

//Lógica para botón Home
$("#botonVolver").click(function () {
    $("#toHideOnLogIn").show()  //Gráfico con todos los países y tabla con datos
    $("#divSituacionChile").hide() // toggle() //Gráfico con detalle de situación Chile 
    $("#botonVolver").attr("disabled", "disabled");
})
//Fin de lógica para botón Volver

//Lógica para botón Situación de Chile
$("#botonSituacionChile").click(function () {
    $("#divSituacionChile").show() //Gráfico con detalle de situación Chile  
    $("#toHideOnLogIn").hide() //Gráfico con todos los países y tabla con datos
})
//Fin de lógica para botón Situación de Chile 

//Lógica de Botones

//Creación de función para generar autorización
const getAuth = async (email, password) => {
    try {
        const response = await fetch(`http://localhost:3000/api/login`, {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
        const { token } = await response.json()
        localStorage.setItem('token', token)
    } catch (err) {
        console.error(err);
    }
}
//Fin de función para generar autorización

//Creación de función post-login
const postLogin = async () => {
    $("#botonIniciarSesion").hide() //Botón para inicio de sesión dentro del modal (formulario)
    $("#botonLogOut").removeClass("d-none") //Botón para cierre de sesión en NavBar
    $("#botonSituacionChile").removeClass("d-none") //Botón Situación Chile en NavBar
    $("#mensajeCargaSituacionChile").removeClass("d-none") //Pantalla de mensaje mientras se genera gráfico
    $("#botonSituacionChile").click() //Al recargar la pagina, vuelve a situación de chile
    cargarDatosParaSituacionChile()
}
//Fin de función post-login

//Función para obtener casos confirmados en Chile
const getConfirmedChile = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:3000/api/confirmed`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const data = await response.json()
    return data
}
//Fin de bloque obtener casos confirmados en Chile

//Función para obtener casos de pacientes muertos en Chile
const getDeathsChile = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:3000/api/deaths`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const data = await response.json()
    return data
}
//Fin de bloque obtener casos de pacientes muertos en Chile

//Función para obtener casos de pacientes recuperados en Chile
const getRecoveredChile = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:3000/api/recovered`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const data = await response.json()
    return data
}
//Fin de bloque obtener casos de pacientes recuperados en Chile

//Lógica para renderizar gráfico de Situación Chile
const cargarDatosParaSituacionChile = async () => {
    try {
        const [confirmados, recuperados, muertos] = await Promise.all([getConfirmedChile(), getRecoveredChile(), getDeathsChile()])
        const barCharData = {
            labels: confirmados.data.map(element => element.date),
            datasets: [{
                label: "Confirmados",
                borderColor: 'rgb(42, 221, 39)',
                backgroundColor: 'rgb(42, 221, 39)',
                borderWidth: '3',
                data: confirmados.data.map(element => element.total),
                fill: "false",
                pointBorderWidth: '0',
                pointRadius: '0'
            },
            {
                label: "Fallecidos",
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgb(255, 99, 132)',
                borderWidth: '3',
                data: muertos.data.map(element => element.total),
                fill: "false",
                pointBorderWidth: '0',
                pointRadius: '0'
            },
            {
                label: "Recuperados",
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgb(54, 162, 235)',
                borderWidth: '3',
                data: recuperados.data.map(element => element.total),
                fill: "false",
                pointBorderWidth: '0',
                pointRadius: '0'
            }
            ]
        }
        var ctx = document.getElementById('canvasSituacionChile').getContext('2d');

        window.myBar = new Chart(ctx, {
            type: "line",
            data: barCharData,
            options: {
                responsive: true,
                position: 'top',
                title: {
                    display: true,
                    text: 'Situación de Chile',
                    fontSize: 25,
                    fontColor: 'black'
                }
            },
        })
    } catch (err) {
        console.error(err);
    }
    finally {
        $("#mensajeCargaSituacionChile").addClass("d-none")
    }
}
//Fin de gráfico Situación Chile