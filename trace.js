var img;
var boxSize = 7;
var sized=1;
var xOffset=0;
var yOffset=0;
var w;
var h;
var posi;
var posi1=0;
var ptMap1;
var ptMap2 = -1;
var oldPoint;
var pointList = [];
var fixedList = [];
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
//  if (xOffset < w-50) {xOffset += 50;}
xOffset += 50;
  draw();
}

function goRight() {
//  if (xOffset >= 50) {xOffset -= 50;}
xOffset -= 50;
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
  sized *= 1.2;
  var c = document.getElementById("myCanvas");
  var context = c.getContext("2d");
  c.height = (window.innerHeight-135)*sized;
  c.width = (window.innerWidth-195)*sized;
  draw();
}

function goShrink() {
  sized /= 1.2;
  var c = document.getElementById("myCanvas");
  var context = c.getContext("2d");
  c.height = (window.innerHeight-135)*sized;
  c.width = (window.innerWidth-195)*sized;
  draw();
}

function goDraw() {
  mode = 0;
}

function goErase() {
  mode = 1;
  curPoly = [];
}

function goLock() {
alert("We can't yet lock points");
//  mode = 2;
}

function goExplode() {
alert("We can't yet explode points.");
//  mode = 3;
}

function goMove() {
  mode = 4;
}


function goReg() {
  makeRegular();
  draw();
}

function mapPt(rawPt, mapping) {
  var X = rawPt[0]+mapping[0]*Ax + mapping[1]*Bx;
  var Y = rawPt[1]+mapping[0]*Ay + mapping[1]*By;
  return  [X,Y] ;
}

function invMapPt(rawPt, mapping) {
  var X = rawPt[0]-mapping[0]*Ax - mapping[1]*Bx;
  var Y = rawPt[1]-mapping[0]*Ay - mapping[1]*By;
  return  [X,Y] ;
}

function avePts(ptList) {
  var xSum=0;
  var ySum=0;
  ptList.forEach(function(pt) {
    xSum+= pt[0];
    ySum+= pt[1];
  });
  xSum /= ptList.length;
  ySum /= ptList.length;
  return [xSum, ySum];
}

// input polygon and center, average the polar coordinates to find best fit regular polygon, 
// output vote where to move pointList, (have the polygon given clockwise.)
function avePolar(polyRawPolar,centPt) {
  var rNew = 0;
  var tBase = 0;
  var vertNum = 0;
  var numVert = polyRawPolar.length;
  var startT = polyRawPolar[0][3][1];
  var lastT = 0;
  polyRawPolar.forEach(function(ptMapRawPolar) {
    ptMapRawPolar[3][1] -= startT;
    if (ptMapRawPolar[3][1] < lastT) {
      ptMapRawPolar[3][1] += 2*Math.PI;
    };
   });
  polyRawPolar.forEach(function(ptMapRawPolar) {
    rNew += ptMapRawPolar[3][0];
    var addBaseT = ptMapRawPolar[3][1] - vertNum*2*Math.PI/numVert;
    addBaseT %= (2*Math.PI);
    addBaseT += (2*Math.PI);
    addBaseT %= (2*Math.PI);
    if (addBaseT>Math.PI) {addBaseT -= (2*Math.PI)};
    tBase += addBaseT;
    vertNum += 1;
  });
  tBase /= numVert;
  tBase += startT;
  rNew /= numVert;
  var PtVoteList = [];
  var maxDist = Number.MAX_VALUE;
  var bestCount = 0;
  for (counter = -2;counter<3;counter++) {
    var sumDist = 0;
    vertNum = 0;
    polyRawPolar.forEach(function(ptMapRawPolar) {
      var tNew = tBase + (vertNum+counter)*2*Math.PI/numVert;
      var newX = centPt[0] + rNew*Math.cos(tNew);
      var newY = centPt[1] + rNew*Math.sin(tNew);
      var thisDist = Math.sqrt((newX-ptMapRawPolar[2][0])**2+(newY-ptMapRawPolar[2][1])**2);
      sumDist += thisDist;
      vertNum += 1;
    });
    if (sumDist<maxDist) {maxDist = sumDist; bestCount=counter;};
  } // end counter
  vertNum = 0;
  polyRawPolar.forEach(function(ptMapRawPolar) {
    var tNew = tBase + (vertNum+bestCount)*2*Math.PI/numVert;
    var newX = centPt[0] + rNew*Math.cos(tNew);
    var newY = centPt[1] + rNew*Math.sin(tNew);
    var newPt = invMapPt([newX,newY], ptMapRawPolar[1]);
    PtVoteList.push([ptMapRawPolar[0],newPt]);
    vertNum += 1;
  });
  return (PtVoteList);
} // end avePolar

function rect2Polar(rect) {
  var x = rect[0];
  var y = rect[1];
  var radius = Math.sqrt(x*x+y*y);
  var theta;
  if (x === 0) {
    if (y < 0) { theta = 3*Math.PI/2; }
      else { theta = Math.PI/2;}
    } 
    else { theta = Math.atan(y/x);}
  if (x < 0) {theta += Math.PI;}
  if (theta < 0) {theta +=2*Math.PI;}
  return [radius, theta];
}

