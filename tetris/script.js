const CANVAS = document.getElementById("tetris");
const LIENZO = CANVAS.getContext("2d");

const FILAS = 20; // y
const COLUMNAS = 10; // x
const TAMANOCELDA = 30; //la medida de tamaño en pixeles

//coordenadas iniciales utilizadas como ubicación por defecto
const XINICIAL = 4; //4, asi se genera en medio del tablero
const YINICIAL = 0;

//tablero de 10x20
const TABLERO = Array.from({ length: 20 }, () => Array(10).fill(0));
let siguientePieza = undefined; //esta variable guardará la siguiente ficha a utilizar

const TIEMPODIFICULTADBASE = 500; //tiempo base para el intervalo
const DECREMENTOTIMER = 20; // es constante, cada 500 puntos, se restaran 20ms al tiempo

//serie de nodos, puntuacion y los 4 contadores de lineas, guardados en constantes globales porque van a ser consultados multiples veces
const PUNTUACION = document.getElementById("puntuacion");
const NODOLINEASLIMPIADAS1 = document.getElementById("lineasLimpiadas1");
const NODOLINEASLIMPIADAS2 = document.getElementById("lineasLimpiadas2");
const NODOLINEASLIMPIADAS3 = document.getElementById("lineasLimpiadas3");
const NODOLINEASLIMPIADASTETRIS = document.getElementById("lineasLimpiadasTetris");
const NODOSIGUIENTEPIEZA = document.getElementById("siguientePieza");

const PUNTOSLINEA = [100, 300, 500, 800]; //lista que contiene cuantos puntos hay que otorgar por numero de lineas completadas en el mismo movimiento, ver puntuacionLineas()
const CONTADORLINEAS = [0, 0, 0, 0];

/* 
** Las 7 piezas de Tetris tienen aproximadamente 1/7 de probabilidades (14.27%).
** La pieza C se ha hecho a propósito una pieza rara, se le ha asignado una probabilidad de 1 - (0.142 * 7), resultado = 0.006%, 
** al ser requisito del ejercicio pero mantener el sistema fiel al del Tetris original.
*/
const PIEZAS = [
    { nombre: "O", forma: [[1, 1], [1, 1]], probabilidad: 0.142, color: "yellow" },
    { nombre: "S", forma: [[0, 1, 1], [1, 1, 0]], probabilidad: 0.142, color: "green" },
    { nombre: "Z", forma: [[1, 1, 0], [0, 1, 1]], probabilidad: 0.142, color: "red" },
    { nombre: "L", forma: [[1, 0], [1, 0], [1, 1]], probabilidad: 0.142, color: "orange" },
    { nombre: "J", forma: [[0, 1], [0, 1], [1, 1]], probabilidad: 0.142, color: "blue" },
    { nombre: "T", forma: [[1, 1, 1], [0, 1, 0]], probabilidad: 0.142, color: "violet" },
    { nombre: "I", forma: [[1, 1, 1, 1]], probabilidad: 0.142, color: "lightblue" },
    { nombre: "C", forma: [[1, 1, 1], [1, 0, 1]], probabilidad: 0.006, color: "red" }
];

function dibujarTablero() {

    for (let i = 0; i < TABLERO.length; i++) {
        for (let j = 0; j < TABLERO[i].length; j++) {
            LIENZO.fillStyle = TABLERO[i][j] == 1 ? "gray" : "black";
            LIENZO.fillRect(j * TAMANOCELDA, i * TAMANOCELDA, TAMANOCELDA, TAMANOCELDA); //el tamaño de un cuadrado es c * c (c siendo TAMANOCELDA)
        }
    }
}

