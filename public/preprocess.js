// ==== gamma correction ====

var gamma        = 2.2;
var gamma_invert = 1 / gamma;

function imgOrCanvasToLinear(img)
{
    var inputImg, inputCtx, scaledCanvas;
    if (!(img instanceof HTMLCanvasElement)){
        inputImg = document.createElement('canvas');
        inputImg.width = img.width;
        inputImg.height = img.height;
        inputCtx = inputImg.getContext('2d');
        inputCtx.drawImage( img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
    }
    else{
        inputImg = img;
        inputCtx = inputImg.getContext('2d');
    }
    var inPixels = inputCtx.getImageData(0, 0, inputImg.width, inputImg.height).data;
    // convert it to linear         
    var len = img.height*img.width*4;
    var linearInPixel = {};//new Float32Array(len),
    var gamma        = 2.2

    for (var pix = 0; pix < len; pix++)
    {
        linearInPixel[pix] = Math.pow(inPixels[pix], gamma);
    }
    return { data: linearInPixel, width: img.width, height: img.height, length : len};      
}

function linearToImgCanvas(imgOutPut)
{
    outputCanvas = document.createElement('canvas');
    outputCanvas.width = imgOutPut.width;
    outputCanvas.height = imgOutPut.height;
    var outputCtx = outputCanvas.getContext('2d');
    var outputPixels = outputCtx.getImageData( 0, 0, imgOutPut.width, imgOutPut.height );
    var outputPixelsData = outputPixels.data;

    for( var pix = 0; pix < imgOutPut.length; pix++ ) 
    {
        outputPixels.data[pix] = Math.pow(imgOutPut.data[pix], gamma_invert);
    }
    outputCtx.putImageData( outputPixels, 0, 0 );

    return outputCanvas;
}

// ==== gamma correction ====



// ==== Lanczos resizing ====

//returns a function that calculates lanczos weight
function lanczosCreate(kernel){
  return function(x){
	if (x > kernel) 
	  return 0;
	x *= Math.PI;
	if (Math.abs(x) < 1e-16) 
	  return 1
	var xx = x / kernel;
	return Math.sin(x) * Math.sin(xx) / x / xx;
  }
}

function lancosCompute(linearImg, scale, kernel)
{
	
	var w = ~~(linearImg.width*scale) + 1, h = ~~(linearImg.height*scale) + 1;
	var linearOutput =  { data: {}, width: w, height: h, length : w*h*4};	
	var lanczos = lanczosCreate(kernel);//lanczos3 if kernel === 3
	
	var rcp_ratio = 2 / scale;
	var range2 = Math.ceil(scale * kernel / 2);
	var cacheLanc = {};
	var center = {};
	var icenter = {};
	
	
	var process= function(self, u){
		center.x = (u + 0.5) * scale;
		icenter.x = Math.floor(center.x);
		for (var v = 0; v < linearOutput.height; v++) {
			center.y = (v + 0.5) * scale;
			icenter.y = Math.floor(center.y);
			var a, r, g, b;
			a = r = g = b = 0;
			for (var i = icenter.x - range2; i <= icenter.x + range2; i++) {
				if (i < 0 || i >= src.width) 
					continue;
				var f_x = Math.floor(1000 * Math.abs(i - center.x));
				if (!cacheLanc[f_x]) 
					cacheLanc[f_x] = {};
				for (var j = icenter.y - range2; j <= icenter.y + range2; j++) {
					if (j < 0 || j >= src.height) 
						continue;
					var f_y = Math.floor(1000 * Math.abs(j - center.y));
					if (cacheLanc[f_x][f_y] == undefined) 
						cacheLanc[f_x][f_y] = lanczos(Math.sqrt(Math.pow(f_x * rcp_ratio, 2) + Math.pow(f_y * rcp_ratio, 2)) / 1000);
					weight = cacheLanc[f_x][f_y];
					if (weight > 0) {
						var idx = (j * src.width + i) * 4;
						a += weight;
						r += weight * src.data[idx];
						g += weight * src.data[idx + 1];
						b += weight * src.data[idx + 2];
					}
				}
			}
			var idx = (v * linearOutput.width + u) * 3;
			linearOutput.data[idx] = r / a;
			linearOutput.data[idx + 1] = g / a;
			linearOutput.data[idx + 2] = b / a;
		}

		if (++u < linearOutput.width) 
			process1(u);
		return;
	}
	
	process(0);
	return linearOutput;
}
//elem: canvas element, img: image element, sx: scaled width, lobes: kernel radius
function thumbnailer(elem, img, sx, lobes){     
    return linearToImgCanvas(lancosCompute(linearImg,  max_width / img.width, lobes));
}


// ==== Lanczos resizing ====



var fileinput = document.getElementById('fileinput');

var max_width = fileinput.getAttribute('data-maxwidth');
var max_height = fileinput.getAttribute('data-maxheight');

var preview = document.getElementById('preview');

var canvas = document.getElementById('canvas');
var form = document.getElementById('form');

function processfile(file) {
  
    if( !( /image/i ).test( file.type ) )
        {
            alert( "File "+ file.name +" is not an image." );
            return false;
        }

    // read the files
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = function (event) {
      // blob stuff
      var blob = new Blob([event.target.result]); // create blob...
      window.URL = window.URL || window.webkitURL;
      var blobURL = window.URL.createObjectURL(blob); // and get it's URL
      
      // helper Image object
      var image = new Image();
      image.src = blobURL;
      
      //preview.appendChild(image); // preview commented out, I am using the canvas instead
      image.onload = function() {
        // have to wait till it's loaded
        //resized = resizeMe(image); // send it to canvas
            
  
        var canvas = thumbnailer(image, max_width, 3);

        var resized = canvas.toDataURL("image/jpeg",1.0);
        preview.appendChild(canvas);
        
        var newinput = document.createElement("input");
        newinput.type = 'hidden'
        newinput.name = 'images[]'
        newinput.value = resized; // put result from canvas into new hidden input
        form.appendChild(newinput);
      }
    };
}

function readfiles(files) {
  
    // remove the existing canvases and hidden inputs if user re-selects new pics
    var existinginputs = document.getElementsByName('images[]');
    var existingcanvases = document.getElementsByTagName('canvas');
    while (existinginputs.length > 0) { // it's a live list so removing the first element each time
      // DOMNode.prototype.remove = function() {this.parentNode.removeChild(this);}
      form.removeChild(existinginputs[0]);
      preview.removeChild(existingcanvases[0]);
    } 
  
    for (var i = 0; i < files.length; i++) {
      processfile(files[i]); // process each file at once
    }
    fileinput.value = ""; //remove the original files from fileinput
    // TODO remove the previous hidden inputs if user selects other files
}

// this is where it starts. event triggered when user selects files
fileinput.onchange = function(){
  if ( !( window.File && window.FileReader && window.FileList && window.Blob ) ) {
    alert('The File APIs are not fully supported in this browser.');
    return false;
    }
  readfiles(fileinput.files);
}

// === RESIZE ====

function resizeMe(img) {
  
  var canvas = document.createElement('canvas');

  var width = img.width;
  var height = img.height;

  // calculate the width and height, constraining the proportions
  if (width > height) {
    if (width > max_width) {
      //height *= max_width / width;
      height = Math.round(height *= max_width / width);
      width = max_width;
    }
  } else {
    if (height > max_height) {
      //width *= max_height / height;
      width = Math.round(width *= max_height / height);
      height = max_height;
    }
  }
  
  // resize the canvas and draw the image data into it
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  
  preview.appendChild(canvas); // do the actual resized preview
  
  return canvas.toDataURL("image/jpeg",0.7); // get the data from canvas as 70% JPG (can be also PNG, etc.)

}