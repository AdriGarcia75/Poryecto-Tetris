//he cambiado el nombre de las variables (constantes) porque normalmente las constantes van en mayusculas
const CANVAS = document.getElementById("tetris");
const LIENZO = CANVAS.getContext("2d");

const FILAS = 20; // y
const COLUMNAS = 10; // x
const TAMANOCELDA = 30; //la medida de tamaño en pixeles

//canvasObj.strokeStyle y canvas.strokeRect

//tablero de 10x20 (meter esto en un .repeat(20) y dentro de la funcion lol, o no?)
const TABLERO = Array.from({ length: 20 }, () => Array(10).fill(0));

/* las probabilidades: 1 es el 100% y las 7 probabilidades conjuntas de las piezas suman un 98% (0.98)
el resto (2%, o 0.02) lo obtiene la letra C (ya que no es una pieza del tetris original) */
const piezas = [
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

    //quitar, es testeo
    TABLERO[0][2] = 1;
    TABLERO[0][3] = 1;

    for (let i = 0; i < TABLERO.length; i++) {
        for (let j = 0; j < TABLERO[i].length; j++) {
            LIENZO.fillStyle = TABLERO[i][j] == 1 ? "gray" : "black";
            LIENZO.fillRect(j * TAMANOCELDA, i * TAMANOCELDA, TAMANOCELDA, TAMANOCELDA); //el tamaño de un cuadrado es c * c (c siendo TAMANOCELDA)

            //QUITAR LUEGO y ponerlo en la logica que se haga solo una vez
            LIENZO.strokeStyle = "white";
            LIENZO.strokeRect(j * TAMANOCELDA, i * TAMANOCELDA, TAMANOCELDA, TAMANOCELDA);
        }
    }
}

dibujarTablero();

//esto pinta, no mueve la pieza en la matriz si se quiere mover, primero se pinta, se mueve y se vuelve a pintar (si no no se "moveria" xd anyways)
function pintarPieza(pieza, x, y) {
    //para cada array de la que esta formada la pieza
    for (let row = 0; row < pieza.forma.length; row++) {
        //para cada elemento de cada array de la que esta formada la pieza
        for (let col = 0; col < pieza.forma[col].length; col++) {
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

//meter en jugar() lo de pintar los bordes, no hace falta pintarlos en el tablero todo el rato XD
//haz un booleano global pa q se pinte una vez y ya lmfao llamalo pintarBorde = false, y a mamar XD

//las alturas serán como mucho 19 hasta 0, es que nose xd
//100% tengo que hacer algo que setee una ubicacion con x e y (que sea el principio de la pieza, porque solo hay una x e una y) 
//si es true pues hay colision (cuidao), si es false NO hay colision (bien)
function detectarColisiones(pieza, x, y) {

    for (let row = 0; row < pieza.forma.length; row++) {
        //para cada elemento de cada array de la que esta formada la pieza
        for (let col = 0; col < pieza.forma[col].length; col++) {
            //si el "trozo" de pieza no es aire se pinta (1 == pieza, 0 == aire, en negro, se deja como está)
            if (pieza.forma[row][col] == 1) {
                //misma logica que pintarPieza(), sin multiplicar por el tamaño de celda (no lo necesitamos)
                let xPieza = x + col;
                let yPieza = y + row;

                if ((xPieza >= COLUMNAS || xPieza < 0 || yPieza >= FILAS || yPieza < 0) || TABLERO[xPieza][yPieza] != 0) return true; //ocurre un out of bounds o un choque
            }
        }
    }
    //no ha ocurrido una colision con nada / no ha ocurrido un out of bounds
    return false;
}

//esta funcion si muta la matriz (la modifica)
function eliminarLinea(){
    for (let i = 0; i < TABLERO.length; i++){
        let isFull = true; //booleano controlador de si está llena la linea (de 1's, o mejor dicho, hay cero (0) huecos con aire (valores 0 por array))
        for (let j = 0; j < TABLERO[i].length; j++){
            if (TABLERO[i][j] == 0) {
                isFull = false;
                break; //salida prematura, ya hemos encontrado un hueco de aire en la array (un valor 0) 
            }
        }

        if (isFull) {
            TABLERO
        }
    }
}

function jugar() {

}