function addPolar(polyRaw, centPt) {
  var polyRawPolar = [];
  polyRaw.forEach(function(ptMapRaw) {
    var vecX = ptMapRaw[2][0]-centPt[0];
    var vecY = ptMapRaw[2][1]-centPt[1];
    var vecPolar = rect2Polar([vecX, vecY]);
    polyRawPolar.push([ptMapRaw[0],ptMapRaw[1],ptMapRaw[2],vecPolar]);
  });
  return polyRawPolar;
}

function polyRaw2Cent(polyRaw) {
  var rawPtList = [];
  polyRaw.forEach(function(ptMapRaw) {
    rawPtList.push(ptMapRaw[2]);
  });
  var centPt = avePts(rawPtList);
  return centPt ;
}

function polyAddRaw(poly) {
  var polyRaw = [];
  poly.forEach(function(ptMap) {
    var rawPt = mapPt(pointList[ptMap[0]],ptMap[1]);
    polyRaw.push([ptMap[0],ptMap[1],rawPt]);
  });
  return polyRaw;
}

// this will try to make the polygons regular
function makeRegular() {
  var PtVoteList = [];
  polyList.forEach(function(poly) {
    var polyRaw = polyAddRaw(poly);
    var centPt = polyRaw2Cent(polyRaw);
    var polyRawPolar = addPolar(polyRaw, centPt);
    // sort by descending angle so all polygons have same orientation
 //   polyRawPolar.sort((A,B)=> B[3][1]-A[3][1]);
    PtVoteList = PtVoteList.concat(avePolar(polyRawPolar,centPt));

  });

  // sort point list by index
  PtVoteList.sort((A,B) => A[0]-B[0]);
  var curPt = 0;
  var votesByPt = [];
  var avePtVote=[];
  // average all votes for where to move the point
  PtVoteList.forEach(function(ptVote) {
    if (curPt === ptVote[0]) {votesByPt.push(ptVote[1]);}
    else { 
      avePtVote.push([curPt,avePts(votesByPt)]);
      curPt = ptVote[0];
      votesByPt = [ptVote[1]];
      };
  });
  avePtVote.push([curPt,avePts(votesByPt)]);
  // don't move any fixed points - currently none.
//  var fixedPts = [];
//  for (counter = 0;counter<pointList.length;counter++) {
//    if (pointList[counter][0]===0) {fixedPts[counter]=[counter,pointList[counter]] }
//  }; 
  for (i = 0;i<avePtVote.length;i++) {
    pointList[avePtVote[i][0]] = avePtVote[i][1];
  }
  // fixedPts.forEach(function(fixedPt) {pointList[fixedPt[0]]=fixedPt[1];});

} // end makeRegular

// compose two mappings. First map1() then map2()
function composeMaps(map1, map2) {
  return([map1[0]+map2[0],map1[1]+map2[1]]);
}

// returns the inverse of a mapping.
function invMap(map) {
  return([-map[0],-map[1]]);
}

// merges two points when you drag one atop the other.
function mergePts() {
  let oldPt = ptMap1[0];
  let oldMap = ptMap1[1];
  let newPt = ptMap2[0];
  let newMap = ptMap2[1];
  let jointMap = composeMaps(invMap(oldMap),newMap);
//alert([ptMap1,ptMap2]);
//alert(JSON.stringify(polyList));
//alert(oldPt);
  polyList.forEach(function(myPoly) {
    myPoly.forEach(function(myPtMap) {
      if (myPtMap[0] === oldPt) {
//alert(myPtMap);
        myPtMap[0]=newPt;
        myPtMap[1]=composeMaps(jointMap,myPtMap[1]);
//alert(["*",myPtMap]);
      }

    });
  });

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
  let newPt = newCoords(point,[Ax,Ay],[Bx,By]);
  let i = Math.round(newPt[0]);
  let j = Math.round(newPt[1]);
  newPt[0] = point[0]-i*Ax-j*Bx;
  newPt[1] = point[1]-i*Ay-j*By;
  for (pt = 0;pt<pointList.length;pt++) {
    let newPt2 = newCoords(pointList[pt],[Ax,Ay],[Bx,By]);
    let i2 = Math.round(newPt2[0]);
    let j2 = Math.round(newPt2[1]);
    newPt2[0] = pointList[pt][0]-i2*Ax-j2*Bx;
    newPt2[1] = pointList[pt][1]-i2*Ay-j2*By;
    if (Math.abs(newPt[0]-newPt2[0])<=boxSize/sized 
      && Math.abs(newPt[1]-newPt2[1])<=boxSize/sized)
    {return [pt,[i-i2,j-j2]];}
  }
  return([-1]);
}

