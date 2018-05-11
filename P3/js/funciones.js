/* FUNCIONES DEL JUEGO */

// variables
var piezas = new Array;// total de piezas
var piezasCorrectas = new Array;// orden correcto de las piezas
var piezasCorregir = new Array;// piezas colocadas para corregir
var canvasDesordenado = document.getElementById("contenedor");// canvas con las piezas
var canvasOrdenado = document.getElementById('puzzle');// canvas del juego
var estado;// estado del canvas
var estadoPuzzle;// estado del puzzle
var imagen;// imagen del puzzle
var urlImg;// url de la imagen
var puntero;// coordenadas del raton
var punteroPuzzle;// coordenadas del raton en el puzzle
var piezaSelec;// pieza seleccionada
var imgDnD;// etiqueta imagen
var antigua = -1;// pieza anterior
var contador = 0;// movimientos totales realizados
var actual;// pieza actual
var agarrada;// posicion de la pieza seleccionada
var cambio = false;// para controlar el cambio de piezas
var piezaCambio;// pieza que sera cambiada
//var worker = new Worker('js/worker.js');// creamos el worker
var imagenOrig;// imagen original
var imagenPuzzle;// imagen del puzzle

/* PARA CARGAR LAS IMAGENES */
function carga() {

    var img = document.getElementById('cargar').value;
    
    if(esImg(img.split('.')[1]) == true){
    
        urlImg = img.split('\\')[2];
    
        document.getElementById('imgOrig').src = "images/"+urlImg;

        cargar('');
    }else{
    
        // mostrar mensaje de error de fichero
        mensaje("Debes introducir una imagen.");
    }
}

// para comprobar que es una imagen
function esImg(file) {

    if(file == "jpeg" || file == "png" || file == "gif" || file == "jpg"){
    
        return true;
    }
    
    return false;
}

// cargar imagen arrastrando DnD
function arrastrarImg(e){

    e.stopPropagation();
    e.preventDefault();
}

function dejarImg(e){

    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    var file = e.dataTransfer.files[0];// imagen desde escritorio
    var reader = new FileReader();
    
    if(esImg(file.name.split('.')[1]) == true){
    
        reader.onload = (function(imgFile){
    
            return function(e){

                imgDnD.src = e.target.result;
                cargar(e.target.result);
            };
        })(file);

        reader.readAsDataURL(file);
    }else{
    
        // mostrar mensaje indicando que debe introducir una imagen
        mensaje("Debes introducir una imagen.");
    }
}

imgDnD = document.getElementById('imgOrig');
imgDnD.addEventListener('dragover', arrastrarImg, false);
imgDnD.addEventListener('drop', dejarImg, false);

// cargar la imagen
function cargar(file){

    imagen = new Image();
    imagen.addEventListener('load', puzzle, false);
    
    if(file != ''){
    
        imagen.src = file;
    }else{
    
        imagen.src = imgDnD.src;
    }
}

// iniciar canvas
function canvas(){

    estado = canvasDesordenado.getContext("2d");
    estadoPuzzle = canvasOrdenado.getContext('2d');    
}

