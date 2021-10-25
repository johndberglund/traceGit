var img;
var boxSize = 9;
var sized=1;
var xOffset=0;
var yOffset=0;
var w;
var h;
var posi;
var posi1=0;
var ptMap1;
var oldPoint;
var pointList = [];
var curPoly = [];
var polyList = [];
var myTiling;
var myImage;
var baseX = 10;
var baseY = 10;
var Ax = 300;
var Ay = 0;
var Bx = 0;
var By = 300;
var mode = 0;

function init() {
  sized=1;
  xOffset=0;
  yOffset=0;
  pointList = [];
  curPoly = [];
  polyList = [];
  mode = 0;
  var c = document.getElementById("myCanvas");
  var context = c.getContext("2d");
  c.height = window.innerHeight-135;
  c.width = window.innerWidth-195;
  context.rect(0,0,c.width,c.height);
  context.fillStyle = "white";
  context.fill();
  var d = document.getElementById("canvasDiv");
  d.style.maxHeight= window.innerHeight-110 + "px";
  d.style.height = window.innerHeight-110 + "px";
  d.style.maxWidth= window.innerWidth-170 + "px";
  draw();
}


function resize() {
  var d = document.getElementById("canvasDiv");
  d.style.maxHeight= window.innerHeight-110 + "px";
  d.style.height = window.innerHeight-110 + "px";
  d.style.maxWidth= window.innerWidth-170 + "px";
  if (img) { draw(); }
  else {
  var c = document.getElementById("myCanvas");
  var context = c.getContext("2d");
  c.height = (window.innerHeight-135)*sized;
  c.width = (window.innerWidth-195)*sized;
  draw(); }
}


function getMode() {
var getMode = document.querySelector('input[name="mode"]:checked');   
if(getMode != null) {   
          alert("Selected radio button values is: " + getMode.value);  
  }
}

function goLeft() {
//  if (xOffset < w-10) {xOffset += 10;}
xOffset += 10;
  draw();
}

function goRight() {
//  if (xOffset >= 10) {xOffset -= 10;}
xOffset -= 10;
  draw();
}

function goUp() {
//  if (yOffset < h-10) {yOffset += 10;}
yOffset += 10;
  draw();
}

function goDown() {
//  if (yOffset>=10) {yOffset -= 10;}
yOffset -= 10;
  draw();
}

function goGrow() {
  sized *= 2;
  var c = document.getElementById("myCanvas");
  var context = c.getContext("2d");
  c.height = (window.innerHeight-135)*sized;
  c.width = (window.innerWidth-195)*sized;
  draw();
}

function goShrink() {
  sized /= 2;
  var c = document.getElementById("myCanvas");
  var context = c.getContext("2d");
  c.height = (window.innerHeight-135)*sized;
  c.width = (window.innerWidth-195)*sized;
  draw();
}

function goDraw() {
  mode = 0;
// draw();
}

function goErase() {
  mode = 1;
  curPoly = [];
 // draw();
}

function goMove() {
  mode = 2;
// draw();
}

function txtToFile(content, filename, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], {type: "text/plain", endings: "native"});
  
  a.href= URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
};

function goSave() {
  asOutput = "vectors:\r\n";
  asOutput = asOutput.concat(""+Ax+","+Ay+"\r\n");
  asOutput = asOutput.concat(""+Bx+","+By+"\r\n");
  asOutput = asOutput.concat("points:"+"\r\n");
  pointList.forEach(function(point) {
    asOutput = asOutput.concat(""+point[0]+","+point[1]+"\r\n");
  });
  polyList.forEach(function(poly) {
    asOutput = asOutput.concat("poly:"+"\r\n");
    poly.forEach(function(ptMap) {
      asOutput = asOutput.concat(""+ptMap[0]+","+ptMap[1][0]+","+ptMap[1][1]+"\r\n");
    });
  });
  asOutput = asOutput.concat("end"+"\r\n");
  txtToFile(asOutput,"myTiles","txt");
}

function svgToFile(content, filename, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], {type: "image/svg+xml", endings: "native"});
  
  a.href= URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
};