// find point close to current point, or -1 if none. BUT exclude point ptMap1
function findNewPoint(point) {
  let newPt = newCoords(point,[Ax,Ay],[Bx,By]);
  let i = Math.round(newPt[0]);
  let j = Math.round(newPt[1]);
  newPt[0] = point[0]-i*Ax-j*Bx;
  newPt[1] = point[1]-i*Ay-j*By;
  for (pt = 0;pt<pointList.length;pt++) {
    if (pt != ptMap1[0]) {
      let newPt2 = newCoords(pointList[pt],[Ax,Ay],[Bx,By]);
      let i2 = Math.round(newPt2[0]);
      let j2 = Math.round(newPt2[1]);
      newPt2[0] = pointList[pt][0]-i2*Ax-j2*Bx;
      newPt2[1] = pointList[pt][1]-i2*Ay-j2*By;
      if (Math.abs(newPt[0]-newPt2[0])<=boxSize/sized 
        && Math.abs(newPt[1]-newPt2[1])<=boxSize/sized)
      {return [pt,[i-i2,j-j2]];}
    }
  }
  return([-1]);
}


// return point in (vect1,vect2) coord. system
function newCoords(point,vect1,vect2) {
  let denom = vect1[0]*vect2[1]-vect1[1]*vect2[0];
  let newX = point[0]*vect2[1]-point[1]*vect2[0];
  let newY = vect1[0]*point[1]-vect1[1]*point[0];
  return([newX/denom,newY/denom]);
}

function mouseMoved(event) {
  var c = document.getElementById("myCanvas");
  var cRect = c.getBoundingClientRect();        
  var canvasX = Math.round(event.clientX - cRect.left);  
  var canvasY = Math.round(event.clientY - cRect.top);
  posi = [canvasX/sized+xOffset,canvasY/sized+yOffset];

//move points
  if (posi1 != 0 && mode===4) {
//    posi = [canvasX/sized+xOffset,canvasY/sized+yOffset];
    ptMap2 = findNewPoint(posi);
    pointList[ptMap1[0]]=[oldPoint[0]-posi1[0]+posi[0],
                          oldPoint[1]-posi1[1]+posi[1]];
    draw();
  }
//move vectors
  if (posi1 != 0 && mode>4) {
//    posi = [canvasX/sized+xOffset,canvasY/sized+yOffset];
    if (mode ===5) {
      baseX = oldPoint[0]-posi1[0]+posi[0];
      baseY = oldPoint[1]-posi1[1]+posi[1];
    }
    if (mode ===6) {
      Ax = oldPoint[0]-posi1[0]+posi[0]-baseX;
      Ay = oldPoint[1]-posi1[1]+posi[1]-baseY;
    }
    if (mode ===7) {
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
  if (posi1 === 0 && mode===4) {
    var c = document.getElementById("myCanvas");
    var cRect = c.getBoundingClientRect();        
    var canvasX = Math.round(event.clientX - cRect.left);  
    var canvasY = Math.round(event.clientY - cRect.top);
    posi1 = [canvasX/sized+xOffset,canvasY/sized+yOffset];
    ptMap1= findPoint(posi1);
    if (ptMap1[0]<0) { 
      mode = onVector();
      if (mode===4) {posi1=0;}
    }
    else { oldPoint = pointList[ptMap1[0]]; }
  }
}

function mouseReleased(event) {
  if (ptMap2 != -1) {
//    alert([ptMap1, ptMap2]);
    mergePts();
  }
  if (posi1 != 0 && mode===4) {
    posi1 = 0;
  }
  if (posi1 != 0 && mode>4) {
    mode=4;
    posi1 = 0;
  }
  draw();
}

function onVector() {
  var onVec = 4;
  if (Math.abs(posi1[0]-baseX)<=boxSize/sized 
         && Math.abs(posi1[1]-baseY)<=boxSize/sized )
          {onVec = 5; oldPoint = posi1;};
  if (Math.abs(posi1[0]-baseX-Ax)<=boxSize/sized 
         && Math.abs(posi1[1]-baseY-Ay)<=boxSize/sized )
          {onVec = 6;oldPoint = posi1;};
  if (Math.abs(posi1[0]-baseX-Bx)<=boxSize/sized 
         && Math.abs(posi1[1]-baseY-By)<=boxSize/sized )
          {onVec = 7;oldPoint = posi1;};
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
  context.strokeStyle ="green";
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


//I want this to outline if we move a point to overlap another.
//this doesn't work. We have moved points so is always true.
  if (ptMap2 != -1) { // we overlap a point
    var otherPt = pointList[ptMap2[0]];
    var oldX = (otherPt[0]-xOffset)*sized-boxSize-1;
    var oldY = (otherPt[1]-yOffset)*sized-boxSize-1;
    var i = ptMap2[1][0];
    var j = ptMap2[1][1];
    context.beginPath();
    context.strokeStyle ="blue";
    context.rect(oldX+i*Ax*sized+j*Bx*sized-1,oldY+i*Ay*sized+j*By*sized-1,boxSize*2+3,boxSize*2+3);
    context.stroke();
    context.closePath();
  }


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
