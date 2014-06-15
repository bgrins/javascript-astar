# javascript-astar

## An implementation of the A* Search Algorithm in JavaScript

See a demo at http://www.briangrinstead.com/files/astar/

## Sample Usage

If you want just the A* search code (not the demo visualization), use code like this http://gist.github.com/581352

	<script type='text/javascript' src='astar.js'></script>
	<script type='text/javascript'>
		var graph = new Graph([
			[1,1,1,1],
			[0,1,1,0],
			[0,0,1,1]
		]);
		var start = graph.grid[0][0];
		var end = graph.grid[1][2];
		var result = astar.search(graph, start, end);
		// result is an array containing the shortest path

		var graphDiagonal = new Graph([
			[1,1,1,1],
			[0,1,1,0],
			[0,0,1,1]
		], { diagonal: true });
		var start = graphDiagonal.grid[0][0];
		var end = graphDiagonal.grid[1][2];
		var resultWithDiagonals = astar.search(graphDiagonal, start, end);

		// Weight can easily be added by increasing the values within the graph, and where 0 is infinite (a wall)
		var graphWithWeight = new Graph([
			[1,1,2,30],
			[0,4,1.3,0],
			[0,0,5,1]
		]);
		var startWithWeight = graphWithWeight.grid[0][0];
		var endWithWeight = graphWithWeight.grid[1][2];
		var resultWithWeight = astar.search(graphWithWeight, startWithWeight, endWithWeight);

		// resultWithWeight is an array containing the shortest path taking into account the weight of a node
	</script>

### Original (slower) implementation

The original version of the algorithm used a list, and was a bit clearer but much slower.  It was based off the [original blog post](http://www.briangrinstead.com/blog/astar-search-algorithm-in-javascript).  The code is available at: https://github.com/bgrins/javascript-astar/tree/0.0.1/original-implementation.

The newest version of the algorithm using a Binary Heap.  It is quite faster than the original.
http://www.briangrinstead.com/blog/astar-search-algorithm-in-javascript-updated
Binary Heap taken from http://eloquentjavascript.net/appendix2.html (license: http://creativecommons.org/licenses/by/3.0/)


## Running the test suite

[![Build Status](https://travis-ci.org/bgrins/javascript-astar.png?branch=master)](https://travis-ci.org/bgrins/javascript-astar)

If you don't have grunt installed, follow the [grunt getting started guide](http://gruntjs.com/getting-started) first.

Pull down the project, then run:

		npm install
		grunt
