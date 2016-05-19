
require('./app.css');
var d3 = require('d3');
var chroma = require('chroma-js');
var template = require('./main.jade');

var vWidth = 960;
var vHeight = 500;


d3.select('body')
  .append('div')
  .classed('content', true)
  .html(template())


var svg = d3.select('body')
  .append('svg')
   .attr('preserveAspectRatio', 'none')
   .attr('viewBox', '0 0 ' + vWidth + ' ' + vHeight);


// make a standard gaussian variable.
var standardX = gaussian(0.5, 0.15);
var standardY = gaussian(0.5, 0.2);

var padX;
var padY;
var isTouchDevice = 'ontouchstart' in document.documentElement;

var setPadding = function() {
  padX = 0.10;
  padY = 0.3;

  if (window.innerWidth < 975) {
    padY = 0.4;
  }

  if (window.innerWidth < 800 || isTouchDevice) {
    padY = 0.27;
    padX = 0.25;
  }
  if (window.innerHeight < 700) {
    padY = 0.45;
  }
};

setPadding();


var evaluatePoint = function(p) {
  var xBool = p[0] < vWidth / 2 - padX * vWidth;
  xBool = xBool || p[0] > vWidth / 2 + padX * vWidth;

  var yBool = p[1] < vHeight / 2 - padY * vHeight;
  yBool = yBool || p[1] > vHeight / 2 + padY * vHeight;

  return xBool || yBool;
}

var vertices = d3.range(1750).map(function(d) {
 return [standardX() * vWidth, standardY() * vHeight];
}).filter(evaluatePoint);

 var voronoi = d3.geom.voronoi()
     .clipExtent([[0, 0], [vWidth, vHeight]]);


 var path = svg.append("g").selectAll("path");
 var colorScale = chroma.scale(['#0000ff', '#6666ff']);
 // colorScale.colors(5);

function redraw() {

 var data = voronoi(vertices).filter(function(points) {
   return points.every(evaluatePoint);
 });

 path = path
     .data(data, polygon);

 path.exit()
  .transition()
  .duration(1000)
  .delay(350 * Math.random())
  .style('opacity', 0)
  .remove();

 path.enter().append("path")
     .style('fill', function() {
       return colorScale(Math.random());
     })
     .style('opacity', 0)
     .style('stroke', '#fff')

     .style('stroke-width', 0.5)
     .style('stroke-opacity', 0.5)
    //  .style('stroke-dasharray', "6, 4")
    .transition()
    .duration(1000)
    .delay(300 * Math.random())
    .style('opacity', 0.25)
     .attr("d", polygon);

 path.order();
}

function polygon(d) {
 return "M" + d.join("L") + "Z";
}

console.log(voronoi(vertices));
redraw();

setInterval(function() {

  var changeCount = 2;
  var changeRate = 60;
  for (var i = 0; i < changeCount; i++) {
    var idx = Math.floor(Math.random() * vertices.length);
    var vertex = vertices[idx];
    vertices[idx][0] += Math.random() * changeRate * 2 - changeRate;
    vertices[idx][1] += Math.random() * changeRate * 2 - changeRate;
  }
  redraw();
}, 250);


// returns a gaussian random function with the given mean and stdev.
function gaussian(mean, stdev) {
    var y2;
    var use_last = false;
    return function() {
        var y1;
        if(use_last) {
           y1 = y2;
           use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                 x1 = 2.0 * Math.random() - 1.0;
                 x2 = 2.0 * Math.random() - 1.0;
                 w  = x1 * x1 + x2 * x2;
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
       }

       var retval = mean + stdev * y1;
       if(retval > 0)
           return retval;
       return -retval;
   }
}

window.onresize = function() {
  vertices = d3.range(1750).map(function(d) {
   return [standardX() * vWidth, standardY() * vHeight];
  }).filter(evaluatePoint);

  setPadding();

  redraw();
};


// var getRandomElt = function(l) {
//   return l[Math.floor(Math.random()*l.length)];
// }