//esto pinta, no muta la matriz. nota: primero se pinta, se borra, se "mueve" y se vuelve a pintar
function dibujarPieza(pieza, x, y) {
    //para cada array de la que esta formada la pieza
    for (let row = 0; row < pieza.forma.length; row++) {
        //para cada elemento de cada array de la que esta formada la pieza
        for (let col = 0; col < pieza.forma[row].length; col++) {
            //si el "trozo" de pieza no es aire se pinta (1 == pieza, 0 == aire, en negro, se deja como está)
            if (pieza.forma[row][col] == 1) {
                let xPieza = (x + col) * TAMANOCELDA; //usamos col porque moverse entre columnas es moverse en el eje X
                let yPieza = (y + row) * TAMANOCELDA; //lo mismo pero con el eje Y y rows (cambiar de fila es un movimiento vertical)

                LIENZO.fillStyle = pieza.color;

                LIENZO.fillRect(xPieza, yPieza, TAMANOCELDA, TAMANOCELDA);
            }
        }
    }
}

//implementación de la selección ponderada por acumulación, devolvemos una pieza seleccionada aleatoriamente
function generarPieza() {
    //toFixed redondea y 1 / 7 (en la pieza es 14.2) es 14.3, he preferido hacer un math.floor con 3 decimales
    const NUMEROALEATORIO = Math.floor(Math.random() * 1000) / 1000; //crear un numero aleatorio entre 0 y 1 y redondear hacia abajo a 3 decimales

    let sum = 0;
    let piezaOutput;

    //vas sumando las probabilidades de los objetos hasta que la suma sea >= que el numero aleatorio generado
    for (let pieza of PIEZAS) {
        sum += pieza.probabilidad;

        if (sum >= NUMEROALEATORIO) {
            piezaOutput = pieza;
            break; //no necesitamos buscar más en este punto (sin el break sobreescribiriamos la pieza encontrada hasta acabar las opciones)
        }
    }

    return piezaOutput;
}

//si es true pues hay colision, si es false NO hay colision (bien)
function chequearColisiones(pieza, x, y) {

    for (let row = 0; row < pieza.forma.length; row++) {
        //para cada elemento de cada array de la que esta formada la pieza
        for (let col = 0; col < pieza.forma[row].length; col++) {
            //si el "trozo" de pieza no es aire se pinta (1 == pieza, 0 == aire, en negro, se deja como está)
            if (pieza.forma[row][col] == 1) {
                //misma logica que pintarPieza(), sin multiplicar por el tamaño de celda (no lo necesitamos)
                let xPieza = x + col;
                let yPieza = y + row;

                if ((xPieza >= COLUMNAS || xPieza < 0 || yPieza >= FILAS || yPieza < 0) || TABLERO[yPieza][xPieza] != 0) return true; //ocurre un out of bounds o un choque
            }
        }
    }

    //no ha ocurrido una colision con nada / no ha ocurrido un out of bounds
    return false;
}

//esta funcion coloca la pieza en el tablero, cuando la pieza no puede seguir más, se posiciona por ultima vez y se registra esta pieza en la matriz
function posicionarPieza(pieza, x, y) {
    for (let row = 0; row < pieza.forma.length; row++) {
        for (let col = 0; col < pieza.forma[row].length; col++) {
            //el uso previo de la funcion chequearColisiones() nos permite obviar el problema de pintar encima de un 1 (y de los out of bounds) ya existente en la matriz
            if (pieza.forma[row][col] == 1) {
                TABLERO[y + row][x + col] = 1;
            }
        }
    }
}

//NO cambia (muta) el atributo "forma", simplemente lo calcula, da la vuelta 90º en el sentido horario a la matriz pieza.forma
function rotarPieza(pieza) {
    //guardamos la pieza original
    let formaOriginal = pieza.forma;

    //el array que contendrá las partes de la pieza rotada
    let formaGiradaOutput = [];

    for (let col = 0; col < formaOriginal[0].length; col++) {
        //el array que contendrá las partes de cada parte
        let nuevaFila = [];
        //recorremos el sub array al reves y añadimos estas partes
        for (let row = formaOriginal.length - 1; row >= 0; row--) {
            nuevaFila.push(formaOriginal[row][col]);
        }
        formaGiradaOutput.push(nuevaFila); //añadimos la parte a la formaOutput
    }

    return formaGiradaOutput;
}

