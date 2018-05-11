//Evento que se dispara al inicio
window.addEventListener('load', inicio, false);


// ** OBJETOS  Y VARIABLES *****************************************************************
var imagenSelecionada = new Image(); //imagen selecionada para formar el puzzle

var cvPiezas;  //canvas de las piezas
var ctxPiezas; //contexto del canvas piezas

var cvPuzzle; //canvas del puzzle
var ctxPuzzle; //contexto del canvas puzzle

var imgDataArrayOrd = new Array(); //array de imageData con 48 elementos de 60x60px
var imgDataArrayDes = new Array(); //igual que imgDataArrayOrd pero desordenado (random)

// array de objetos miPieza con la info de cada pieza
var miArrayDisponibles = new Array(); 

// array de objetos miPieza colocados en el puzzle con toda la info
var miArrayPuzzle = new Array(); 

//array con los (cont) de las piezas que estan mal colocadas
var contMalColocadas

//posicion del raton al clicar en el CANVAS PIEZAS de 'x' y de 'y'
var mouseXpiezas, mouseYpiezas; 

//posicion del raton al hacer over en el CANVAS Puzzle de 'x' y de 'y'
var mouseXpuzzle, mouseYpuzzle; 

//posicion del raton al clicar en el CANVAS PUZZLE de 'x' y de 'y'
var mouseXpuzzle, mouseYpuzzle;

var piezaActualPiezas; //pieza que selecciono en el CANVAS PIEZAS

var piezaActualPuzzle; //casilla que sellecciono en el CANVAS PUZZLE

var contadorMovimientos;  //contador de movimientos del Puzzle

var textoPopUp; //Valor de la etiqueta span del popUp

var worker = new Worker('workers/worker.js'); // Se crea el worker


//objeto de tipo ImageData donde guardo todos los valores de la imagen original
var imageDataOriginal;

//objeto de tipo ImageData donde guardo todos los valores de la imagen actual al comprobar
var imageDataPuzzle;

//canvas empleado unicamente para coger la pieza y luego hacer el drag
var cvUnica;


// ** OBJETOS  Y VARIABLES *****************************************************************





//FUNCION CONSTRUCTOR DE LAS PIEZAS
function miPieza(cont, canvas, context, imgData, posX, posY, selec, ocupada){

    // VARIABLES
    this.cont = cont;
    this.canvas = canvas;
    this.context = context;
    this.imgData = imgData;
    this.posX = posX;
    this.posY = posY;
    this.selec = selec;
    this.ocupada = ocupada;
    
    // METODOS
    // metodo que devuelve la poscion
    this.getCont = function(){ 
        return this.cont;
    }

    this.getCanvas = function(){ 
        return this.canvas;
    }
    
    // metodo que devuelve el contexto del canvas
    this.getContext = function(){
        return this.context;
    }

    // metodo que devuelve el objeto imageData
    this.getImgData = function(){
        return this.imgData;
    }
    
    // metodo que devuelve la posicion en X de la pieza en el canvas
    this.getPosX = function(){
        return this.posX;
    }

    // metodo que devuelve la posicion en Y de la pieza en el canvas
    this.getPosY = function(){
        return this.posY;
    }
    
    // metodo que devuelve si la pieza esta seleccionada o no
    this.getSelec = function(){
        return this.selec;
    }

    // metodo que devuelve si la pieza esta ocupada o no
    this.getOcupada = function(){
        return this.ocupada;
    }

    //seteo la variable canvas
    this.setCont = function(val){ 
        this.cont = val;
    }

    //seteo la variable canvas
    this.setCanvas = function(val){ 
        this.canvas = val;
    }
    
    //seteo la variable context
    this.setContext = function(val){
        this.context = val;
    }

    //seteo la variable imgData
    this.setImgData = function(val){
        this.imgData = val;
    }
    
    //seteo la variable posX
    this.setPosX = function(val){
        this.posX = val;
    }

    //seteo la variable posY
    this.setPosY = function(val){
        this.posY = val;
    }

    //seteo la variable selec
    this.setSelec = function(){
      if(this.selec == true){
        this.selec = false;
      }
      else{
        this.selec = true;
      }
    }

    //seteo la vatiable ocupada
    this.setOcupada = function(val){
        this.ocupada = val;
    }

    //para resaltar la pieza
    this.ponerContorno = function(){
      this.setSelec();

      if(this.canvas.id == "canvasPiezas"){
        this.context.strokeStyle ='#f00';
        this.context.lineWidth = 4;
        this.context.strokeRect(posX-2.5,posY-2.5,65,65);
      }
      else{
        this.context.strokeStyle ='#0f0';
        this.context.lineWidth = 2;
        this.context.strokeRect(posX,posY,60,60);
      }
    }

    //para dejar de resaltar la pieza
    this.quitarContorno = function(){
      this.setSelec();

      if(this.canvas.id == "canvasPiezas"){
        this.context.strokeStyle ='#fff';
        this.context.lineWidth = 5;
        this.context.strokeRect(posX-2.5,posY-2.5,65,65);
      }
      else{  
        iniciarCanvasPuzzle();
      }
    }

    //marca las piezas mal colocadas
    this.marcarMalColocada = function(){
      this.context.strokeStyle ='#f00';
      this.context.lineWidth = 2;
      this.context.strokeRect(posX,posY,60,60);  
    }

    


}//FIN DEL OBJETO miPieza



