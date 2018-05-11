self.onmessage = function(e){
	var data = e.data;
	
	var pixels1 = data.pixels1;
	var pixels2 = data.pixels2;

	self.postMessage({
			result : pixelCompare(pixels1[0],pixels2[0]),
			p1 : pixels1[0],
			p2 : pixels2[0]
	});
	/*
	self.postMessage( {'op':true, 'res': r} );
	self.postMessage( {'op':true, 'res': 'Worker detenido'} );
	self.close();*/
};


function pixelCompare(p1,p2)
{
	var equal = true;
	if(p1.red !== p2.red || p1.green !== p2.green || p1.blue !== p2.blue)
		equal = false;

	if(p1.alpha !== p2.alpha)
		equal = false;

	return equal;
}