
window.log = function(){
	if(this.console){
		console.log( Array.prototype.slice.call(arguments) );
	}
};
var limit = function(func, wait, debounce) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var throttler = function() {
      timeout = null;
      func.apply(context, args);
    };
    if (debounce) clearTimeout(timeout);
    if (debounce || !timeout) timeout = setTimeout(throttler, wait);
  };
};



var astarcanvas = { };

astarcanvas.activeSearch = 0;

astarcanvas.init = function() {
	
	astarcanvas.graph = astarcanvas.getGraph(50, .2);
	
	astarcanvas.startDOM();
	
	log("Intialized");
};

astarcanvas.startDOM = function() {
	var canvas = astarcanvas.canvas = $("#output")[0];
	var ctx = astarcanvas.ctx = astarcanvas.canvas.getContext("2d");
	
	astarcanvas.resize();
	$(window).bind("focus resize", astarcanvas.resize);
	$(canvas).mousemove(limit(astarcanvas.mousemove, 100));
};

astarcanvas.resize = function() {
	var canvas = astarcanvas.canvas;
	$(canvas).removeAttr("width").removeAttr("height");
	canvas.width = Math.floor($(canvas).width());
	canvas.height = Math.floor($(canvas).height());
	astarcanvas.search(0, 0);
};

astarcanvas.search = function(x, y) {

	var searchID = ++astarcanvas.activeSearch;
	var graph = astarcanvas.graph;
	
	
	astarcanvas.activePos = astarcanvas.activePos || { x: 0, y: 0 };
	
	var startX = astarcanvas.activePos.x;
	var startY = astarcanvas.activePos.y;
	var endX = x;
	var endY = y;
	var start = graph.nodes[startX][startY];
	var end = graph.nodes[endX][endY];
	log("doing search", startX, startY, endX, endY, start, end)
	
	var sTime = new Date();
	var result = astar.search(graph.nodes, start, end);
	var fTime = new Date();
	
	astarcanvas.animatePath(result, searchID);
	
	
	log("Searched in" , fTime - sTime);
};


astarcanvas.drawGraph = function() {
	
	var graph = astarcanvas.graph,
		nodes = graph.nodes,
		canvas = astarcanvas.canvas,
		ctx = astarcanvas.ctx;
	
	if (!nodes.length || !nodes[0].length) {
		return;
	}
	
	var ROWS = nodes.length,
		COLS = nodes[0].length,
		HEIGHT = canvas.height = canvas.height,
		WIDTH = canvas.width= canvas.width,
		FILLSTYLE = "white",
		ALTFILLSTYLE = "black",
		ACTIVEFILLSTYLE = "red",
		COLWIDTH = Math.floor(WIDTH / COLS),
		COLHEIGHT = Math.floor(HEIGHT / ROWS);
	
	
	for (var i = 0; i < nodes.length; i++) {
		for (var j = 0; j < nodes[i].length; j++) {
			var node = nodes[i][j];
			//ctx.fillStyle = (i + j) % 2 ? FILLSTYLE : ALTFILLSTYLE;
			ctx.fillStyle = node.type == GraphNodeType.OPEN ? FILLSTYLE : ALTFILLSTYLE;
			if (node.pos.x == astarcanvas.activePos.x && node.pos.y == astarcanvas.activePos.y) {
				ctx.fillStyle = ACTIVEFILLSTYLE;
			}
			ctx.fillRect(COLWIDTH * j, COLHEIGHT * i, COLWIDTH, COLHEIGHT);
			//log(node);
			
		}
	}

};

astarcanvas.animatePath = function(path, searchID) {
	log(path);
	astarcanvas.drawGraph();
	
	var currentStep = 0;
	function animateStep () {
		currentStep++;
		if (searchID == astarcanvas.activeSearch && path.length > currentStep) {
			astarcanvas.activePos = path[currentStep].pos;
			astarcanvas.drawGraph();
			setTimeout(animateStep, 0);
		}
	}
	
	animateStep(0);
};


astarcanvas.translateEventIntoCoords = function(x, y) {
	
	var graph = astarcanvas.graph,
		nodes = graph.nodes,
		canvas = astarcanvas.canvas;
	
	if (!nodes.length || !nodes[0].length) {
		return {x:0, y:0};
	}
	
	var ROWS = nodes.length,
		COLS = nodes[0].length,
		HEIGHT = canvas.height = canvas.height,
		WIDTH = canvas.width = canvas.width,
		COLWIDTH = Math.floor(WIDTH / COLS),
		COLHEIGHT = Math.floor(HEIGHT / ROWS);
	
	var translatedY = Math.max(0, Math.min(COLS - 1, Math.floor(x/COLWIDTH)));
	var translatedX = Math.max(0, Math.min(ROWS - 1, Math.floor(y/COLHEIGHT)));
	
	
	log("calculating", x,y, translatedX, translatedY);
	return {x:translatedX, y: translatedY};
};
astarcanvas.mousemove = function(e) {
	var coords = astarcanvas.translateEventIntoCoords(e.layerX, e.layerY);
	log(coords);
	astarcanvas.search(coords.x, coords.y);
};

astarcanvas.getGraph = function(gridSize, wallFrequency) {

	var css = { wall: 'wall', open: 'open' };
	var nodes = [];
    for(var x=0;x<gridSize;x++) {
        var $row = $("<div class='clear' />");

    	var nodeRow = [];
    	var gridRow = [];

    	for(var y=0;y<gridSize;y++) {
    		var id = "cell_"+x+"_"+y;
    		var $cell = $("<div></div");
    		$cell.attr("id", id).attr("x", x).attr("y", y);
    		$row.append($cell);
    		gridRow.push($cell);

    		var isWall = Math.floor(Math.random()*(1/wallFrequency));
    		if(isWall == 0) {
    			nodeRow.push(GraphNodeType.WALL);
    			$cell.addClass(css.wall);
    		}
    		else  {
    			nodeRow.push(GraphNodeType.OPEN);
    			//if (!startSet) {
    			//	$cell.addClass(css.start);
    			//	startSet = true;
    			//}
    		}
    	}
	    
	    //$graph.append($row);
    	//this.grid.push(gridRow);
    	nodes.push(nodeRow);
    }

	
	return new Graph(nodes);
};

$(astarcanvas.init);