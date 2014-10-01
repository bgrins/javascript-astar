// javascript-astar 0.3.0
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.
// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html

(function(definition) {
    /* global module, define */
    if(typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = definition();
    } else if(typeof define === 'function' && define.amd) {
        define([], definition);
    } else {
        var exports = definition();
        window.astar = exports.astar;
        window.Graph = exports.Graph;
    }

})(function() {

function pathTo(node) {
    var path = [];
    while((node = node.parent)) {
        path.push(node);
    }
    return path.reverse();
}

function getHeap() {
    return new BinaryHeap(function(node) {
        return node.f;
    });
}

var astar = {

    init: function(graph) {

        for (var i = 0, len = graph.nodes.length; i < len; ++i) {
            var node = graph.nodes[i];
            node.f = 0;
            node.g = 0;
            node.h = 0;
            node.visited = false;
            node.closed = false;
            node.parent = null;
        }
    },

    /**
    * Perform an A* Search on a graph given a start and end node.
    * @param {Graph} graph
    * @param {GridNode} start
    * @param {GridNode} end
    * @param {Object} [options]
    * @param {bool} [options.closest] Specifies whether to return the
               path to the closest node if the target is unreachable.
    * @param {Function} [options.heuristic] Heuristic function (see
    *          astar.heuristics).
    */
    search: function(graph, start, end, options) {
        astar.init(graph);

        options = options || {};
        var heuristic = options.heuristic || astar.heuristics.manhattan,
            closest = options.closest || false;

        var openHeap = getHeap(),
            closestNode = start; // set the start node to be the closest if required

        start.h = heuristic(start, end);

        openHeap.push(start);

        while(openHeap.size()) {

            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();

            // End case -- result has been found, return the traced path.
            if(currentNode === end) {
                return pathTo(currentNode);
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;

            // Find all neighbors for the current node.
            var neighbors = graph.neighbors(currentNode);

            for (var i = 0, il = neighbors.length; i < il; ++i) {
                var neighbor = neighbors[i];

                if (neighbor.closed || neighbor.isWall()) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }

                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentNode.g + neighbor.getCost(currentNode),
                    beenVisited = neighbor.visited;

                if (!beenVisited || gScore < neighbor.g) {

                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic(neighbor, end);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;

                    if (closest) {
                        // If the neighbour is closer than the current closestNode or if it's equally close but has
                        // a cheaper path than the current closest node then it becomes the closest node
                        if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
                            closestNode = neighbor;
                        }
                    }

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

        if (closest) {
            return pathTo(closestNode);
        }

        // No result was found - empty array signifies failure to find path.
        return [];
    },
    // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
    heuristics: {
        manhattan: function(pos0, pos1) {
            var d1 = pos1.x - pos0.x;
            var d2 = pos1.y - pos0.y;
            return (d1 < 0 ? -d1 : +d1) + (d2 < 0 ? -d2 : +d2);
        },
        diagonal: function(pos0, pos1) {
            //var D = 1;
            var D2 = 1.4142135623730951; //Math.sqrt(2);
            var d1 = pos1.x - pos0.x;
            var d2 = pos1.y - pos0.y;
            if (d1 < 0) d1 = -d1;
            if (d2 < 0) d2 = -d2;
            // (D * (d1 + d2)) + ((D2 - (2 * D))
            return (d1 + d2) + ((D2 - 2) * (d1 < d2 ? d1 : d2));
        }
    }
};

/**
* A graph memory structure
* @param {Array} gridIn 2D array of input weights
* @param {Object} [options]
* @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
*/
function Graph(gridIn, options) {
    options = options || {};
    this.diagonal = !!options.diagonal;
    var nodes = [];
    var grid = [];
    var line;
    for (var x = 0, l = gridIn.length; x < l; x++) {
        grid[x] = line = [];

        for (var y = 0, row = gridIn[x], k = row.length; y < k; y++) {
            var node = new GridNode(x, y, row[y]);
            line[y] = node;
            nodes.push(node);
        }
    }
    this.nodes = nodes;
    this.grid = grid;
}

Graph.prototype = {
    neighbors: function(node) {
        var ret = [],
            x = node.x,
            y = node.y,
            grid = this.grid,
            gridX;

        // West
        gridX = grid[x-1];
        if(gridX && gridX[y]) {
            ret.push(gridX[y]);
        }

        // East
        gridX = grid[x+1];
        if(gridX && gridX[y]) {
            ret.push(gridX[y]);
        }

        // South
        gridX = grid[x];

        if(gridX && gridX[y-1]) {
            ret.push(gridX[y-1]);
        }

        // North
        if(gridX && gridX[y+1]) {
            ret.push(gridX[y+1]);
        }

        if (this.diagonal) {
            // Southwest
            gridX = grid[x-1];
            if(gridX && gridX[y-1]) {
                ret.push(gridX[y-1]);
            }

            // Southeast
            gridX = grid[x+1];
            if(gridX && gridX[y-1]) {
                ret.push(gridX[y-1]);
            }

            // Northwest
            gridX = grid[x-1];
            if(gridX && gridX[y+1]) {
                ret.push(gridX[y+1]);
            }

            // Northeast
            gridX = grid[x+1];
            if(gridX && gridX[y+1]) {
                ret.push(gridX[y+1]);
            }
        }

        return ret;
    },

    toString: function() {
        var graphString = [],
            nodes = this.grid, // when using grid
            rowDebug, row, y, l;
        for (var x = 0, len = nodes.length; x < len; x++) {
            rowDebug = [];
            row = nodes[x];
            for (y = 0, l = row.length; y < l; y++) {
                rowDebug.push(row[y].weight);
            }
            graphString.push(rowDebug.join(" "));
        }
        return graphString.join("\n");
    }
};

function GridNode(x, y, weight) {
    this.x = x;
    this.y = y;
    this.weight = weight;
}

GridNode.prototype = {
    x: 0,
    y: 0,
    weight: 0,

    toString: function() {
        return "[" + this.x + " " + this.y + "]";
    },

    getCost: function() {
        return this.weight;
    },

    isWall: function() {
        return this.weight === 0;
    }
};

function BinaryHeap(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
    push: function(element) {
        // Add the new element to the end of the array.
        // Allow it to sink down.
        this.sinkDown(this.content.push(element) - 1); // push returns length, better compression
    },
    pop: function() {
        // Store the first element so we can return it later.
        var content = this.content;
        var result = content[0];

        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (content.length > 0) {
            content[0] = content.pop(); // Get the element at the end of the array.
            this.bubbleUp(0);
        }
        return result;
    },
    remove: function(node) {
        var content = this.content;
        var i = content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = content.pop();

        if (content.length - 1 !== i) {
            content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            }
            else {
                this.bubbleUp(i);
            }
        }
    },
    size: function() {
        return this.content.length;
    },
    rescoreElement: function(node) {
        this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
        var content = this.content;

        // Fetch the element that has to be sunk.
        var element = content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1,
                parent = content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                content[parentN] = element;
                content[n] = parent;
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
        var content = this.content,
            length = content.length,
            element = content[n],
            elemScore = this.scoreFunction(element);

        while(true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1,
                child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null,
                child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore){
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                content[n] = content[swap];
                content[swap] = element;
                n = swap;
            }
            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
};

return {
    astar: astar,
    Graph: Graph
};

});