//PERMITE QUE SE PUEDAN ARRASTRAR ELEMENTOS A LA <img> Y DISPARA EL EVENTO DROP CUANDO SE HACE
//INICIALIZA ALGUNOS OBJETOS
function inicio() {
  document.getElementById('imgSelecionada').addEventListener('dragover', permitirDrop, false);    
  document.getElementById('imgSelecionada').addEventListener('drop', drop, false);

  document.getElementById('canvasPuzzle').addEventListener('dragover', permitirDrop, false);

  cvPiezas = document.getElementById("canvasPiezas");
  ctxPiezas = cvPiezas.getContext('2d');

  cvPuzzle = document.getElementById("canvasPuzzle");
  ctxPuzzle = cvPuzzle.getContext('2d');

  cvUnica = document.getElementById("canvasUnica");
  ctxUnica = cvUnica.getContext('2d');

  contadorMovimientos = document.getElementById("pMovimientos");
  textoPopUp = document.getElementById("spanPopUp");


  iniciarCanvasPuzzle();
}





// CARGA LA IMAGEN QUE SELECIONAMOS EN EL INPUT
function cargarImagen(){

   var imagen = document.getElementById("imgSelecionada");

   var nomImagen = document.getElementById("inputSeleccionar").value;

   if(esUnaImagen(nomImagen)){
   		imagen.src = "imagenes/"+ nomImagen;
      imagenSelecionada = imagen;

      document.getElementById('imgSelecionada').onload = function(){

        recortarImagen2();

      };
      
   }
   else{
      mostrarPopUp("Por favor, seleccione una imagen");
   }

}


//PARA VALIDAR SI EL ARCHIVO SELECCIONADO ES UNA IMAGEN
function esUnaImagen(nomImagen){
	if(
   		nomImagen.substring(nomImagen.length-4,nomImagen.length) == ".png" ||
   		nomImagen.substring(nomImagen.length-4,nomImagen.length) == ".PNG" ||
   		nomImagen.substring(nomImagen.length-4,nomImagen.length) == ".gif" ||
   		nomImagen.substring(nomImagen.length-4,nomImagen.length) == ".GIF" ||
   		nomImagen.substring(nomImagen.length-4,nomImagen.length) == ".jpg" ||
   		nomImagen.substring(nomImagen.length-4,nomImagen.length) == ".JPG"
   ){
   		return true;
   }
   else{
   		return false;
   }

}


//IMPRIME UN OBJEO POR CONSOLA
function imprimirObjeto(o) {
  var salida = '';
  for (var p in o) {
    salida += p + ': ' + o[p] + '\n';
  }
  console.log(salida);
}


function drop(ev){
  ev.preventDefault();
  var arch=new FileReader();


  if(esUnaImagen(ev.dataTransfer.files[0].name)){
    arch.addEventListener('load',leer,false);
    arch.readAsDataURL(ev.dataTransfer.files[0]);   
  }
  else{
    mostrarPopUp("Por favor, arrastre una imagen");
  }
}      
    
function permitirDrop(ev){
  ev.preventDefault();
}    
    
function leer(ev) {
 document.getElementById('imgSelecionada').onload = function(){
  imagenSelecionada =  document.getElementById('imgSelecionada');

  recortarImagen2();

 };
 document.getElementById('imgSelecionada').src = ev.target.result; 

 

}