// para desordenar las piezas del puzzle
function shuffleArray(o){
    
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

// creamos las piezas a partir de la imagen
function construirPiezas(){

    var pieza;
    var x = 0;
    var y = 0;
    
    for(var i=0; i<48; i++){
    
        pieza = {};
        pieza.sx = x;
        pieza.sy = y;
        pieza.id = i;
        piezas.push(pieza);
        piezasCorrectas.push(pieza);
        x += 60;
        
        // bajamos a la siguiente fila
        if(x >= 480){
        
            x = 0;
            y += 60;
        }
    }
    
    piezasDraw();
}

// dibujar las piezas desordenadas
function piezasDraw(){

    // guardo la informacion de la imagen para el worker
    estado.drawImage(imagen, 0, 0, 480, 360);
    imagenOrig = estado.getImageData(0, 0, 480, 360);
    
    // desordeno el array y dibujo las piezas
    piezas = shuffleArray(piezas);
    estado.clearRect(0, 0, 480, 360);
    
    var pieza;
    var x = 0;
    var y = 0;
    
    for(var i=0; i<piezas.length; i++){
    
        pieza = piezas[i];
        pieza.x = x;
        pieza.y = y;
        estado.drawImage(imagen, pieza.sx, pieza.sy, 60, 60, x, y, 60, 60);
        
        // dibujar cuadricula de los canvas
        estado.strokeStyle = "#000";
        estado.strokeRect(x, y, 60, 60);
        estadoPuzzle.strokeStyle = "#000";
        estadoPuzzle.strokeRect(x, y, 60, 60);
        x += 60;
        
        // bajamos a la siguiente fila
        if(x >= 480){
        
            x = 0;
            y += 60;
        }
    }
}

// dibujar canvas de nuevo
function redibujar(){
      
    estado.clearRect(piezas[antigua].x, piezas[antigua].y, 60, 60);
    estado.drawImage(imagen, piezas[antigua].sx, piezas[antigua].sy, 60, 60, piezas[antigua].x, piezas[antigua].y, 60, 60);
    estado.restore();
    
    estado.strokeStyle = "#000";
    estado.strokeRect(piezas[antigua].x, piezas[antigua].y, 60, 60);
}

// mover las piezas desordenadas
function moverPiezas(e){

    var rec =  canvasDesordenado.getBoundingClientRect();
    
    estado.save();// guardamos en la pila el estado del puzzle
                        
    if(e.layerX || e.layerY == 0){
    
        puntero.x = e.clientX - rec.left;
        puntero.y = e.clientY - rec.top;
    }else if(e.offsetX || e.offsetX == 0){
    
        puntero.x = e.offsetX - canvasDesordenado.offsetLeft;
        puntero.y = e.offsetY - canvasDesordenado.offsetTop;
    }

    actual = comprobarPieza();
    piezaSelec = piezas[actual];
    
    if(actual > -1 && piezaSelec != null){
        
        // misma ficha seleccionada
        if(actual == antigua){
            
            redibujar(actual);
            piezaSelec = null;// deseleccionamos la ficha
            
        // fichas seleccionadas diferentes
        }else{
        
            // limpiamos si hay ficha anterior a la seleccionada
            if(antigua > -1){
            
                redibujar();
            }
            
            estado.translate(0, 0);
            estado.strokeStyle = "#FF0000";
            estado.lineWidth = 2;
            estado.strokeRect(piezaSelec.x, piezaSelec.y, 60, 60); 

            antigua = actual;
        }
    }
}

canvasDesordenado.addEventListener("click", moverPiezas, false);

// comprobar pieza seleccionada
function comprobarPieza(){

    var pieza;
    
    for(var i=0; i<piezas.length; i++){
    
        pieza = piezas[i];
        
        if(pieza != null && puntero.x > pieza.x && puntero.y > pieza.y && puntero.x < (pieza.x+60) && puntero.y < (pieza.y+60)){
        
		  	agarrada = i;
            return i;
        }
    }
}

// comprobar pieza seleccionada en el puzzle
function comprobarPieza2(){

    var pieza;
    
    for(var i=0; i<piezasCorregir.length; i++){
    
        pieza = piezasCorregir[i];
        
        if(pieza != null && punteroPuzzle.x > pieza.x && punteroPuzzle.y+360 > pieza.y && punteroPuzzle.x < (pieza.x+60) && punteroPuzzle.y+360 < (pieza.y+60)){
        
            return i;
        }
    }
}

// para comprobar que no halla una pieza en el lugar donde se quiere colocar
function compruebaPosicion(){

    if(piezasCorregir.length > 0){
        for(var i=0; i<piezasCorregir.length; i++){
            if(punteroPuzzle.x == piezasCorregir[i].x && punteroPuzzle.y == piezasCorregir[i].y){
            
                return false;// posicion ocupada
            }
        }
    }
    
    return true;// posicion vacia
}

// colocar pieza en el puzzle
function colocarPieza(e){

    var rec =  canvasDesordenado.getBoundingClientRect();
    
    estadoPuzzle.save();// guardamos en la pila el estado del puzzle
    
    if(piezas.length > 0){
        if(e.layerX || e.layerY == 0){
    
            punteroPuzzle.x = e.clientX - rec.left;
            punteroPuzzle.y = e.clientY - rec.top;
        }else if(e.offsetX || e.offsetX == 0){

            punteroPuzzle.x = e.offsetX - canvasOrdenado.offsetLeft;
            punteroPuzzle.y = e.offsetY - canvasOrdenado.offsetTop;
        }

        // si tengo una pieza agarrada
        if(agarrada > -1 && cambio == false){
            
            posicionDejar();// calculamos la posicion donde dejar la pieza
            
            if(compruebaPosicion() == true){
                
                // deseleccionamos la pieza colocada anteriormente
                if(piezasCorregir.length > 0){

                    estadoPuzzle.strokeStyle = "#000";
                    estadoPuzzle.strokeRect(piezasCorregir[piezasCorregir.length-1].x, piezasCorregir[piezasCorregir.length-1].y, 60, 60);
                }

                // dibujamos la pieza
                estadoPuzzle.drawImage(imagen, piezas[agarrada].sx, piezas[agarrada].sy, 60, 60, punteroPuzzle.x, punteroPuzzle.y, 60, 60);
                contador++;// incrementamos el contador
                document.getElementById('contador').innerHTML = "Movimientos: "+contador;// cambiamos el html
                piezasCorregir.push(piezas[agarrada]);// metemos la pieza
                borraPieza();// la borramos del panel desordenadas

                // cambiamos sus posicion y la marcamos como seleccionada
                piezasCorregir[piezasCorregir.length-1].x = punteroPuzzle.x;
                piezasCorregir[piezasCorregir.length-1].y = punteroPuzzle.y;
                estadoPuzzle.translate(0, 0);
                estadoPuzzle.strokeStyle = "#FF0000";
                estadoPuzzle.lineWidth = 2;
                estadoPuzzle.strokeRect(piezasCorregir[piezasCorregir.length-1].x, piezasCorregir[piezasCorregir.length-1].y, 60, 60);
            }else{
            
                // mostrar mensaje de error posicion ocupada
                mensaje("Esta casilla esta ocupada.");
            }
            
            
        // si quiero cambiar la ficha colocada a otra posicion
        }else if(agarrada < 0 && cambio == false){
            
            // limpiamos cualquier pieza que este seleccionada
            for(var i=0; i<piezasCorregir.length; i++){
            
                estadoPuzzle.strokeStyle = "#000";
                estadoPuzzle.strokeRect(piezasCorregir[i].x, piezasCorregir[i].y, 60, 60);
            }
        
            agarrada = comprobarPieza2();console.log(piezasCorregir[agarrada].id);
            cambio = true;
            
            estadoPuzzle.translate(0, 0);
            estadoPuzzle.strokeStyle = "#FF0000";
            estadoPuzzle.lineWidth = 2;
            estadoPuzzle.strokeRect(piezasCorregir[agarrada].x, piezasCorregir[agarrada].y, 60, 60);
            
        }else if(cambio == true){
        
            piezaCambio = comprobarPieza2();// pieza por la que queremos cambiar
            var piezaAux = piezasCorregir[agarrada];console.log(piezasCorregir[agarrada].id);console.log(piezasCorregir[piezaCambio].id);
            
            if(agarrada > -1 && piezaAux != null){
        
                // misma ficha seleccionada
                if(agarrada == piezaCambio){

                    piezaAux = null;// deseleccionamos la ficha
                    estadoPuzzle.strokeStyle = "#000";
                    estadoPuzzle.strokeRect(piezasCorregir[agarrada].x, piezasCorregir[agarrada].y, 60, 60);
                    agarrada = -1;
                    piezaCambio = -2;
                    cambio = false;

                // fichas seleccionadas diferentes
                }else{

                    // hacemos el cambio
                    estadoPuzzle.drawImage(imagen, piezasCorregir[agarrada].sx, piezasCorregir[agarrada].sy, 60, 60, piezasCorregir[piezaCambio].x, piezasCorregir[piezaCambio].y, 60, 60);
                    estadoPuzzle.drawImage(imagen, piezasCorregir[piezaCambio].sx, piezasCorregir[piezaCambio].sy, 60, 60, piezasCorregir[agarrada].x, piezasCorregir[agarrada].y, 60, 60);
                    estadoPuzzle.strokeStyle = "#000";
                    estadoPuzzle.strokeRect(piezasCorregir[agarrada].x, piezasCorregir[agarrada].y, 60, 60);
                    piezasCorregir[agarrada] = piezasCorregir[piezaCambio];
                    piezasCorregir[piezaCambio] = piezaAux;
                    cambio = false;
                    agarrada = -1;  
                    piezaCambio = -2;console.log(piezasCorregir);
                }
            }
        }
    }
}

canvasOrdenado.addEventListener("click", colocarPieza, false);

// comprobar la posicion donde dejar la pieza
function posicionDejar(){

    // posicion x donde colocar
    if(punteroPuzzle.x < 60){ punteroPuzzle.x = 0; }
    if(punteroPuzzle.x < 120 && punteroPuzzle.x >=60){ punteroPuzzle.x = 60; }
    if(punteroPuzzle.x < 180 && punteroPuzzle.x >=120){ punteroPuzzle.x = 120; }
    if(punteroPuzzle.x < 240 && punteroPuzzle.x >=180){ punteroPuzzle.x = 180; }
    if(punteroPuzzle.x < 300 && punteroPuzzle.x >=240){ punteroPuzzle.x = 240; }
    if(punteroPuzzle.x < 360 && punteroPuzzle.x >=300){ punteroPuzzle.x = 300; }
    if(punteroPuzzle.x < 420 && punteroPuzzle.x >=360){ punteroPuzzle.x = 360; }
    if(punteroPuzzle.x < 480 && punteroPuzzle.x >=420){ punteroPuzzle.x = 420; }
    
    // posicion y donde colocar
    if(punteroPuzzle.y > -360 && punteroPuzzle.y <=-300){ punteroPuzzle.y = 0; }
    else if(punteroPuzzle.y > -300 && punteroPuzzle.y <=-240){ punteroPuzzle.y = 60; }
    else if(punteroPuzzle.y > -240 && punteroPuzzle.y <=-180){ punteroPuzzle.y = 120; }
    else if(punteroPuzzle.y > -180 && punteroPuzzle.y <=-120){ punteroPuzzle.y = 180; }
    else if(punteroPuzzle.y > -120 && punteroPuzzle.y <=-60){ punteroPuzzle.y = 240; }
    else if(punteroPuzzle.y > -60){ punteroPuzzle.y = 300; }
}

// para borrar la pieza que ya ha sido colocada
function borraPieza(){

    antigua = -1;// evitamos que redibuje la ficha que ha sido movida
    estado.clearRect(piezas[agarrada].x, piezas[agarrada].y, 60, 60);
    piezas[agarrada] = null;
    agarrada = -1;// soltamos la pieza
}

// reiniciar el juego
function reiniciar(){

    estadoPuzzle.clearRect(0, 0, 480, 360);
    contador = 0;
    document.getElementById('contador').innerHTML = "Movimientos: "+contador;
}

// iniciar el juego del puzzle
function puzzle(){

    piezas = [];
    piezasCorrectas = [];
    puntero = {x:0,y:0};
    punteroPuzzle = {x:0,y:0};
    canvas();
    reiniciar();
    construirPiezas();// dividimos la imagen
}

// para comprobar si el puzzle esta correcto
function corregir(){

    var contador = 0;
    
    // llamada al worker para comprobar la imagen
    imagenPuzzle = estadoPuzzle.getImageData(0, 0, 480, 360);

    worker.onmessage = function(e){
        
        contador = e.data.res;
    }
    
    worker.postMessage({

        'imagenOrig':imagenOrig.data, 'imagenPuzzle':imagenPuzzle.data,
    });
}

// funcion para mostrar el mensaje
function mensaje(m){

    var msg = document.querySelector("main>div");
    
    document.getElementById("msg").innerHTML = m;
    msg.style.transitionProperty = "top";
    msg.style.transitionDuration = "1s";
    msg.style.top = "400px";
}

// funcion para cerrar el mensaje
function cerrar(){

    var msg = document.querySelector("main>div");
    msg.style.transitionProperty = "top";
    msg.style.transitionDuration = "1s";
    msg.style.top = "-490px";
}

// para desencadenar el evento y llamar al input file
function cargaImg(){

    document.getElementById("cargar").click();
}