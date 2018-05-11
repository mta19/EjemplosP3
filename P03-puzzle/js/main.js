var DOMINIO='http://localhost/HP2Alberto/Juego/';

//---------------------------------------------------------------------------------------------------------------------
//                                                  CORE DE LA PRACTICA
//---------------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------------------------------
//                                                     PROTOTIPOS Y ABREVIACIONES
//---------------------------------------------------------------------------------------------------------------------

function getPos(el) {
	for (var lx=0, ly=0;
		el != null;
		lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
	return {x: lx,y: ly};
}

function random(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function sleep( sleepDuration ){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ } 
}

function shuffle(array) {
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

function emptyMatrix(w,h){
	var a = [], b;
	var i, j;
	for (i = 0; i < w; i++) {
	  for (j = 0, b = []; j < h; j++) {
	    b.push(null);
	  }
	  a.push(b);
	}
	return a;
}

String.prototype.toDOM = function()
{
	var div = document.createElement('div');
	div.innerHTML = this;
	var elements = div.childNodes;
	return ((elements.length!=1)?elements:elements[0]);
};

function get(query, container){
	var nodes, cont;
	cont = container || document;
	nodes = cont.querySelectorAll(query);
	return nodes;
}

function getFirst(query, container){
	var nodes, cont;
	cont = container || document;
	nodes = cont.querySelector(query);
	return nodes;
}
//---------------------------------------------------------------------------------------------------------------------
//                                                        ESTILO
//---------------------------------------------------------------------------------------------------------------------

function message(obj){
	/*
	var last_messages = get('.message');
	for (var i = last_messages.length - 1; i >= 0; i--) {
		closeMessage(last_messages[i]);
	};*/
	//var message = ("<div class='message'><p>"+data+"</p><span class='cerrar' >x</span><button>Aceptar</button><button>Cancelar</button></div>").toDOM();
	var message = ("<div class='message'><p>"+obj.data+"</p></div>").toDOM();
	var accept_button = null, cancel_button = null, close_button = null;
	
	if(! (obj.hasOwnProperty('showClose') && obj.showClose === false))
	{
		close_button = "<span class='cerrar' >x</span>".toDOM();
		close_button.onclick = function(e){
			if(obj.hasOwnProperty('callback') && typeof obj.callback === 'function')
				obj.callback();

			closeMesssageListener(e);
		}
		message.appendChild(close_button);
	}

	if(obj.hasOwnProperty('showAccept') && obj.showAccept === true)
	{
		accept_button = ('<button>' + (obj.acceptText || 'Aceptar') + '</button>').toDOM();
		accept_button.onclick = function(e){
			if(obj.hasOwnProperty('callback') && typeof obj.callback === 'function')
				obj.callback(true);

			closeMesssageListener(e);
		}
		message.appendChild(accept_button);
	}

	if(obj.hasOwnProperty('showCancel') && obj.showCancel === true)
	{
		cancel_button = ('<button>' + (obj.acceptText || 'Cancelar') + '</button>').toDOM();
		cancel_button.onclick = function(e){
			if(obj.hasOwnProperty('callback') && typeof obj.callback === 'function')
				obj.callback(false);

			closeMesssageListener(e);
		}
		message.appendChild(cancel_button);
	}

	document.body.appendChild(message);
	setTimeout(function(){
		message.style.top = (obj.hasOwnProperty('top'))?obj.top:'';
		message.style.left = (obj.hasOwnProperty('left'))?obj.left: '';
		message.style.opacity = '1';
	},100);

}

function closeMessage(msg){
	msg.style.width = "0px";
	msg.style.height = "0px";
	setTimeout(function(){
		if(msg.parentNode)
			msg.parentNode.removeChild(msg);
	},500);
}

function closeMesssageListener(e){
	var elem = e.currentTarget.parentNode;
	closeMessage(elem);
}

//---------------------------------------------------------------------------------------------------------------------
//                                                        FILES	
//---------------------------------------------------------------------------------------------------------------------
function getExtension(filename) {
  var parts = filename.split('.');
  return parts[parts.length - 1];
}
function isImage(file) {
  var ext = getExtension(file.name);
  switch (ext.toLowerCase()) {
    case 'jpg':
    case 'gif':
    case 'bmp':
    case 'png':
        //etc
      return true;
  }
    return false;
}

function getUrlData(image)
{
	var canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  var context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  return canvas.toDataURL();
}
function getImagePixels(img,width,height){
	var pixels = [];
	var canvas = document.createElement('canvas');
  canvas.width = width || img.width;
  canvas.height = height || img.height;
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0, canvas.width, canvas.height);

  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;

  // iterate over all pixels
  for(var i = 0, n = data.length; i < n; i += 4) {
    var red = data[i];
    var green = data[i + 1];
    var blue = data[i + 2];
    var alpha = data[i + 3];

    pixels.push({
    	red:red,
    	green:green,
    	blue:blue,
    	alpha:alpha,
    	x:Math.floor(i/4)%canvas.width,
    	y:Math.floor(Math.floor(i/4)/canvas.width)
    });
  }
  return pixels;
}

function pixelCompare(p1,p2)
{
	var equal = true;
	if(p1.red !== p2.red || p1.green !== p2.green || p1.blue !== p2.blue)
		equal = false;

	if(p1.alpha !== p2.alpha)
		equal = false;

	return equal;
}
//---------------------------------------------------------------------------------------------------------------------
//                                                        AJAX
//---------------------------------------------------------------------------------------------------------------------

/**
* Crea un objeto fromData a partir de un objeto
* @param  {object} object objeto a parsear
* @return {FormData}       objeto formData
*/
function formDataObject(object){
	var formData=new FormData();
	for (var pro in object){
		if (object.hasOwnProperty(pro)){
			formData.append(pro,object[pro]);
		}
	}
	return formData;
}

/**
* Construye la url (a partir de la interrogacion, sin incluirla) necesaria
* para enviar una peticion GET a partir de un objeto
* @param  {object} object objeto a parsear
* @return {string}        url construida
*/
function urlObject(object){
	var url='';
	for (var pro in object){
		if (object.hasOwnProperty(pro)){
			url+=pro+'='+encodeURIComponent(object[pro])+'&';
		}
	}
// Quitamos el & que sobra
url=url.slice(0, - 1);
return url;
}

/**
* Construye la url necesaria para enviar un formulario por GET
* @param  {DOM form} form formulario
* @return {string}        url construida
*/
function urlForm(form){
	var i, j, len, jLen, formElement, q = [];

	function addNameValue(name, value) {
		q.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
	}

	if (!form || !form.nodeName || form.nodeName.toLowerCase() !== 'form'){
		throw 'You must supply a form element';
	}
	for (i = 0, len = form.elements.length; i < len; i++){
		formElement = form.elements[i];
		if (formElement.name === '' || formElement.disabled) {
			continue;
		}
		switch (formElement.nodeName.toLowerCase()) {
			case 'input':
			switch (formElement.type) {
				case 'text':
				case 'hidden':
				case 'password':
				case 'button':
				case 'submit':
				addNameValue(formElement.name, formElement.value);
				break;
				case 'checkbox':
				case 'radio':
				if (formElement.checked) {
					addNameValue(formElement.name, formElement.value);
				}
				break;
				case 'reset':
				break;
			}
			break;
			case 'textarea':
			addNameValue(formElement.name, formElement.value);
			break;
			case 'select':
			switch (formElement.type) {
				case 'select-one':
				addNameValue(formElement.name, formElement.value);
				break;
				case 'select-multiple':
				for (j = 0, jLen = formElement.options.length; j < jLen; j++) {
					if (formElement.options[j].selected) {
						addNameValue(formElement.name, formElement.options[j].value);
					}
				}
				break;
			}
			break;
			case 'button':
			switch (formElement.type) {
				case 'reset':
				case 'submit':
				case 'button':
				addNameValue(formElement.name, formElement.value);
				break;
			}
			break;
		}
	}
	return q.join('&');
}

/**
* Crea un objeto ajax y lo devuelve
* @return {Ajax object} El objeto ajax
*/
function createAjax(){
	var xmlhttp;
	if(window.XMLHttpRequest) { // Objeto nativo
		xmlhttp = new XMLHttpRequest(); // Se obtiene el nuevo objeto
	} else if (window.ActiveXObject) { // IE(Windows): objecto ActiveX
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	return xmlhttp;
}

/**
* Clase Ajax para el manejo de las peticiones Ajax
* @param {string} url    url contra la que se realiza la petición
* @param {string} method método a utilizar
* @param {boolean} async  ¿Es asíncrona?
* @param {function} fun(data)    funcion a ejecutar cuando la peticion ha terminado
*/
function Ajax(url,method,async,fun){
	this.url=url;
	this.method=method;
	this.async=async;
	this.success=fun||null;
	this.ajax=createAjax();
	this.html='';
}

Ajax.prototype.setHtml = function(src){
	this.html = src;
};
/**
* Envia datos a la peticion creada
* @param  {string/object} data id del formulario u objeto con los datos a enviar
*/
Ajax.prototype.send = function(data) {
	var url_aux,form,formData;
	var main_ajax=this;
	var php_response=null;
	url_aux=this.url;
	if (typeof data !== 'undefined')
	{
		if (typeof data === 'string')
		{
			form=document.getElementById(data);
			if(this.method==="POST")
				formData = new FormData(form);

			else if(this.method==="GET")
				url_aux+='?'+urlForm(form);
		}
		else if (typeof data === 'object')
		{
			if(this.method==="POST")
				formData=formDataObject(data)

			else if(this.method==="GET")
				url_aux+='?'+urlObject(data);
		}
	}
	if(this.async===true && this.success!==null)
	{
		var main_ajax=this;// that = objeto de la clase Ajax
		this.ajax.onreadystatechange=function()
		{
			if(this.readyState==4 && this.status==200)
			{
				php_response=this.responseText;
				if(main_ajax.html!=='')
				{
					var html_ajax = new Ajax(main_ajax.html, "GET", true, function()
					{
						main_ajax.success(php_response, html_ajax.ajax.responseText);
					});
					html_ajax.send();
				}
				else
				{
					main_ajax.success(php_response);
				}
			}
		}
	}
	this.ajax.open(this.method,url_aux,this.async);
	this.ajax.send(formData);
	if(this.async===false)
	{
		return this.ajax.responseText;
	}
};

//---------------------------------------------------------------------------------------------------------------------
//                                                       WEB STORAGE
//---------------------------------------------------------------------------------------------------------------------

/**
* Obtiene una variable del localStorage
* @param  {string} name nombre de la variable
* @return {string/null}      valor de la cookie / null si no hay
*/
function getLocal(name){
	var value=localStorage.getItem(name) || null;
	return value;
}

/**
* Da valor a una variable del localStorage
* @param {string} name  nombre de la variable
* @param {string} value valor de la variable
*/
function saveLocal(name,value){
	localStorage.setItem(name,value);
}

/**
* Elimina una variable del localStorage
* @param {string} name  nombre de la variable
*/
function removeLocal(name){
	localStorage.removeItem(name);
}

/**
* Obtiene una variable del session Storage
* @param  {string} name nombre de la variable
* @return {string/null}      valor de la variable / null si no hay
*/
function getSession(name){
	var value=sessionStorage.getItem(name) || null;
	return value;
}

/**
* Da valor a una variable del localStorage
* @param {string} name  nombre de la variable
* @param {string} value valor de la variable
*/
function saveSession(name,value){
	sessionStorage.setItem(name,value);
}

/**
* Elimina una variable del localStorage
* @param {string} name  nombre de la variable
*/
function removeSession(name){
	sessionStorage.removeItem(name);
}

//---------------------------------------------------------------------------------------------------------------------
//                                                        COOKIES
//---------------------------------------------------------------------------------------------------------------------

/**
* Pone una cookie
* @param {string} c_name     coockie name
* @param {string} value      contenido de la coocki
* @param {int} expiredays dias que tarda en expirar
*/
function setCookie(c_name, value, expiredays){
	var exdate = new Date(); 
	exdate.setDate(exdate.getDate() + expiredays); 
	document.cookie = c_name + "=" + escape(value) + ((expiredays === null) ? "" : ";expires="+ exdate.toGMTString());
}

/**
* Obtiene el valor de una coockie
* @param  {string} c_name nombre de la cookie
* @return {string}        el valor de la cookie
*/
function getCookie(c_name){ 
	if(document.cookie.length > 0) {
		var c_start, c_end;
		c_start = document.cookie.indexOf(c_name + "=");
		if(c_start != -1) {
			c_start = c_start + c_name.length + 1;
			c_end = document.cookie.indexOf(";", c_start);
			if(c_end == -1) c_end = document.cookie.length; 
			return unescape(document.cookie.substring(c_start, c_end));
		} 
	}
	return "";
}