function goSvg() {
  var asOutput = '<svg height="500" width="600">\r\n';
  polyList.forEach(function(poly) {
    asOutput = asOutput.concat('<polygon points="\r\n'); 
    poly.forEach(function(ptMap) {
      var sPoint = "" + (pointList[ptMap[0]][0]+ptMap[1][0]*Ax+ptMap[1][1]*Bx) 
                 + "," + (pointList[ptMap[0]][1]+ptMap[1][0]*Ay+ptMap[1][1]*By);
      asOutput = asOutput.concat(sPoint,"\r\n");
    });
    asOutput = asOutput.concat('" style="fill:white;stroke:black;stroke-width:1" />\r\n'); 
  });

  asOutput = asOutput.concat('</svg>');
  svgToFile(asOutput,"myTiles","svg");
}

// find point close to current point, or -1 if none.
function findPoint(point) {
  for (pt = 0;pt<pointList.length;pt++) {
    for (i = -1;i<2;i++) {
      for (j = -1; j<2;j++) {
        if (Math.abs(point[0]-(pointList[pt][0]+i*Ax+j*Bx))<=boxSize/sized 
         && Math.abs(point[1]-(pointList[pt][1]+i*Ay+j*By))<=boxSize/sized)
          {return [pt,[i,j]];}
      }
    }
  }
  return([-1]);
}

function mouseMoved(event) {
  var c = document.getElementById("myCanvas");
  var cRect = c.getBoundingClientRect();        
  var canvasX = Math.round(event.clientX - cRect.left);  
  var canvasY = Math.round(event.clientY - cRect.top);
  posi = [canvasX/sized+xOffset,canvasY/sized+yOffset];

//move points
  if (posi1 != 0 && mode===2) {
    posi = [canvasX/sized+xOffset,canvasY/sized+yOffset];
    pointList[ptMap1[0]]=[oldPoint[0]-posi1[0]+posi[0],
                          oldPoint[1]-posi1[1]+posi[1]];
    draw();
  }
//move vectors
  if (posi1 != 0 && mode>2) {
    posi = [canvasX/sized+xOffset,canvasY/sized+yOffset];
    if (mode ===3) {
      baseX = oldPoint[0]-posi1[0]+posi[0];
      baseY = oldPoint[1]-posi1[1]+posi[1];
    }
    if (mode ===4) {
      Ax = oldPoint[0]-posi1[0]+posi[0]-baseX;
      Ay = oldPoint[1]-posi1[1]+posi[1]-baseY;

    }
    if (mode ===5) {
      Bx = oldPoint[0]-posi1[0]+posi[0]-baseX;
      By = oldPoint[1]-posi1[1]+posi[1]-baseY;

    }
    draw();
  }
}

function mouseClicked(event) {

  var c = document.getElementById("myCanvas");
  var cRect = c.getBoundingClientRect();        
  var canvasX = Math.round(event.clientX - cRect.left);  
  var canvasY = Math.round(event.clientY - cRect.top);
  posi = [canvasX/sized+xOffset,canvasY/sized+yOffset];
  var ptMap= findPoint(posi);
  if (mode ===0) {drawPoint(ptMap);}
  if (mode ===1) {erasePoint(ptMap);}

  draw();
}

function mousePressed(event) {
  if (posi1 === 0 && mode===2) {
    var c = document.getElementById("myCanvas");
    var cRect = c.getBoundingClientRect();        
    var canvasX = Math.round(event.clientX - cRect.left);  
    var canvasY = Math.round(event.clientY - cRect.top);
    posi1 = [canvasX/sized+xOffset,canvasY/sized+yOffset];
    ptMap1= findPoint(posi1);
    if (ptMap1[0]<0) { 
      mode = onVector();
      if (mode===2) {posi1=0;}
    }
    else { oldPoint = pointList[ptMap1[0]]; }
  }
}

function mouseReleased(event) {
  if (posi1 != 0 && mode===2) {
    posi1 = 0;
  }
  if (posi1 != 0 && mode>2) {
    mode=2;
    posi1 = 0;
  }
  draw();
}


