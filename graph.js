/*  graph.js http://github.com/bgrins/javascript-astar
    MIT License
    
    Creates a Graph class used in the astar search algorithm.
    Includes Binary Heap (with modifications) from Marijn Haverbeke 
        URL: http://eloquentjavascript.net/appendix2.html
        License: http://creativecommons.org/licenses/by/3.0/
*/

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/) {
        var len = this.length;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) {
            from += len;
        }
        for (; from < len; ++from) {
            if (from in this && this[from] === elt) {
                return from;
            }
        }
        return -1;
    };
}

if (!Array.prototype.remove) {
    Array.prototype.remove = function(from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };
}

var GraphNodeType = { OPEN: 0, WALL: 1 };
function Graph(grid) {
    this.elements = grid;
    var nodes = [];

    var row, x, y, l, len = len = grid.length;
    for (x = 0; x < len; ++x) {
        nodes[x] = new Array(l = (row = grid[x]).length); // optimum array with size
        for (y = 0; y < l; ++y) {
            nodes[x][y] = new GraphNode(x, y, row[y]);
        }
    }
    this.nodes = nodes;
}
Graph.prototype.toString = function() {
    var graphString = "\n";
    var nodes = this.nodes;
    var rowDebug, row, y, l;
    for (var x = 0, len = nodes.length; x < len;) {
        rowDebug = "";
        row = nodes[x++];
        for (y = 0, l = row.length; y < l;) {
            rowDebug += row[y++].type + " ";
        }
        graphString = graphString + rowDebug + "\n";
    }
    return graphString;
};

function GraphNode(x,y,type) {
    this.data = {};
    this.x = x;
    this.y = y;
    this.pos = {x:x, y:y};
    this.type = type;
}
GraphNode.prototype.toString = function() {
    return "[" + this.x + " " + this.y + "]";
};
GraphNode.prototype.isWall = function() {
    return this.type == GraphNodeType.WALL;
};


function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to sink down.
    this.sinkDown(this.content.length - 1);
  },

  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it bubble up.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }
    return result;
  },
  remove: function(node) {

    var i = this.content.indexOf(node);

    // When it is found, the process seen in 'pop' is repeated
    // to fill up the hole.
    var end = this.content.pop();
    if (i !== this.content.length - 1) {
      this.content[i] = end;
      if (this.scoreFunction(end) < this.scoreFunction(node))
        this.sinkDown(i);
      else
        this.bubbleUp(i);
    }
  },

  size: function() {
    return this.content.length;
  },

  rescoreElement: function(node) {
    this.sinkDown(this.content.indexOf(node));
  },
  sinkDown: function(n) {
    // Fetch the element that has to be sunk.
    var element = this.content[n];
    // When at 0, an element can not sink any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = ((n + 1) >> 1) - 1,
          parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to sink any further.
      else {
        break;
      }
    }
  },

  bubbleUp: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
        element = this.content[n],
        elemScore = this.scoreFunction(element);

    while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) << 1, child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
            child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore)
          swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
            child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score))
          swap = child2N;
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      // Otherwise, we are done.
      else {
        break;
      }
    }
  }
};