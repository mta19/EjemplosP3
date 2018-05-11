self.onmessage = function(e){
    
	var imagenOrig = e.data.imagenOrig;
	var imagenPuzzle = e.data.imagenPuzzle;
	var contMalColocadas = new Array();
	var fila = 0
	var columna = 0;

  	for(var i = 0; i<imagenPuzzle.length; i++){
    	if(imagenOrig[i] != imagenPuzzle[i]){
            
      		fila = i/115200;
      		fila = parseInt(fila);
      		columna = parseInt(i/240)%8;

      		var elemento = (columna*6)+fila;

      		if(contMalColocadas.indexOf(elemento) == -1){
                
      			contMalColocadas.push(elemento);	
      		}
    	}
  	}

  	self.postMessage( {'res': contMalColocadas} );
};