//funcion que calcula y suma la puntuacion al limpiar lineas (se dará un bonus por limpiar más de una linea a la vez, hasta 4, llamado Tetris)
//PUNTOSLINEA es una lista que contiene los valores a sumar por cantidad de lineas limpiadas
function puntuacionLineas(numeroLineasLimpiadas) {
    //es teoricamente imposible, en caso de que se limpien más de 4 lineas en un movimiento
    if (numeroLineasLimpiadas > 4) {
        puntosTotales += PUNTOSLINEA[3];
        numeroLineasLimpiadas -= 4;
    }

    if (numeroLineasLimpiadas == 1) {
        puntosTotales += PUNTOSLINEA[0];
        CONTADORLINEAS[0]++;
        NODOLINEASLIMPIADAS1.innerHTML = `Simples realizados: ${CONTADORLINEAS[0]}`;
    }
    else if (numeroLineasLimpiadas == 2) {
        puntosTotales += PUNTOSLINEA[1];
        CONTADORLINEAS[1]++;
        NODOLINEASLIMPIADAS2.innerHTML = `Dobles realizados: ${CONTADORLINEAS[1]}`;
    }
    if (numeroLineasLimpiadas == 3) {
        puntosTotales += PUNTOSLINEA[2];
        CONTADORLINEAS[2]++;
        NODOLINEASLIMPIADAS3.innerHTML = `Triples realizados: ${CONTADORLINEAS[2]}`;
    }
    if (numeroLineasLimpiadas == 4) {
        puntosTotales += PUNTOSLINEA[3];
        CONTADORLINEAS[3]++;
        NODOLINEASLIMPIADASTETRIS.innerHTML = `Tetris realizados ${CONTADORLINEAS[3]}`;
    }

    PUNTUACION.innerHTML = `Puntuación: ${puntosTotales}`;
}

/* esta funcion si muta la matriz (la modifica) - se encarga de borrar TODAS las lineas llenas, no solo una.
** IMPORTANTE: aunque el nombre sea eliminar, esta funcion tambien añade una fila nueva */
//añadido: eliminar lineas junto a un contador, llamará a puntuacionLineas()
function eliminarLineas() {
    let numeroLineasLimpiadas = 0;
    //borrar comentario luego: posible mejora, recorrer las filas de abajo hacia arriba (asi no hace falta hacer i--)
    for (let i = 0; i < TABLERO.length; i++) {
        let isFull = true; //booleano que controla si está llena la linea (de algo que no sea aire (valores 0))
        for (let j = 0; j < TABLERO[i].length; j++) {
            if (TABLERO[i][j] == 0) {
                isFull = false;
                break; //salida prematura, ya hemos encontrado un hueco de aire en la array (un valor 0) 
            }
        }

        if (isFull) {
            TABLERO.splice(i, 1);
            //añadimos una fila (una subArray de 0's) nueva, arriba del todo del tablero y bajamos todo lo existente 1 fila abajo.
            TABLERO.unshift(Array(10).fill(0));
            i--; //hemos borrado una linea (aunque la hayamos reinsertado, volvemos para atrás)
            numeroLineasLimpiadas++;
        }
    }

    //calculamos la nueva puntuación
    puntuacionLineas(numeroLineasLimpiadas);
}

//será utilizada en actualizar();
function calcularTiempoDificultad(){
    return Math.max(200, TIEMPODIFICULTADBASE - 20 * Math.floor(puntosTotales / 500)); //cada 500 puntos
}

//variables utilizadas para la ejecución
let piezaActiva = generarPieza();
let y = YINICIAL;
let x = XINICIAL;
let tiempoDificultad = TIEMPODIFICULTADBASE;
let puntosTotales = 0; //variable que guarda los puntos