function onVector() {
  var onVec = 2;
  if (Math.abs(posi1[0]-baseX)<=boxSize/sized 
         && Math.abs(posi1[1]-baseY)<=boxSize/sized )
          {onVec = 3; oldPoint = posi1;};
  if (Math.abs(posi1[0]-baseX-Ax)<=boxSize/sized 
         && Math.abs(posi1[1]-baseY-Ay)<=boxSize/sized )
          {onVec = 4;oldPoint = posi1;};
  if (Math.abs(posi1[0]-baseX-Bx)<=boxSize/sized 
         && Math.abs(posi1[1]-baseY-By)<=boxSize/sized )
          {onVec = 5;oldPoint = posi1;};
  return(onVec);
}

function erasePoint(ptMap) {
  if (ptMap[0]>=0) {
// remove point
    var pointless = ptMap[0];
    var newPointList = [];
    for (i=0;i<pointless;i++) {
      newPointList[i]=pointList[i];
     }
    for (i=pointless+1;i<pointList.length;i++) {
      newPointList[i-1]=pointList[i];
    }
   pointList = newPointList;

// remove polys that had that point
    var newPolyList = [];
    polyList.forEach(function(poly) {
      var keepPoly = 1;
      poly.forEach(function(ptMap) {
        if (ptMap[0] === pointless) {keepPoly = 0;}
        if (ptMap[0] > pointless) {ptMap[0]--;}
      });
      if (keepPoly === 1) {newPolyList.push(poly)}
    });
    polyList = newPolyList;
  }
}

function drawPoint(ptMap) {
//add new point
  if (ptMap[0]<0) { 
    ptMap= [pointList.length,[0,0]]; 
    pointList.push(posi);
  }
//if we return to polygon starting point
  if (JSON.stringify(ptMap) === JSON.stringify(curPoly[0])) {
    polyList.push(curPoly);
    curPoly = [];
    }
//add point to current polygon
  else {
    curPoly.push(ptMap); 
    }
}

function loadMyTiling() {

  var c = document.getElementById("myCanvas");
  var context = c.getContext("2d");

  const file = document.getElementById("loadTiling").files[0];
  const reader = new FileReader();

  reader.addEventListener("load", function () {
    var lines = reader.result.split(/\r\n|\n/);
    init();
    var curLen = lines.length-1;
    var setPoly = 0;
    for (i = 1;i<curLen;i++) {
      if (lines[i] === "points:") { setPoly = 1; continue;}
      if (lines[i] === "poly:") { setPoly = 2; curPoly = []; continue;}
      if (lines[i] === "end") { draw(); break;}
      var coords = lines[i].split(",");
      if (i===1) {Ax = coords[0],Ay=coords[1]}
      if (i===2) {Bx = coords[0],By=coords[1]}
      if (setPoly === 1) {pointList.push([parseFloat(coords[0]),parseFloat(coords[1])]);}   
      if (setPoly === 2) {
        curPoly.push( [parseInt(coords[0]),[parseInt(coords[1]),parseInt(coords[2])]] );
        if (lines[i+1] === "poly:") {polyList.push(curPoly);curPoly = [];};
        if (lines[i+1] === "end") {polyList.push(curPoly);curPoly = [];};
      }
    }
  },false);

  if (file) {
    reader.readAsText(file);
  }
} // end loadMyTiling()


