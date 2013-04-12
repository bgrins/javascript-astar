/*  test.js http://github.com/bgrins/javascript-astar
    MIT License

    Start of a test page for the astar search.  Still needs to be implemented...
*/

function runTest(grid, start, end) {
    var graph = new Graph(grid);
    var start = graph.nodes[start[0]][start[1]];
    var end = graph.nodes[end[0]][end[1]];
    var sTime = new Date();
    var result = astar.search(graph.nodes, start, end);
    var eTime = new Date();
    var text = "<pre>" + graph.toString() + "\n"+ result.length +" Steps (" + (eTime - sTime) + "ms)</pre>";
    return {
        result: result,
        time: (eTime - sTime),
        text: text
    };
}

// https://gist.github.com/bgrins/581352
function runBasic() {
    var graph = new Graph([
        [1,1,1,1],
        [0,1,1,0],
        [0,0,1,1]
    ]);
    var start = graph.nodes[0][0];
    var end = graph.nodes[1][2];
    var result = astar.search(graph.nodes, start, end);

    return "<pre>" + result.join(", ") + "</pre>";
}

$(function() {
    $("#runall").click(function() {

        var result1 = runTest([
            [1,1,1,1],
            [0,1,1,0],
            [0,0,1,1]
        ], [0,0], [2,3]);

        $("#test-output").append(result1.text);
        $("#test-output").append(runBasic());
        return false;
    });
});

