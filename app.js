/**
 * Floodfill - Linear Floodfill with tolerance in plain Javascript.
 * 
 * Autor: Markus Ritberger
 * Version: 1.0.1 (2012-04-16)
 *      
 * Examples at: http://demos.ritberger.at/floodfill
 * 
 * licensed under MIT license:
 * 
 * Copyright (c) 2012 Markus Ritberger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to 
 * deal in the Software without restriction, including without limitation the 
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
 * sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
 * THE SOFTWARE.
 **/

function floodfill_hexToR(h) {
    return parseInt((floodfill_cutHex(h)).substring(0,2),16)
}
function floodfill_hexToG(h) {
    return parseInt((floodfill_cutHex(h)).substring(2,4),16)
}
function floodfill_hexToB(h) {
    return parseInt((floodfill_cutHex(h)).substring(4,6),16)
}
function floodfill_cutHex(h) {
    return (h.charAt(0)=="#") ? h.substring(1,7):h
}

function floodfill_matchTolerance(pixelPos,color,tolerance){
    var rMax = startR + (startR * (tolerance / 100));
    var gMax = startG + (startG * (tolerance / 100));
    var bMax = startB + (startB * (tolerance / 100));

    var rMin = startR - (startR * (tolerance / 100));
    var gMin = startG - (startG * (tolerance / 100));
    var bMin = startB - (startB * (tolerance / 100));
    
    var r = imageData.data[pixelPos];	
    var g = imageData.data[pixelPos+1];	
    var b = imageData.data[pixelPos+2];
  
    return ((
        (r >= rMin && r <= rMax) 
        && (g >= gMin && g <= gMax) 
        && (b >= bMin && b <= bMax)
        )
        && !(r == floodfill_hexToR(color) 
        && g == floodfill_hexToG(color) 
        && b == floodfill_hexToB(color))
        );
}

function floodfill_colorPixel(pixelPos,color){
  imageData.data[pixelPos] = floodfill_hexToR(color);
  imageData.data[pixelPos+1] = floodfill_hexToG(color);
  imageData.data[pixelPos+2] = floodfill_hexToB(color);
  imageData.data[pixelPos+3] = 255;
}

function floodFill(x,y,context,color,tolerance){
   pixelStack = [[x,y]];
   width = context.canvas.width;
   height = context.canvas.height;
   pixelPos = (y*width + x) * 4;
   imageData = context.getImageData(0, 0, width, height);
   startR = imageData.data[pixelPos];
   startG = imageData.data[pixelPos+1];
   startB = imageData.data[pixelPos+2];
   while(pixelStack.length){
      newPos = pixelStack.pop();
      x = newPos[0];
      y = newPos[1];
      pixelPos = (y*width + x) * 4;
      while(y-- >= 0 && floodfill_matchTolerance(pixelPos,color,tolerance)){
        pixelPos -= width * 4;
      }
      pixelPos += width * 4;
      ++y;
      reachLeft = false;
      reachRight = false;
      while(y++ < height-1 && floodfill_matchTolerance(pixelPos,color,tolerance)){
        floodfill_colorPixel(pixelPos,color);
        if(x > 0){
          if(floodfill_matchTolerance(pixelPos - 4,color,tolerance)) {
            if(!reachLeft){
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          }
          else if(reachLeft){
            reachLeft = false;
          }
        }
        if(x < width-1){
          if(floodfill_matchTolerance(pixelPos + 4,color,tolerance)){
            if(!reachRight){
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          }
          else if(floodfill_matchTolerance(pixelPos + 4 -(width *4),color,tolerance)) {
            if(!reachLeft){
              pixelStack.push([x + 1, y - 1]);
              reachLeft = true;
            }
          }
          else if(reachRight){
            reachRight = false;
          }
        }
        pixelPos += width * 4;
      }
    }
    context.putImageData(imageData, 0, 0);
}



var Avatar = { width: null, height: null, canvas: null, context: null };

Avatar.init = function () {
	var image = new Image();
	image.onload = function () {
		Avatar.canvas = document.createElement('canvas');
		Avatar.canvas.setAttribute('width', this.width);
		Avatar.width = this.width;
		Avatar.canvas.setAttribute('height', this.height);
		Avatar.height = this.height;
		document.getElementsByTagName('body')[0].appendChild(Avatar.canvas);
		Avatar.context = Avatar.canvas.getContext("2d");
		Avatar.context.drawImage(image, 0, 0, this.width, this.height);
  

    Avatar.cannyEdgeDetection();
  
		Avatar.registerEvents();
  };
	image.src = "images/iy.jpg";
};

Avatar.registerEvents = function() {
	$(Avatar.canvas).click(function(e) {
		Avatar.fill(e.offsetX, e.offsetY)
	});
};

Avatar.threshold = function(threshold) {
	var imageData = Avatar.context.getImageData(0, 0, Avatar.width, Avatar.height),
			d = imageData.data;

	for (var i=0; i<d.length; i+=4) {
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
		d[i] = d[i+1] = d[i+2] = v;
	}

	Avatar.context.putImageData(imageData, 0, 0);
};

Avatar.cannyEdgeDetection = function() {
	var img_u8 = new jsfeat.matrix_t(Avatar.width, Avatar.height, jsfeat.U8_t | jsfeat.C1_t);

	var imageData = Avatar.context.getImageData(0, 0, Avatar.width, Avatar.height);
  jsfeat.imgproc.grayscale(imageData.data, img_u8.data);

  var r = 2;
  var kernel_size = (r+1) << 1;

  jsfeat.imgproc.gaussian_blur(img_u8, img_u8, kernel_size, 0);
  jsfeat.imgproc.canny(img_u8, img_u8, 20, 60);
 // jsfeat.imgproc.box_blur_gray(img_u8, img_u8, 2);

//  Avatar.threshold(100)

  // render result back to canvas
  var data_u32 = new Uint32Array(imageData.data.buffer);
  var alpha = (0xff << 24);
  var i = img_u8.cols*img_u8.rows, pix = 0;
  while(--i >= 0) {
      pix = img_u8.data[i];
      data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
  }
  
  Avatar.context.putImageData(imageData, 0, 0);
};

Avatar.fill = function(x,y) {
	var colors = ["#e61900", "#ffd200", "#ff81cd", "#5688de"];
	randomColor = colors[Math.floor(Math.random()*colors.length)];
	floodFill(x,y,Avatar.context,randomColor,2)
};