function loadMyImage() {
  init();
  var c = document.getElementById("myCanvas");
  var context = c.getContext("2d");

  img = new Image();
  const file = document.getElementById("loadImage").files[0];
  const reader = new FileReader();
  init();

  reader.addEventListener("load", function () {
    img.onload = function() {
      img_width = img.width;
      img_height = img.height;
      context.canvas.width = img.width+100;
      context.canvas.height = img.height+100;
      context.drawImage(img, 50, 50);
      draw();
    };
    img.src = reader.result;
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }
}


function draw() {
  var c = document.getElementById("myCanvas");
  var context = c.getContext("2d");
  context.rect(0,0,c.width,c.height);
  context.fillStyle = "white";
  context.fill();
  var cRect = c.getBoundingClientRect();        
  var canvasX = Math.round(event.clientX - cRect.left);  
  var canvasY = Math.round(event.clientY - cRect.top);

// draw image
  if (img) {
    w=img.width;
    h=img.height;
    var minX = -xOffset*sized;
    var minY = -yOffset*sized;
//    context.drawImage(img,minX,minY,w*sized,h*sized);
context.scale(sized,sized);
      context.drawImage(img, 50, 50);
context.scale(1/sized,1/sized);
  }


// draw vectors
  context.lineWidth = 2;
  context.strokeStyle ="blue";
  var oldX = (baseX-xOffset)*sized-boxSize;
  var oldY = (baseY-yOffset)*sized-boxSize;
  context.rect(oldX,oldY,boxSize*2+1,boxSize*2+1);
  context.stroke();
  context.rect(oldX+Ax*sized,oldY+Ay*sized,boxSize*2+1,boxSize*2+1);
  context.stroke();
  context.rect(oldX+Bx*sized,oldY+By*sized,boxSize*2+1,boxSize*2+1);
  context.stroke();
  
  context.beginPath();
  context.moveTo(oldX+boxSize+Ax*sized,oldY+boxSize+Ay*sized);
  context.lineTo(oldX+boxSize,oldY+boxSize);
  context.stroke();
  context.lineTo(oldX+boxSize+Bx*sized,oldY+boxSize+By*sized);
  context.stroke();

// draw points
  context.lineWidth = 2;
  context.strokeStyle ="red";
  pointList.forEach(function(point) {
    var oldX = (point[0]-xOffset)*sized-boxSize;
    var oldY = (point[1]-yOffset)*sized-boxSize;
    for (i = -1;i<2;i++) {
      for (j = -1; j<2;j++) {
        context.beginPath();
        context.strokeStyle ="rgb(255,90,90)";
        if (i===0 && j===0) {context.strokeStyle ="red";}
        context.rect(oldX+i*Ax*sized+j*Bx*sized,oldY+i*Ay*sized+j*By*sized,boxSize*2+1,boxSize*2+1);
        context.stroke();
        context.closePath();
      }
    }
  });


// draw polygons
  context.lineWidth = 1;
  context.strokeStyle ="red";
  context.fillStyle = "rgba(175,0,240,0.5)";
  polyList.forEach(function(poly) {
    for (i=-1;i<2;i++) {
      for (j=-1;j<2;j++) {
        context.beginPath();
        context.strokeStyle ="rgb(255,50,50)";
        context.fillStyle = "rgba(175,0,240,0.4)";
        if (i===0 && j===0) {
          context.strokeStyle ="rgb(255,0,0)";
          context.fillStyle = "rgba(175,0,240,0.7)";
        }
        var ptMap1 = poly[0];
        context.moveTo(
         (pointList[ptMap1[0]][0]+(ptMap1[1][0]+i)*Ax+(ptMap1[1][1]+j)*Bx-xOffset)*sized,
         (pointList[ptMap1[0]][1]+(ptMap1[1][0]+i)*Ay+(ptMap1[1][1]+j)*By-yOffset)*sized
        );
        poly.forEach(function(ptMap) {
          context.lineTo(
           (pointList[ptMap[0]][0]+(ptMap[1][0]+i)*Ax+(ptMap[1][1]+j)*Bx-xOffset)*sized,
           (pointList[ptMap[0]][1]+(ptMap[1][0]+i)*Ay+(ptMap[1][1]+j)*By-yOffset)*sized
          );	
        });
        context.closePath();
        context.fill();
        context.stroke();
      }
    }
  });

// draw lines of current polygon
// I don't know why this section really wants to be last...
  context.beginPath();
  context.strokeStyle ="red";
  context.lineWidth = 3;
  for (pt = 1;pt<=curPoly.length;pt++)  {

    context.moveTo(
      (pointList[curPoly[pt-1][0]][0]+curPoly[pt-1][1][0]*Ax+
		curPoly[pt-1][1][1]*Bx-xOffset)*sized,
      (pointList[curPoly[pt-1][0]][1]+curPoly[pt-1][1][0]*Ay+
		curPoly[pt-1][1][1]*By-yOffset)*sized);
    context.lineTo(
      (pointList[curPoly[pt][0]][0]+curPoly[pt][1][0]*Ax+
		curPoly[pt][1][1]*Bx-xOffset)*sized,
      (pointList[curPoly[pt][0]][1]+curPoly[pt][1][0]*Ay+
		curPoly[pt][1][1]*By-yOffset)*sized);
    context.stroke();
  };
}
