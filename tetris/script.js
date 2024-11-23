const CANVAS = document.getElementById("tetris");
const LIENZO = CANVAS.getContext("2d");

const FILAS = 20; // y
const COLUMNAS = 10; // x
const TAMANOCELDA = 30; //la medida de tamaño en pixeles

//coordenadas iniciales utilizadas como ubicación por defecto
const XINICIAL = 4; //4, asi se genera en medio del tablero
const YINICIAL = 0;

//canvasObj.strokeStyle y canvas.strokeRect para pintar bordes

//tablero de 10x20
const TABLERO = Array.from({ length: 20 }, () => Array(10).fill(0));

/* las probabilidades: 1 es el 100% y las 7 probabilidades conjuntas de las piezas suman un 98% (0.98)
el resto (2%, o 0.02) lo obtiene la letra C (ya que no es una pieza del tetris original) */
const PIEZAS = [
    { nombre: "C", forma: [[1, 1, 1], [1, 0, 1]], probabilidad: 0.02, color: "red" },
    { nombre: "O", forma: [[1, 1], [1, 1]], probabilidad: 0.14, color: "yellow" },
    { nombre: "I", forma: [[1, 1, 1, 1]], probabilidad: 0.14, color: "lightblue" },
    { nombre: "S", forma: [[0, 1, 1], [1, 1, 0]], probabilidad: 0.14, color: "orange" },
    { nombre: "Z", forma: [[1, 1, 0], [0, 1, 1]], probabilidad: 0.14, color: "green" },
    { nombre: "L", forma: [[1, 0], [1, 0], [1, 1]], probabilidad: 0.14, color: "red" },
    { nombre: "J", forma: [[0, 1], [0, 1], [1, 1]], probabilidad: 0.14, color: "green" },
    { nombre: "T", forma: [[1, 1, 1], [0, 1, 0]], probabilidad: 0.14, color: "blue" }
];

function dibujarTablero() {

    for (let i = 0; i < TABLERO.length; i++) {
        for (let j = 0; j < TABLERO[i].length; j++) {
            LIENZO.fillStyle = TABLERO[i][j] == 1 ? "gray" : "black";
            LIENZO.fillRect(j * TAMANOCELDA, i * TAMANOCELDA, TAMANOCELDA, TAMANOCELDA); //el tamaño de un cuadrado es c * c (c siendo TAMANOCELDA)
        }
    }
}

dibujarTablero();

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

//implementación de la selección ponderada, por acumulación, devolvemos una pieza, ya seleccionada aleatoriamente

//BORRAR COMMENT - para hacer lo de la cola, hacer un fifo asi pequeñin (es sencillo) y poco mas, y usar el fifo jiji
function generarPieza() {
    const NUMEROALEATORIO = parseFloat(Math.random().toFixed(2)); //crear un numero aleatorio entre 0 y 1 y redondearlo a 2 decimales, conversion a float porque toFixed devuelve un string

    let sum = 0;
    let piezaOutput;

    //vas sumando las probabilidades de los objetos hasta que sea mayor o igual que el numero aleatorio generado
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
function posicionarPieza(pieza, x, y){
    for (let row = 0; row < pieza.forma.length; row++) {
        for (let col = 0; col < pieza.forma[row].length; col++) {
            //el uso previo de la funcion chequearColisiones() nos permite obviar el problema de pintar encima de un 1 (y de los out of bounds) ya existente en la matriz
            if (pieza.forma[row][col] == 1) {
                TABLERO[y + row][x + col] = 1;
            }
        }
    }
}

/* esta funcion si muta la matriz (la modifica) - se encarga de borrar TODAS las lineas llenas, no solo una.
IMPORTANTE: aunque el nombre sea eliminar, esta funcion tambien añade una fila nueva */
function eliminarLineas(){

    //borrar comentario luego: posible mejora, recorrer las filas de abajo hacia arriba (asi no hace falta hacer i--)
    for (let i = 0; i < TABLERO.length; i++){
        let isFull = true; //booleano que controla si está llena la linea (de algo que no sea aire (valores 0))
        for (let j = 0; j < TABLERO[i].length; j++){
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
        }
    }
}

//hay que declarar las variables x e y, y tambien una que guarde la pieza actual, que serán utilizadas por ambas jugar() y actualizar() (y en esta implementación no serán pasadas como parametros)
let piezaActiva = generarPieza();
let y = YINICIAL;
let x = XINICIAL;

function actualizar(){
    y++; //movemos la pieza para abajo

    //la logica principal ocurre a partir del siguiente problema: al bajar la pieza chocamos con algo, si no, bajamos y ya
    if (chequearColisiones(piezaActiva, x, y)){
        //colocamos la pieza justo arriba de la posicion nueva ("anulamos" el y++ porque colisiona), donde sabemos que no colosiona
        posicionarPieza(piezaActiva, x, y - 1);

        eliminarLineas(); //esta funcion eliminará todas las lineas que estén completas y ajustaran el contenido / bloques colocados del tablero
        
        piezaActiva = generarPieza(); //conseguimos una pieza nueva
        //volvemos a la posición por defecto
        y = YINICIAL;
        x = XINICIAL;

        //y volvemos a mirar si la pieza cabe, en este caso si no cabe (en la posición inicial) quiere decir que no caben más piezas, es decir, la partida acaba
        if (chequearColisiones(piezaActiva, x, y)){
            //se acaba la partida
            clearInterval(intervaloJugar); //el intervalo del scope(superior) de jugar();
            alert("FIN DE LA PARTIDA, este juego ha sido desarrollado por Adrián GP");
        }
    }
}

function jugar() {
    //actualizamos el estado de la partida
    actualizar();

    //y actualizamos el estado VISUAL del tablero (lo repintamos)
    LIENZO.clearRect(0, 0, CANVAS.width, CANVAS.height); //esto lo borra

    dibujarTablero();
    //REMINDER: "piezaActiva", "x" e "y" son variables declaradas en el ambito global
    dibujarPieza(piezaActiva, x, y);
}

let intervaloJugar = setInterval(jugar, 200);

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
        if (!chequearColisiones(piezaActiva, x, y + 1)) {
            y++;
        }
    }

    LIENZO.clearRect(0, 0, CANVAS.width, CANVAS.height);
    dibujarTablero();
    dibujarPieza(piezaActiva, x, y);
});