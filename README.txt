12 Sep 2012

Preprocessing (scaling down) images on client side before uploading

Because people often upload 5MB big 3000x2000px PNGs that are then scaled down to 100x100px JPEGs on server - waste of time and bandwidth

1. user selects image(s)
2. script opens the image using FileReader API
3. script appends it to new Image object (not displayed at all actually) 
4. new Image objects is drawn into new Canvas object, that is scaled down to desired dimensions
5. display the canvas, ie. a preview of the image to be uploaded
6. take the pic from canvas as JPEG in dataURI format
7. send it to server
8. save it on server side (not implemented yet)

(c) Josef Richter