function actualizar() {
    y++; //movemos la pieza para abajo

    //la logica principal ocurre a partir del siguiente problema: al bajar la pieza chocamos con algo, si no, bajamos y ya
    if (chequearColisiones(piezaActiva, x, y)) {
        //colocamos la pieza justo arriba de la posicion nueva ("anulamos" el y++ porque colisiona), donde sabemos que no colosiona
        posicionarPieza(piezaActiva, x, y - 1);

        puntuacionLineas();

        eliminarLineas(); //esta funcion eliminará todas las lineas que estén completas y ajustaran el contenido / bloques colocados del tablero

        if (tiempoDificultad > 200){
            let nuevoTiempoDificultad = calcularTiempoDificultad(); //calculamos el posible incremento en velocidad, hasta un limite
            
            if (nuevoTiempoDificultad != tiempoDificultad) {
                tiempoDificultad = nuevoTiempoDificultad;
                clearInterval(intervaloJugar);
                intervaloJugar = setInterval(jugar, tiempoDificultad); //tenemos que resetear el intervalo, con el nuevo tiempo
            }
        }

        //conseguimos una pieza nueva
        if (siguientePieza === undefined) siguientePieza = generarPieza();

        piezaActiva = siguientePieza;

        siguientePieza = generarPieza();

        NODOSIGUIENTEPIEZA.innerHTML = `Siguiente pieza: ${siguientePieza.nombre}`

        //volvemos a la posición por defecto
        y = YINICIAL;
        x = XINICIAL;

        //y volvemos a mirar si la pieza cabe, en este caso si no cabe (en la posición inicial) quiere decir que no caben más piezas, es decir, la partida acaba
        if (chequearColisiones(piezaActiva, x, y)) {
            //se acaba la partida
            clearInterval(intervaloJugar); //el intervalo del scope(superior) de jugar();
            alert("FIN DE LA PARTIDA, Tetris hecho por Adri :D");
        }
    }
}


function jugar() {
    //actualizamos el estado de la partida
    actualizar();

    //y actualizamos el estado VISUAL del tablero (lo repintamos)
    LIENZO.clearRect(0, 0, CANVAS.width, CANVAS.height); //esto lo borra

    dibujarTablero();
    //nota: "piezaActiva", "x" e "y" son variables declaradas en el ambito global
    dibujarPieza(piezaActiva, x, y);
}

let intervaloJugar = setInterval(jugar, tiempoDificultad);

//eventListener encargado de escuchar clicks de las teclas
document.addEventListener("keydown", (evento) => {
    //funcionamiento para el movimiento de las piezas -> mirar tecla presionada > check de si es válida la nueva posición -> modificar la coordenada pertinente
    if (evento.key == "a" || evento.key == "A") {
        if (!chequearColisiones(piezaActiva, x - 1, y)) {
            x--;
        }
    }

    if (evento.key == "d" || evento.key == "D") {
        if (!chequearColisiones(piezaActiva, x + 1, y)) {
            x++;
        }
    }

    if (evento.key == "s" || evento.key == "S") {
        if (!chequearColisiones(piezaActiva, x, y + 2)) {
            y++;
        }
    }

    //funcionalidad de rotar la pieza
    if (evento.key == "w" || evento.key == "W") {

        //guardo solo la forma, asi no tengo que guardar un objeto entero (ya que es requerido por chequearColisiones)
        let formaOriginal = piezaActiva.forma;
        piezaActiva.forma = rotarPieza(piezaActiva);

        //aqui nos interesa probar si la nueva forma colisiona, si NO colisiona, no entrará aqui => no restaurará la forma original
        if (chequearColisiones(piezaActiva, x, y)) {
            piezaActiva.forma = formaOriginal;
        }
    }

    LIENZO.clearRect(0, 0, CANVAS.width, CANVAS.height);
    dibujarTablero();
    dibujarPieza(piezaActiva, x, y);
});