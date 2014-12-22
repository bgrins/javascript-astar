$(function() {
    var running = false;
    $("#runall").click(function() {
        if (running) {
            return;
        }
        running = true;

        var graph = new Graph(grid),
            start = graph.grid[0][0],
            end = graph.grid[140][140],
            results = [],
            times = 0;

        for (var i = 0; i < 1000; i++) {
            var startTime = performance ? performance.now() : new Date().getTime(),
                result = astar.search(graph, start, end),
                endTime = performance ? performance.now() : new Date().getTime();
            times = times + (endTime - startTime);

            results.push(
                '<li>Found path with ' + result.length + ' steps.  ' +
                'Took ' + (endTime - startTime).toFixed(2) + ' milliseconds.</li>'
            );
        }
        
        $("#graph").html(graph.toString());
        $("#summary").html('Average time: ' + (times / 1000).toFixed(2) + 'ms');
        $("#results").html(results.join(''));

        running = false;
        return false;
    });
});