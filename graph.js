// graph.js
// Sets up the page with a graph


var css = { start: "start", finish: "finish", wall: "wall", active: "active" };
var log = function() { try{ console.debug(arguments); } catch(e){}};

function GraphSearch($graph, options, implementation) {
    this.$graph = $graph;
    this.graphSet = [];
    this.search = implementation;
    this.opts = $.extend({wallFrequency:.1, debug:true, gridSize:10}, options);
    this.initialize();
}
GraphSearch.prototype.setOption = function(opt) {
    this.opts = $.extend(this.opts, opt);
    if(opt["debug"]||opt["debug"]==false) {
        this.drawDebugInfo(opt["debug"]);        
    }
};
GraphSearch.prototype.initialize = function() {
    
    var self = this;
	var graphSet = [];
	var $graph = this.$graph;
	$graph.empty();
	
    var cellWidth = ($graph.width()/this.opts.gridSize)-2;  // -2 for border
    var cellHeight = ($graph.height()/this.opts.gridSize)-2;
    
    log("height", cellHeight, $graph.height(), this.opts.gridSize);
    log("width", cellWidth, $graph.width(), this.opts.gridSize);
    
    var $cellTemplate = $("<span />").addClass("grid_item").width(cellWidth).height(cellHeight);
    for(var x=0;x<this.opts.gridSize;x++) {
        var $row = $("<div class='clear' />");
    	$graph.append($row);
    	
    	var row = [];
    	
    	for(var y=0;y<this.opts.gridSize;y++) {
    		var id = "cell_"+x+"_"+y;
    		var $cell = $cellTemplate.clone();
    		$cell.attr("id", id).attr("x", x).attr("y", y);
    		$row.append($cell);
    		row.push(new GraphNode(x,y,$cell));
    	}
    	graphSet.push(row);
    }
    
	this.graphSet = graphSet;
	
    // bind cell event, set start/wall positions
    this.$cells = $graph.find(".grid_item");
    log(this.$cells.outerWidth(true));
    this.$cells.click(function() { self.cellClicked($(this)) });
    this.$cells.each(function() {
    	var rand = Math.floor(Math.random()*(1/self.opts.wallFrequency));
    	if(rand == 0) { $(this).addClass(css.wall); }
    });
    this.$cells.filter(":not(."+css.wall+"):first").addClass(css.start);
};
GraphSearch.prototype.cellClicked = function($end) {
    
    var end = this.nodeFromElement($end);
    
   	if($end.hasClass(css.wall) || $end.hasClass(css.start)) {
   		log("clicked on wall or start...", $end);
   		return;
   	}
   	
   	this.$cells.removeClass(css.finish);
   	$end.addClass("finish");
   	var $start = this.$cells.filter("." + css.start);
   	var start = this.nodeFromElement($start);
    
	var sTime = new Date();
    var path = this.search(this.graphSet, start, end);
	var fTime = new Date();
	
	if(!path || path.length == 0)	{ 
	    $("#message").text("couldn't find a path ("+(fTime-sTime)+"ms)");
	    this.animateNoPath(); 
	}
	else {
	    $("#message").text("search took " + (fTime-sTime) + "ms.");
	    this.drawDebugInfo(this.opts.debug);
	    this.animatePath(path);
	}
};
GraphSearch.prototype.drawDebugInfo = function(show) {
    this.$cells.html(" ");
    if(show) {
        this.graphSet.each(function(i) {
            this.each(function(j) {
                if(this.debug!="") {
                    this.$element.html(this.debug);
                }
            });
        });
    }
};
GraphSearch.prototype.nodeFromElement = function($cell) {
    return this.graphSet[parseInt($cell.attr("x"))][parseInt($cell.attr("y"))];
};
GraphSearch.prototype.animateNoPath = function() {
    var $graph = this.$graph;
    var jiggle = function(lim, i) {
	    if(i>=lim) { $graph.css("top", 0).css("left", 0); return;  }
	    if(!i) i=0;
	    i++;
	    $graph.css("top", Math.random()*6).css("left", Math.random()*6);
	    setTimeout( function() { jiggle(lim, i) }, 5 );
    };
    jiggle(15);
};
GraphSearch.prototype.animatePath = function(path) {
    var removeClass = function(path, i) {
	    if(i>=path.length) return;
	    path[i].getElement().removeClass(css.active);
	    setTimeout( function() { removeClass(path, i+1) }, 25);
    }
    var addClass = function(path, i)  {
	    if(i>=path.length) return removeClass(path, 0);
	    path[i].getElement().addClass(css.active);
	    setTimeout( function() { addClass(path, i+1) }, 25);
    };
    
    log(path.toString());
    addClass(path, 0);
    this.$graph.find("." + css.start).removeClass(css.start);
    this.$graph.find("." + css.finish).removeClass(css.finish).addClass(css.start);
};

function GraphNode(x,y,$element) {
    this.x = x;
    this.y = y;
    this.pos = {x:x,y:y};
    this.$element = $element;
    this.debug = "";
}
GraphNode.prototype.toString = function() {
	return "[" + this.x + " " + this.y + "]";
}
GraphNode.prototype.isAt = function(x,y) { 
	return (x == this.x) && (y == this.y); 
};
GraphNode.prototype.getElement = function() {
    return this.$element;
};
GraphNode.prototype.isWall = function() {
	return this.$element.hasClass(css.wall);
};

Array.prototype.each = function(f) {
    if(!f.apply) return;
    for(var i=0;i<this.length;i++) {
        f.apply(this[i], [i, this]);   
    }
}
Array.prototype.findGraphNode = function(obj) {
	for(var i=0;i<this.length;i++) {
		if(this[i].pos == obj.pos) { return this[i]; }
	}
	return false;
};
Array.prototype.removeGraphNode = function(obj) {
	for(var i=0;i<this.length;i++) {
		if(this[i].pos == obj.pos) { this.splice(i,1); }
	}
	return false;
};

