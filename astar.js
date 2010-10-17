/* 	astar.js http://github.com/bgrins/javascript-astar
	MIT License
	
	Implements the astar search algorithm in javascript using a binary heap
	**Requires graph.js**

	Example Usage:
		var graph = new Graph([
			[0,0,0,0],
			[1,0,0,1],
			[1,1,0,0]
		]);
		var start = graph.nodes[0][0];
		var end = graph.nodes[1][2];
		astar.search(graph.nodes, start, end);
*/

var astar = {
    init: function(grid) {
        for(var x = 0, xl = grid.length; x < xl; x++) {
            for(var y = 0, yl = grid[x].length; y < yl; y++) {
            	var node = grid[x][y];
                node.f = 0;
                node.g = 0;
                node.h = 0;
                node.visited = false;
                node.closed = false;
                node.debug = "";
                node.parent = null;
            }
        }
    },
    search: function(grid, start, end, heuristic) {
        astar.init(grid);
        heuristic = heuristic || astar.manhattan;

		var openHeap = new BinaryHeap(function(node){return node.f;});
		openHeap.push(start);

        while(openHeap.size() > 0) {

        	// Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();

		    // End case -- result has been found, return the traced path
		    if(currentNode === end) {
			    var curr = currentNode;
			    var ret = [];
			    while(curr.parent) {
				    ret.push(curr);
				    curr = curr.parent;
			    }
			    return ret.reverse();
		    }

		    // Normal case -- move currentNode from open to closed, process each of its neighbors
		    currentNode.closed = true;

		    var neighbors = astar.neighbors(grid, currentNode);
		    for(var i=0, il = neighbors.length; i < il; i++) {
			    var neighbor = neighbors[i];

			    if(neighbor.closed || neighbor.isWall()) {
				    // not a valid node to process, skip to next neighbor
				    continue;
			    }

			    // g score is the shortest distance from start to current node, we need to check if
			    //   the path we have arrived at this neighbor is the shortest one we have seen yet
			    // 1 is the distance from a node to it's neighbor.  This could be variable for weighted paths.
			    var gScore = currentNode.g + 1;
			    var beenVisited = neighbor.visited;

			    if(!beenVisited || gScore < neighbor.g) {

				    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
				    neighbor.visited = true;
				    neighbor.parent = currentNode;
				    neighbor.h = neighbor.h || heuristic(neighbor.pos, end.pos);
				    neighbor.g = gScore;
				    neighbor.f = neighbor.g + neighbor.h;
				    neighbor.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h;

				    if (!beenVisited) {
				    	// Pushing to heap will put it in proper place based on the 'f' value.
				    	openHeap.push(neighbor);
				    }
				    else {
				    	// Already seen the node, but since it has been rescored we need to reorder it in the heap
				    	openHeap.rescoreElement(neighbor);
				    }
				}
		    }
        }

        // No result was found -- empty array signifies failure to find path
        return [];
    },
    manhattan: function(pos0, pos1) {
    	// See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

        var d1 = Math.abs (pos1.x - pos0.x);
        var d2 = Math.abs (pos1.y - pos0.y);
        return d1 + d2;
    },
    neighbors: function(grid, node) {
        var ret = [];
	    var x = node.x;
	    var y = node.y;

	    if(grid[x-1] && grid[x-1][y]) {
		    ret.push(grid[x-1][y]);
	    }
	    if(grid[x+1] && grid[x+1][y]) {
		    ret.push(grid[x+1][y]);
	    }
	    if(grid[x] && grid[x][y-1]) {
		    ret.push(grid[x][y-1]);
	    }
	    if(grid[x] && grid[x][y+1]) {
		    ret.push(grid[x][y+1]);
	    }
	    return ret;
    }
};


