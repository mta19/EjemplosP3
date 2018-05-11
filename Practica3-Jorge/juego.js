var piezaSeleccionada=-1;
var piezaAcambiar;
var numPieza;
var w;
var movs =0;
var piezasPuzzle = new Array(8);
for(var i=0;i<8;i++){
	piezasPuzzle[i] = new Array(6);
}
function inicializarPiezasPuzzle() {
	for(var i=0;i<8;i++){
		for(var j=0;j<6;j++){
			piezasPuzzle[i][j]=-1;
		}
	}
}
function iniciar(){
	var contenedorImagen = document.getElementById("img");
	var input = document.getElementById("imagen");
	var elemOrigen = "";

	contenedorImagen.ondragstart = function(e){
		elemOrigen = this;
		e.dataTransfer.setData('text/html', this.innerHTML);
	}

	contenedorImagen.ondragover = function(e){
		if (e.stopPropagation) e.stopPropagation(); 
		return false; 
	}

	input.ondrop = function(e){
		if (e.stopPropagation)
		e.stopPropagation(); 
		e.preventDefault();
		
		input.files = e.dataTransfer.files; 
	}
}


function dibujaCuadricula()
{
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext('2d');
	context.strokeStyle = 'grey'; 
	context.lineWidth = 4; 

	
	for(i=2; i<480; i=i+60)
	{		
		context.moveTo(i,0);
		context.lineTo(i,360);
	}
	//Esto es para dibujar la última linea que no se dibuja con el for
	context.moveTo(478,0);
	context.lineTo(478,360);

	for(i=2; i<360; i=i+60)
	{		
		context.moveTo(0,i);
		context.lineTo(480,i);
	}
	//Esto es para dibujar la última linea que no se dibuja con el for
	context.moveTo(0,358);
	context.lineTo(480,358);

	context.stroke();
}

function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('img').src = e.target.result;
                document.getElementById('click2').style.display= "none";
                document.getElementById('imagen').style.display= "none";
								rellenarPiezas();
            }
            reader.readAsDataURL(input.files[0]);
            inicializarPiezasPuzzle();
        }
}
function rellenarPiezas()
{
	numPieza = new Array();
	var imagenSource = document.getElementById('img').src;

	var cv = document.getElementById("canvas");
	var context = cv.getContext('2d');

	var imagen = new Image();
	imagen.src = imagenSource;
	context.drawImage(imagen,0,0,480,360);

	

	var section = document.getElementById('piezas');
	section.innerHTML="";
	var h2 = document.createElement("h2");
	h2.setAttribute("id", "piezasp");
	h2.innerHTML="Piezas del puzzle";
	section.appendChild(h2);
	for(i=0; i<8; i++)
	{
		for(j=0; j<6; j++)
		{
			var canvasAux = document.createElement("canvas");
				canvasAux.setAttribute('width',"60");
				canvasAux.setAttribute('height',"60");
				canvasAux.setAttribute("onClick","marcarPieza(this)");
				canvasAux.setAttribute("id","piezaCanvas"+i);
				canvasAux.setAttribute("ondragstart","marcarPieza(this)");
				canvasAux.setAttribute("draggable","true");
				numPieza.push(canvasAux);

			var contextAux = canvasAux.getContext('2d');
		
			var parteImagen = context.getImageData(i*60,j*60,60,60);
			contextAux.putImageData(parteImagen,0,0);			
		}
	}

	desordenarArray(numPieza);
	for(var i=0;i<48;i++){
		section.appendChild(numPieza[i]); 
	}
	context.clearRect(0,0,480,360);
	dibujaCuadricula();

}

function desordenarArray(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function marcarPieza(pieza){

	for(var i=0;i<48;i++){
		if(pieza==numPieza[i]){
			if(piezaSeleccionada == i){
				piezaSeleccionada =-1; //deja de seleccionar
			}
			else {
				piezaSeleccionada = i; //selecciona
			}
		}
		else{
			numPieza[i].classList.remove("bordeRojo"); //quita borde a todas
		}
	}		
	pieza.classList.toggle('bordeRojo');
}
function colocarClick(event){


	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext('2d');
	var rect = canvas.getBoundingClientRect();
	var x =event.clientX - rect.left;
	var y = event.clientY - rect.top;

	
	var fila = Math.trunc(y/60);
	var col = Math.trunc(x/60);

if(piezaSeleccionada!=-1){
		var dentro =false;
		var pieza2 =-1;
		var k =0;
		var r =0;
		var pieza = numPieza[piezaSeleccionada];
		if(piezasPuzzle[col][fila]!=-1)	{
			pieza2 = piezasPuzzle[col][fila];
		}
		for(var i =0; i<piezasPuzzle.length;i++){
			for(var j =0; j<piezasPuzzle[0].length;j++){
				if(pieza == piezasPuzzle[i][j] && piezasPuzzle[i][j]!=-1){
					k=i;
					r=j;
					if(pieza2==-1){
						var iaux = ctx.createImageData(60,60);
						ctx.putImageData(iaux,i*60,j*60);
						piezasPuzzle[col][fila]= piezasPuzzle[i][j];
						piezasPuzzle[i][j]=-1;
					}
					dibujaCuadricula();
					dentro =true;
				}
			}
		}
	if(piezasPuzzle[col][fila]==-1 || dentro){
		if(dentro){
			ctx.putImageData(numPieza[piezaSeleccionada].getContext('2d').getImageData(0,0,60,60),col*60,fila*60);
			if(pieza2!=-1){
				ctx.putImageData(pieza2.getContext('2d').getImageData(0,0,60,60),k*60,r*60);
				piezasPuzzle[col][fila] = pieza;
				piezasPuzzle[k][r] = pieza2;
				dibujaCuadricula();
			}
			piezasPuzzle[col][fila] = pieza;
		}
		else{
			ctx.putImageData(numPieza[piezaSeleccionada].getContext('2d').getImageData(0,0,60,60),col*60,fila*60);
			numPieza[piezaSeleccionada].parentNode.removeChild(numPieza[piezaSeleccionada]);
			piezasPuzzle[col][fila]=numPieza[piezaSeleccionada];
			canvas.appendChild(piezasPuzzle[col][fila]);
		}
		piezaSeleccionada=-1;
		movs++;
		document.getElementById("movs").innerHTML =movs;
		dibujaCuadricula();
	}
	else {
		document.getElementById("centrar").style.pointerEvents = "none";
		document.getElementById("ocupado").style.pointerEvents = "auto";
			if(document.documentElement.clientWidth<1020)
			document.getElementById("ocupado").style.left ="150px";
		else
			document.getElementById("ocupado").style.left ="400px";
	}
}
else {	
		if(piezasPuzzle[col][fila]!=-1){
			marcarPieza(piezasPuzzle[col][fila]);
			var marcada = piezasPuzzle[col][fila].getContext('2d');
			ctx.lineWidth = 2; 
			ctx.strokeStyle = "red";
			ctx.strokeRect(col*60+1, fila*60+1, 60, 60);
		}
	}
}
function dragOver(ev) {
    ev.preventDefault();
}
function ocupado(){
		document.getElementById("ocupado").style.left ="-1500px";
		document.getElementById("centrar").style.pointerEvents = "auto";

}


function comprobar() {
    if(typeof(Worker) !== "undefined") {
        if(typeof(w) == "undefined") {
            w = new Worker("webworker.js");
        }
        w.onmessage = function(piezasPuzzle) {
            document.getElementById("result").innerHTML = event.data;
        };
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Workers...";
    }
}

function stopWorker() { 
    w.terminate();
    w = undefined;
}