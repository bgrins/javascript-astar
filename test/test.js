/*  test.js http://github.com/bgrins/javascript-astar
    MIT License

    Start of a test page for the astar search.  Still needs to be implemented...
*/

function runTest(grid, start, end, options) {
    var graph = new Graph(grid);
    start = graph.nodes[start[0]][start[1]];
    end = graph.nodes[end[0]][end[1]];
    var sTime = new Date();
    var result = astar.search(graph.nodes, start, end, options);
    var eTime = new Date();
    var text = "<pre>" + start + " to " + end + (options ? " - " + JSON.stringify(options) : "") + "\n" +
        graph.toString() + "\n" +
        result.length + " Steps (" + (eTime - sTime) + "ms)</pre>";
    return {
        result: result,
        time: (eTime - sTime),
        text: text
    };
}

$(function() {
    $("#runall").click(function() {

        var result1 = runTest([
            [1,1,1,1],
            [0,1,1,0],
            [0,0,1,1]
        ], [0,0], [1,2]);

        $("#test-output").append(result1.text);
        $("#test-output").append('<pre> Path:' + result1.result.join(', ') + '</pre>');

        var result2 = runTest([
            [1,1,1,1],
            [0,1,1,0],
            [0,0,1,1]
        ], [0,0], [1,3], {closest: true});

        $("#test-output").append(result2.text);
        $("#test-output").append('<pre> Path:' + result2.result.join(', ') + '</pre>');

        var result3 = runTest([
            [1,1,1,1],
            [0,1,1,0],
            [0,0,1,1]
        ], [0,0], [1,3], {closest: true, diagonal: true});

        $("#test-output").append(result3.text);
        $("#test-output").append('<pre> Path: ' + result3.result.join(', ') + '</pre>');
        return false;
    });
});