//RESTAURA EL CANVAS DEL PUZZLE A LA FORMA INICIAL (REJILLA)
function iniciarCanvasPuzzle(){
  cvPuzzle.width = cvPuzzle.width;

  ctxPuzzle.strokeStyle ='#000';
  ctxPuzzle.lineWidth = 2;

  var contOcupadas = 0;
  var cont = 0;
  for(i = 0; i < 8; i++){
    for(j = 0; j < 6; j++){

      if( miArrayPuzzle.length != 48){ //para entrar solo la primera vez

        var miCasillaActual = new miPieza(
          cont,
          cvPuzzle,
          ctxPuzzle,
          undefined,
          60*i, 
          60*j, 
          false,
          false
        );

        miArrayPuzzle.push(miCasillaActual);

      }
       
       if(miArrayPuzzle[cont].getImgData() == undefined){
          ctxPuzzle.strokeRect(
            miArrayPuzzle[cont].getPosX(),
            miArrayPuzzle[cont].getPosY(),
            60,
            60
          );
         miArrayPuzzle[cont].setOcupada(false); 

      }
      else{
        contOcupadas++;
        ctxPuzzle.putImageData(
          miArrayPuzzle[cont].getImgData(),
          miArrayPuzzle[cont].getPosX(),
          miArrayPuzzle[cont].getPosY()
        );
         miArrayPuzzle[cont].setOcupada(true);

      }

        cont++;
    }
  }
  if(contOcupadas == 48){
    document.getElementById('buttonComprobar').style.visibility = 'visible';
  }

}

//RESTAURA EL CANVAS DEL PIEZAS A LA FORMA INICIAL
function iniciarCanvasPiezas(){
  cvPiezas.width = cvPiezas.width;

  ctxPiezas.strokeStyle ='#f00';
  ctxPiezas.lineWidth = 4;


  var cont = 0;
  for(i = 0; i < 8; i++){
    for(j = 0; j < 6; j++){

      if( miArrayDisponibles.length != 48){ //para entrar solo la primera vez

          var miPiezaActual = new miPieza(
            cont, 
            cvPiezas, 
            ctxPiezas, 
            imgDataArrayDes[cont], 
            (65*i)+5, 
            (65*j)+5, 
            false,
            false
          );

          miArrayDisponibles.push(miPiezaActual);
          
      }
       
      
      if(miArrayDisponibles[cont] != undefined){ //para que solo la pinte cuando exista  
         
          ctxPiezas.putImageData(
            miArrayDisponibles[cont].getImgData(),
            miArrayDisponibles[cont].getPosX(),
            miArrayDisponibles[cont].getPosY()
          );
      }
      cont++;

    }
  }

}


//FUNCION QUE RECORTA Y DIBUJA LAS PIEZAS DEL PUZZLE ADEMAS
//DE ALMACENAR CADA PIEZA EN UN OBJETO miPieza
function recortarImagen2(){
  ctxPiezas = cvPiezas.getContext('2d');
  ctxPuzzle = cvPuzzle.getContext('2d'); 

  ctxPuzzle.drawImage(imagenSelecionada, 0, 0, 480, 360);

  //almaceno la imagen para luego compararla con el resultado
  imageDataOriginal = ctxPuzzle.getImageData(0, 0, 480, 360);


  //METO EN imgDataArrayOrd LAS 48 PIESZAS DE LA IMAGEN
  for(i = 0; i < 8; i++){
    for(j = 0; j < 6; j++){
      imgDataArrayOrd.push(ctxPuzzle.getImageData(60*i,60*j,60,60));
    }
  }

  //CLONO Y DESORDENO EL ARRAY
  imgDataArrayDes = imgDataArrayOrd.slice(0);
  imgDataArrayDes = imgDataArrayDes.sort(function() {return Math.random() - 0.5});

  iniciarCanvasPuzzle();
  iniciarCanvasPiezas();
  
  //Añado los eventListener para poder hacer click derecho en ambos canvas
  cvPiezas.addEventListener("mousedown",clikCanvasPiezas,false);
  cvPuzzle.addEventListener("mousedown",clikCanvasPuzzle,false);

}


//funcion que actualiza la posicion en la que he clicado en el canvas de piezas
function clikCanvasPiezas(e){

  //compruebo si hay alguna pieza del canvas puzzle seleccionada para deseleccionarla
  var piezaPuzzle = miArrayPuzzle.filter(function(el){
    return el.selec == true;
  });
  if(piezaPuzzle.length > 0){
    piezaPuzzle[0].quitarContorno();
    piezaActualPuzzle = undefined;
  }


  if(e.offsetX) {
      mouseXpiezas = e.offsetX;
      mouseYpiezas = e.offsetY;
  }
  else if(e.layerX) {
      mouseXpiezas = e.layerX;
      mouseYpiezas = e.layerY;
  }

  toglePiezaDisponibles();
}

