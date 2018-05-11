//---------------------------------------------------------------------------------------------------------------------
//                                            INICIALIZAR CANVAS
//---------------------------------------------------------------------------------------------------------------------
var canvas=getFirst('canvas');
var ctx=canvas.getContext("2d");
var bg;
setBg();
document.addEventListener("mousemove", mouseMove, false);
document.addEventListener("mousedown", mouseDown, false);
document.addEventListener("mouseup", mouseUp, false);
document.addEventListener("keypress", keyPressed, false);
document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);

window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || 
  window.webkitRequestAnimationFrame || 
  window.mozRequestAnimationFrame || 
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();
var keys= new Array();

//---------------------------------------------------------------------------------------------------------------------
//                                               FUNCIONES GENERALES
//---------------------------------------------------------------------------------------------------------------------

CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
  ctx.save();
  ctx.beginPath();
  // draw top and top right corner
  ctx.moveTo(x+radius,y);
  ctx.arcTo(x+width,y,x+width,y+radius,radius);

  // draw right side and bottom right corner
  ctx.arcTo(x+width,y+height,x+width-radius,y+height,radius); 

  // draw bottom and bottom left corner
  ctx.arcTo(x,y+height,x,y+height-radius,radius);

  // draw left and top left corner
  ctx.arcTo(x,y,x+radius,y,radius);
  ctx.restore();
}

CanvasRenderingContext2D.prototype.drawTintedImage = function (img,x,y,width,height,color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(x,y,width,height);
  ctx.globalCompositeOperation="destination-atop";
  ctx.drawImage(img,x,y,width,height);
  ctx.restore();
}

function randomColor(){
  var c="rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")";
  return c;
}

function setBg(){
  bg=ctx.getImageData(0,0,canvas.width,canvas.height);
}

function clear(){
  ctx.putImageData(bg,0,0);
}
function keyDown(event){
  var key=String.fromCharCode(event.keyCode).toLowerCase();
  if(keys.indexOf(key)==-1)keys.unshift(key);
}
function keyPressed(event){

}
function keyUp(event){
  var key=String.fromCharCode(event.keyCode).toLowerCase();
  keys.splice(keys.indexOf(key),1);
}
function mouseMove(event){
  var evento= event || window.event;
  mouseX=evento.clientX;
  mouseY=evento.clientY;
}
function mouseDown(event){
}
function mouseUp(event){

}

//------------------------------------------------------------------------------
//                                               FUNCIONES
//------------------------------------------------------------------------------

function cuadricula(){
	ctx.beginPath();
	for (var i = 0; i <= 640 ; i+=60) {
		ctx.moveTo(i,0);
		ctx.lineTo(i,480);
	};
  for (var j = 0; j<= 480 ; j+=60){
		ctx.moveTo(0,j);
		ctx.lineTo(640,j);
	};
	ctx.lineWidth = 4;
	ctx.strokeStyle = "rgba(1,0,0,1)";
  ctx.stroke();
}

function getContainers(){
	var containers;
	var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
	if(w<900)
		containers = [6,6,36];
	else if(w<1200)
		containers = [17,17,14];
	else
		containers = [24,24,0];
	return containers;
}
// Cosillas de las piezas

function clickPiece(e){		
	if(activePiece != -1)
		pieces[activePiece].classList.toggle('active');
	e.currentTarget.classList.toggle('active');
	activePiece = e.currentTarget.dataset.index;
	console.log(activePiece);
}

function dragPiece(e){
	if(activePiece != -1)
		pieces[activePiece].classList.toggle('active');

	e.currentTarget.classList.toggle('active');
	activePiece = e.currentTarget.dataset.index;
	console.log(activePiece);

	// Hay que ver qué datos le envío
	var data=(this.firstChild)?this:this.parentNode;
	e.dataTransfer.setData('text', data.dataset.index);

	e.dataTransfer.effectAllowed = 'copyMove';

	var img=e.currentTarget.firstChild.cloneNode(true);
	img.style.transform='';
	img.style.WebkitTransform='';
	e.dataTransfer.setDragImage(img, img.width/2,img.height/2);
}

