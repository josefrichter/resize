var fileinput = document.getElementById('fileinput');

var max_width = fileinput.getAttribute('data-maxwidth');
var max_height = fileinput.getAttribute('data-maxheight');

var preview = document.getElementById('preview');

var canvas = document.getElementById('canvas');
var form = document.getElementById('form');

function processfile(file) {

    // read the files
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = function (event) {
      // blob stuff
      var blob = new Blob([event.target.result]); // create blob...
      var blobURL = window.webkitURL.createObjectURL(blob); // and get it's URL
      //var blobURL = window.webkitURL.createObjectURL(blob) || window.URL.createObjectURL(blob);
      
      // helper Image object
      var image = new Image();
      image.src = blobURL;
      //preview.appendChild(image); // preview commented out, I am using the canvas instead
      image.onload = function() {
        // have to wait till it's loaded
        resized = resizeMe(image); // send it to canvas
        var newinput = document.createElement("input");
        newinput.type = 'hidden'
        newinput.name = 'images[]'
        newinput.value = resized; // put result from canvas into new hidden input
        form.appendChild(newinput);
      }
    };
}

function readfiles(files) {
    for (var i = 0; i < files.length; i++) {
      processfile(files[i]); // process each file at once
    }
    fileinput.value = ""; //remove the original files from fileinput
    // TODO remove the previous hidden inputs if user selects other files
}

// this is where it starts. event triggered when user selects files
fileinput.onchange = function(){
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