//selecciona o deselecciona la piezza clicada del canvas de piezas disponibles
function toglePiezaDisponibles(){


  piezaSelec = miArrayDisponibles.filter(function(el){
      return mouseXpiezas >= el.posX    &&
             mouseXpiezas <= el.posX+60 &&
             mouseYpiezas >= el.posY    &&
             mouseYpiezas <= el.posY+60;
  });

  piezaActualPiezas = piezaSelec[0];
  
  if(piezaActualPiezas != undefined){
      if(!piezaActualPiezas.getSelec() ){ //si la pieza actual no esta seleccionada

        //cojo la pieza que esta seleccionada
        piezaUltima = miArrayDisponibles.filter(function(el){
          return el.selec == true;
        });

        if(piezaUltima.length >= 1){ //si hay alguna pieza selecionada anteriormente
          piezaUltima[0].quitarContorno();
        }

        piezaActualPiezas.ponerContorno();
      }
      else{
        piezaActualPiezas.quitarContorno();
        piezaActualPiezas = undefined;
      }
  }

  else{ //para cuando pincho en una zona vacia del canvas y tengo una pieza contorneada
    iniciarCanvasPiezas();
  }

}

//se activa cuando clico en el canvas puzzle
function clikCanvasPuzzle(e){
  if(e.offsetX) {
      mouseXpuzzle = e.offsetX;
      mouseYpuzzle = e.offsetY;
  }
  else if(e.layerX) {
      mouseXpuzzle = e.layerX;
      mouseYpuzzle = e.layerY;
  }

  manejarPuzzle();

}


function manejarPuzzle(){

  var piezaClicada = miArrayPuzzle.filter(function(el){
      return mouseXpuzzle >= el.posX    &&
             mouseXpuzzle <= el.posX+60 &&
             mouseYpuzzle >= el.posY    &&
             mouseYpuzzle <= el.posY+60;
  });


  //PIEZA DISPONIBLE NO SELECCIONADA
  if(piezaClicada[0] != undefined && piezaActualPiezas == undefined){ 

    //caso 1: La pieza que toco es la misma que tengo  selleccionada
    if(piezaClicada[0] == piezaActualPuzzle){
      piezaActualPuzzle.quitarContorno();
      piezaActualPuzzle = undefined;
    }
    //caso 2: La pieza que toco es distinta a la que tengo  selleccionada
    else{
        //caso 2.1, si toco una pieza y no tengo ninguna seleccionada ->la selecionare
        if(piezaActualPuzzle == undefined){
          piezaClicada[0].ponerContorno();
          piezaActualPuzzle = piezaClicada[0];
        }
        //caso 2.2, si toco una pieza y tengo una seleccionada ->las intercambiare
        else{      
            var auxUltima = piezaClicada[0].getCont();
            var imgUltima = piezaClicada[0].getImgData();

            var auxActual = piezaActualPuzzle.getCont();
            var imgActual = piezaActualPuzzle.getImgData();


            miArrayPuzzle[auxUltima].setImgData(imgActual);
            miArrayPuzzle[auxActual].setImgData(imgUltima);


            iniciarCanvasPuzzle();
            aumentarMovimientos(contadorMovimientos.innerHTML);

            miArrayPuzzle[auxActual].setSelec();
            piezaActualPuzzle = undefined;
        }
    }  

  }
  //PIEZA DISPONIBLE SELECCIONADA
  else if(piezaClicada[0] != undefined && piezaActualPiezas.getSelec() ){
    if(piezaClicada[0].getOcupada() == false){
        piezaClicada[0].setCanvas(cvPuzzle);
        piezaClicada[0].setContext(ctxPuzzle);
        piezaClicada[0].setImgData(piezaActualPiezas.getImgData());
        //piezaClicada[0].setOcupada();

        ctxPuzzle.putImageData(
          piezaClicada[0].getImgData(),
          piezaClicada[0].getPosX(),
          piezaClicada[0].getPosY()
        );

        //quito imagen del array del canvas de piezas desponibles
        delete miArrayDisponibles[piezaActualPiezas.getCont()] ;
        piezaActualPiezas.setSelec();
        piezaActualPiezas = undefined;

        iniciarCanvasPiezas();
        iniciarCanvasPuzzle();
        aumentarMovimientos(contadorMovimientos.innerHTML);
    }
    else{
      mostrarPopUp("Esta casilla ya esta ocupada");
    }

  }

}


