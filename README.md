# Proyecto Tetris - CFGS Desarrollo de Aplicaciones Web

Este es un proyecto de **Tetris** realizado para la asignatura de **Desarrollo en Entorno Cliente** del **CFGS Desarrollo de Aplicaciones Web**.

## Tecnologías

- **JavaScript**: Lógica del juego.
- **HTML/CSS**: Estructura y presentación del juego.
- **[Canvas API](https://canvasjs.com/)**: Usada para la representación visual del juego.

## Características
#### Nota (para evitar confusiones): sinónimos del acto de *completar* una linea: *limpiar*, *eliminar*, *borrar*. 
- Juego interactivo de **Tetris**, fiel a las mecánicas principales, con una pieza nueva, la pieza C, ver más detalles en la parte de "Modificaciones" 
- Control de las piezas: **izquierda: "a", "A", derecha: "d", "D", abajo: "s", "S", rotar: "w", "W".**
- **Puntuación** que aumenta conforme se eliminan lineas y *sólo* cuando se eliminen las lineas.
- Seguimiento de cuantas lineas a la vez se limpian, se cuentan las eliminaciones **simples, dobles, triples y Tetris (cuádruples)**.

## Modificaciones / cambios a tener en cuenta en cuanto a las restricciones de la tarea.
- La letra C se ha mantenido, se podría quitar sin ningun problema, pero he preferido dejarla. Sale un 0.06%, un muy bajo porcentaje de aparición para que sea lo más parecido al Tetris original, pero que pueda llegar a aparacer.
- La función **eliminarLinea()** la he llamado **eliminarLineas()** ya que lee todo el tablero y es capaz de borrar más de una linea.
- La función **eliminarLineas()** también se encarga de llamar a la función **puntuacionLineas()**
- Modificaciones *necesarias* ligeras al HTML inicial.
- Las constantes están **todas** declaradas en mayúsculas, **las constantes que se daban inicialmente en el proyecto también**, para que hubiese consistencia.