function buildImgElems(array){
	var piece, elems = [];
	var rotation, x, y, div_aux, div = '<div></div>'.toDOM();
	for (var i = array.length - 1; i >= 0; i--) {
		div_aux = div.cloneNode();
		piece = new Image();
		piece.src = array[i];
    div_aux.classList.add('hide');

		div_aux.onclick = clickPiece;
		div_aux.ondragstart = dragPiece;
		div_aux.dataset.index=array.length-i-1;

		div_aux.appendChild(piece);
		elems.push(div_aux);
	};
	return elems;
}

function show(divs,transform){
  var time; 
  for (var i = divs.length - 1; i >= 0; i--) {
    time = random(0,500);
    setTimeout(function(i,time) { return function() { 
    	divs[i].classList.remove('hide'); 
    	if(transform)
    		randomize(divs[i]);
  	}; }(i,time), time);
  };
}

function randomize(image){
	var rotation = random(-15,15);
	var x = random(-5,5);
	var y = random(-5,5);
	image.style.webkitTransform = "rotate("+rotation+"deg) translate("+x+"px,"+y+"px)";
}

function placeImages(array,transform){
	var cont = getContainers();
	var fragment = document.createDocumentFragment();

	if(containers)
		containers.length=0;
	containers=emptyMatrix(3,0);
	var c_aux;
	for (var i = array.length - 1; i >= 0; i--) {
		c_aux=i%3;
		while(containers[c_aux].length >= cont[c_aux])
			c_aux = (c_aux+1)%3;

		switch(c_aux)
		{
			case 0:
				array[i].dataset.container=0;
				containers[0].push(array[i]);
			break;
			
			case 1:
				array[i].dataset.container=1;
				containers[1].push(array[i]);
			break;

			case 2:
				array[i].dataset.container=2;
				containers[2].push(array[i]);
			break;
		}
	};

	console.log("Pongo las piezas : ");
	console.log(cont);
	console.log(containers);

	for (var i = containers[0].length - 1; i >= 0; i--) {
		fragment.appendChild(containers[0][i]);
	}
	get('.piezas')[0].appendChild(fragment);
	fragment.innerHTML = '';

	for (var i = containers[1].length - 1; i >= 0; i--) {
		fragment.appendChild(containers[1][i]);
	}
	get('.piezas')[1].appendChild(fragment);
	fragment.innerHTML='';

	for (var i = containers[2].length - 1; i >= 0; i--) {
		fragment.appendChild(containers[2][i]);
	}

	getFirst('.piezas2').appendChild(fragment);
  show(array,transform);
}

function getRemainingPieces(){
	var array=[];
	for (var i = containers.length - 1; i >= 0; i--) {
		for (var j = containers[i].length - 1; j >= 0; j--) {
			array.push(containers[i][j]);
		};
	};
	return array;
}

function loadImage(file){
	var data = cutImage(file, 6, 8, 60,60);
	var elems = buildImgElems(data);

	var img_preview = getFirst("input[type='file'] + div + img");
	img_preview.src=getUrlData(file);

	message({
		data: ('¿Usar '+file.dataset.name+'?'),
		showClose:false,
		showAccept:true,
		showCancel:true,
		callback:function(confirm){
			img_preview.onunload.apply(img_preview);
			if(confirm === true)
			{
				if(pieces)
				{
					get('.piezas')[0].innerHTML = '';
					get('.piezas')[1].innerHTML = '';
					getFirst('.piezas2').innerHTML = '';
				}

				pieces = elems;
				
				placedPieces.length=0;
				placedPieces=emptyMatrix(6,8);

				img = file;
				placeImages(pieces,true);
			}
			else
			{
				if(!img)
				{
					img = null;				
					var fileInput = getFirst("input[type='file']");
					var div_fakefile = getFirst("input[type='file'] + div");
					div_fakefile.style.opacity = '';
					div_fakefile.style.display = '';
					fileInput.disabled = false;
					fileInput.style.display = '';
					getFirst("input[type='file'] + div span").style.webkitAnimationPlayState = "running";
				}
			}
		}
	});
}

function cutImage(img,r,c,w,h)
{
  var array = [];
  for(var x = 0; x < c; ++x) {
    for(var y = 0; y < r; ++y) {
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var context = canvas.getContext('2d');
      context.drawImage(img, x * w, y * h, w, h, 0, 0, canvas.width, canvas.height);
      array.push(canvas.toDataURL());
	  }
	}
	shuffle(array);
	return array;
}

var img = null, activePiece = -1;
var pieces = null;
var containers = null;
var placedPieces=emptyMatrix(6,8);
var movements = 0;