function aumentarMovimientos(val){
   var movimientos = parseInt(val)+1;
   contadorMovimientos.innerHTML = movimientos;
}


function comprobarResultado(){
  iniciarCanvasPuzzle();

  if(piezaActualPuzzle != undefined){
    piezaActualPuzzle = undefined;
    
  }

  imageDataPuzzle = ctxPuzzle.getImageData(0, 0, 480, 360);




  worker.postMessage({
    'imageDataOriginal':imageDataOriginal.data,
    'imageDataPuzzle':imageDataPuzzle.data, 
  });  

    worker.onmessage = function(e){ // Se asigna el handler para el evento message
      contMalColocadas = e.data.res;

      marcarResultado();

    };
}


function marcarResultado(){
  if(contMalColocadas.length == 0){

    mostrarPopUp("Has conseguido armar el Puzzle ! Movimientos: "+contadorMovimientos.innerHTML);
  }
  else{
    for(i = 0; i<contMalColocadas.length; i++){
      var cont = contMalColocadas[i];
      miArrayPuzzle[cont].marcarMalColocada();
    }   
  }
   
}

function clickEnButoImagen(){
  document.getElementById("inputSeleccionar").click();
}

function cerrarPopUp(){
  if(textoPopUp.innerHTML == "Has conseguido armar el Puzzle ! Movimientos: "+contadorMovimientos.innerHTML){
    window.location="file:///D:/RuBi/Ingeniería Multimedia/3º IM/2º Cuatrimestre/Programación Hipermedia 2/practicas/Practica 3/web/index.html";
  }

  document.getElementById("popUp").style.visibility ="hidden";

  document.getElementById("header").style.opacity = 1;
  document.getElementById("main").style.opacity = 1;
  document.getElementById("footer").style.opacity = 1;

}

function mostrarPopUp(val){
  textoPopUp.innerHTML = val;
  document.getElementById("popUp").style.visibility ="visible";

  document.getElementById("header").style.opacity = 0.3;
  document.getElementById("main").style.opacity = 0.3;
  document.getElementById("footer").style.opacity = 0.3;

}

function dragStart(event){
    event.dataTransfer.effectAllowed = 'move';

    if(event.offsetX) {
      mouseXpiezas = event.offsetX;
      mouseYpiezas = event.offsetY;
  }
  else if(event.layerX) {
      mouseXpiezas = event.layerX;
      mouseYpiezas = event.layerY;
  }
  
  piezaSelec = miArrayDisponibles.filter(function(el){
      return mouseXpiezas >= el.posX    &&
             mouseXpiezas <= el.posX+60 &&
             mouseYpiezas >= el.posY    &&
             mouseYpiezas <= el.posY+60;
  });

  if(piezaSelec[0] != undefined){
      ctxUnica.putImageData(
          piezaSelec[0].getImgData(),
          0,
          0
  );

      var img = document.createElement("img");

      var src = cvUnica.toDataURL();

      img.src = src;



      event.dataTransfer.setDragImage(img, 30, 30);


      event.dataTransfer.setData("Text", piezaSelec[0].getCont());
  }
}

function dropPuzzle(event){
  

  
  event.preventDefault();
  var data = event.dataTransfer.getData("Text");

  if (event.stopPropagation)
  event.stopPropagation(); // Evita la propagación del evento

if(event.offsetX) {
      mouseXpuzzle = event.offsetX;
      mouseYpuzzle = event.offsetY;
  }
  else if(event.layerX) {
      mouseXpuzzle = event.layerX;
      mouseYpuzzle = event.layerY;
  }
  
  piezaSelec = miArrayPuzzle.filter(function(el){
      return mouseXpuzzle >= el.posX    &&
             mouseXpuzzle <= el.posX+60 &&
             mouseYpuzzle >= el.posY    &&
             mouseYpuzzle <= el.posY+60;
  });

  if(!piezaSelec[0].getOcupada()){

    aumentarMovimientos(contadorMovimientos.innerHTML);

    piezaSelec[0].setImgData(miArrayDisponibles[parseInt(data)].getImgData());

    delete miArrayDisponibles[[parseInt(data)]] ;
    piezaActualPiezas = undefined;

    iniciarCanvasPiezas();
    iniciarCanvasPuzzle();
  }
  else{
    mostrarPopUp("Esta casilla ya esta ocupada");
  }

 

}








