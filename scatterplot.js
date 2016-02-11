'use strict';

var x;
var y;
var xAxis;
var yAxis;
var lowRank;
var highRank;
var fastestTime;
var slowestTime;
var xScaleStart;
var xScaleEnd;

var margin = {
	top: 10,
	right: 100,
	bottom: 50,
	left: 100
};

var width = 800 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var formatTime = d3.time.format("%M:%S");

var dataSourceUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';


function timeFun(data) {
	fastestTime = formatTime.parse(data[0]['Time']);
	slowestTime = formatTime.parse(data[data.length - 1]['Time']);
	xScaleStart = slowestTime - fastestTime + 15000;
	var xScaleStartMin = Math.floor(xScaleStart / 60000);
	var xScaleStartSec = (xScaleStart / 1000) % 60;
	xScaleStart = String(xScaleStartMin) + ':' + String(xScaleStartSec);
	xScaleStart = formatTime.parse(xScaleStart);
	xScaleEnd = formatTime.parse("00:00");
}


function timeDiff(d) {
	var diff = formatTime.parse(d.Time) - fastestTime;
	var min = Math.floor(diff / 60000);
	var sec = (diff / 1000) % 60;
	var minSec = String(min) + ':' + String(sec);
	return formatTime.parse(minSec);
}


function doping(d) {
	if (d.Doping.length === 0) {
		return "green";
	} else {
		return "red";
	}
}


function xyAxis(data) {
	lowRank = data[data.length - 1]["Place"];
	highRank = 1;
	x = d3.time.scale().range([0, width]);
	y = d3.scale.linear().range([height, 0]);
	x.domain([xScaleStart, xScaleEnd]);
	y.domain([lowRank + 3, highRank]);
	xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(4).tickFormat(d3.time.format("%M:%S"));
	yAxis = d3.svg.axis().scale(y).orient('left').ticks(7);
}


function buildPlot(data) {

	timeFun(data);

	xyAxis(data);

	var svg = d3.select("body")
		.append("svg").attr({
			width: width + margin.left + margin.right,
			height: height + margin.top + margin.bottom
		})
		.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	svg.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr({
			cx: function(d) {
				return x(timeDiff(d));
			},
			cy: function(d) {
				return y(d.Place);
			},
			r: 3,
			fill: function(d) {
				return doping(d)
			}
		});

    svg.selectAll("text")
	  .data(data)
	  .enter()
	  .append("text")
	  .text(function(d){ return d.Name})
	  .attr({   
	    x: function(d){ return x(timeDiff(d)) + 10;},
	    y: function(d){ return y(d.Place);},
	    "font-size": "10px",
	    "font-family": "sans-serif",
	    "fill": "black",
	    "text-anchor": "start"
	  });


	svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + height + ')')
		.call(xAxis);

	svg.append('g')
		.attr('class', 'y axis')
		.call(yAxis);

	svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left/2)
        .attr("x", -height/3)
        .style("text-anchor", "end")
        .text("Ranking");

    svg.append("text")
        .attr("y", height + margin.bottom)
        .attr("x", margin.left + width/4)
        .text("Minutes Behind Fastest Time");
}


d3.json(dataSourceUrl, function(error, data) {
	if (error) {
		console.log(error);
	} else {
		buildPlot(data);
	}
});