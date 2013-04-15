# javascript-astar

## An implementation of the A* Search Algorithm in JavaScript

See a demo at http://www.briangrinstead.com/files/astar/

### astar.js

The newest version of the algorithm using a Binary Heap.  It is quite faster than the original.
http://www.briangrinstead.com/blog/astar-search-algorithm-in-javascript-updated
Binary Heap taken from http://eloquentjavascript.net/appendix2.html (license: http://creativecommons.org/licenses/by/3.0/)
	
	
### original-implementation/astar-list.js: 

The original version of the algorithm based off the original blog post at: http://www.briangrinstead.com/blog/astar-search-algorithm-in-javascript
I left it in because it may be a little easier for some people to understand, but if you are planning on actually using this, I would strongly recommend using astar.js instead.

## Sample Usage

If you want just the A* search code (not the demo visualization), use code like this http://gist.github.com/581352

	<script type='text/javascript' src='graph.js'></script>
	<script type='text/javascript' src='astar.js'></script>
	<script type='text/javascript'>
		var graph = new Graph([
			[1,1,1,1],
			[0,1,1,0],
			[0,0,1,1]
		]);
		var start = graph.nodes[0][0];
		var end = graph.nodes[1][2];
		var result = astar.search(graph.nodes, start, end);
		// result is an array containing the shortest path
		
		var resultWithDiagonals = astar.search(graph.nodes, start, end, true);
		// result now searches diagonal neighbors as well

		// Weight can easily be added by increasing the values within the graph, and where 0 is infinite (a wall)
		var graphWithWeight = new Graph([
			[1,1,2,30],
			[0,4,1.3,0],
			[0,0,5,1]
		]);
		var startWithWeight = graphWithWeight.nodes[0][0];
		var endWithWeight = graphWithWeight.nodes[1][2];
		var resultWithWeight = astar.search(graphWithWeight.nodes, startWithWeight, endWithWeight);

		// resultWithWeight is an array containing the shortest path taking into account the weight of a node
	</script>



