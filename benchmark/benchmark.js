$(function() {
    var running = false;
    $("#runall").click(function() {
        if (running) {
            return;
        }
        running = true;

        var graph = new Graph(grid);
        var start = graph.nodes[0][0];
        var end = graph.nodes[140][140];
        var results = [];
        var times = 0;
        
        for (var i = 0; i < 1000; i++) {
            var startTime = new Date().getTime();
            var result = astar.search(graph.nodes, start, end);
            var endTime = new Date().getTime();
            times = times + (endTime - startTime);
            
            results.push(
                '<li>Found path with ' + result.length + ' steps.  ' +
                'Took ' + (endTime - startTime) + ' milliseconds.</li>'
            );
        }
        
        $("#graph").html(graph.toString());
        $("#summary").html('Average time: ' + (times / 1000) + 'ms');
        $("#results").html(results.join(''));

        running = false;
        return false;
    });
});