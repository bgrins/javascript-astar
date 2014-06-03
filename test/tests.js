
test( "Sanity Checks", function() {
  ok (typeof Graph !== "undefined", "Graph exists");
  ok (typeof astar !== "undefined", "Astar exists");
});

test( "Basic Horizontal", function() {

  var result1 = runSearch([[1],[1]], [0,0], [1,0]);
  equal (result1.text, "(1,0)", "One step down");

  var result2 = runSearch([[1],[1],[1]], [0,0], [2,0]);
  equal (result2.text, "(1,0)(2,0)", "Two steps down");

  var result3 = runSearch([[1],[1],[1],[1]], [0,0], [3,0]);
  equal (result3.text, "(1,0)(2,0)(3,0)", "Three steps down");

});

test( "Basic Vertical", function() {

  var result1 = runSearch([[1, 1]], [0,0], [0,1]);
  equal (result1.text, "(0,1)", "One step across");

  var result2 = runSearch([[1, 1, 1]], [0,0], [0,2]);
  equal (result2.text, "(0,1)(0,2)", "Two steps across");

  var result3 = runSearch([[1, 1, 1, 1]], [0,0], [0,3]);
  equal (result3.text, "(0,1)(0,2)(0,3)", "Three steps across");

});

test( "Basic Weighting", function() {

  var result1 = runSearch([[1, 1],
                           [2, 1]], [0,0], [1,1]);
  equal (result1.text, "(0,1)(1,1)", "Takes less weighted path");

  var result2 = runSearch([[1, 2],
                           [1, 1]], [0,0], [1,1]);
  equal (result2.text, "(1,0)(1,1)", "Takes less weighted path");

});

test( "Pathfinding", function() {
  var result1 = runSearch([
      [1,1,1,1],
      [0,1,1,0],
      [0,0,1,1]
  ], [0,0], [2,3]);

  equal (result1.text, "(0,1)(1,1)(1,2)(2,2)(2,3)", "Result is expected");
});

test( "Pathfinding to closest", function() {
  var result1 = runSearch([
      [1,1,1,1],
      [0,1,1,0],
      [0,0,1,1]
  ], [0,0], [2,1], {closest: true});

  equal (result1.text, "(0,1)(1,1)", "Result is expected - pathed to closest node");

  var result2 = runSearch([
      [1,0,1,1],
      [0,1,1,0],
      [0,0,1,1]
  ], [0,0], [2,1], {closest: true});

  equal (result2.text, "", "Result is expected - start node was closest node");

  var result3 = runSearch([
      [1,1,1,1],
      [0,1,1,0],
      [0,1,1,1]
  ], [0,0], [2,1], {closest: true});

  equal (result3.text, "(0,1)(1,1)(2,1)", "Result is expected - target node was reachable");
});

function runSearch(grid, start, end, options) {
  var graph = new Graph(grid);
  var start = graph.grid[start[0]][start[1]];
  var end = graph.grid[end[0]][end[1]];
  var sTime = new Date();
  var result = astar.search(graph, start, end, options);
  var eTime = new Date();
  return {
    result: result,
    text: pathToString(result),
    time: (eTime - sTime)
  };
}

function pathToString(result) {
  return result.map(function(node) {
    return "(" + node.x + "," + node.y + ")";
  }).join("");
}

test( "GPS Pathfinding", function() {
  var data = [
    {name: "Paris", lat: 48.8567, lng: 2.3508},
    {name: "Lyon", lat: 45.76, lng: 4.84},
    {name: "Marseille", lat: 43.2964, lng: 5.37},
    {name: "Bordeaux", lat: 44.84, lng: -0.58},
    {name: "Cannes", lat: 43.5513, lng: 7.0128},
    {name: "Toulouse", lat: 43.6045, lng: 1.444},
    {name: "Reims", lat: 49.2628, lng: 4.0347}
  ],
  links = {
    "Paris": ["Lyon", "Bordeaux", "Reims"],
    "Lyon": ["Paris", "Marseille"],
    "Marseille": ["Lyon", "Cannes", "Toulouse"],
    "Bordeaux": ["Toulouse", "Paris"],
    "Cannes": ["Marseille"],
    "Toulouse": ["Marseille", "Bordeaux"],
    "Reims": ["Paris"]
  };

  function CityNode(name, lat, lng) {
    this.name = name;
    this.lat = lat;
    this.lng = lng;
    this.longRad = this.lng * Math.PI / 180;
    this.latRad = this.lat * Math.PI / 180;
  }
  CityNode.prototype.weight = 1;
  CityNode.prototype.toString = function() {
      return "[" + this.name + " (" + this.lat + ", " + this.lng + ")]";
  };
  CityNode.prototype.isWall = function() {
      return this.weight === 0;
  };

  //---

  var graph = new Graph(),
    cities = {};
  for (var i = 0; i < data.length; ++i) {
    var city = data[i],
      obj = new CityNode(city.name, city.lat, city.lng);
    graph.add(obj);
    cities[obj.name] = obj;
  }

  graph.cities = cities;
  graph.links = links;

  var GPSheuristic = astar.heuristics.gps;

  graph.neighbors = function (node) { // Override neighbors function for this specific graph
    var neighbors = [],
      ids = this.links[node.name];
    for (var i = 0, len = ids.length; i < len; ++i) {
      var name = ids[i],
        neighbor = this.cities[name];
      neighbor.cost = GPSheuristic(node, neighbor); // Compute real cost!
      neighbors.push(neighbor);
    }
    return neighbors;
  };

  var start = cities["Paris"],
    end = cities["Cannes"];
  
  var result = astar.search(graph, start, end, {heuristic: GPSheuristic});
  equal(result.length, 3, "Cannes is 3 cities away from Paris");
  equal(result[0].name, "Lyon", "City #1 is Lyon");
  equal(result[1].name, "Marseille", "City #2 is Marseille");
  equal(result[2].name, "Cannes", "City #3 is Cannes");
});

// // https://gist.github.com/bgrins/581352
// function runBasic() {
//     var graph = new Graph([
//         [1,1,1,1],
//         [0,1,1,0],
//         [0,0,1,1]
//     ]);
//     var start = graph.grid[0][0];
//     var end = graph.grid[1][2];
//     var result = astar.search(graph, start, end);

//     return "<pre>" + result.join(", ") + "</pre>";
// }

// $(function() {
//     $("#runall").click(function() {

//         var result1 = runTest([
//             [1,1,1,1],
//             [0,1,1,0],
//             [0,0,1,1]
//         ], [0,0], [2,3]);

//         $("#test-output").append(result1.text);
//         $("#test-output").append(runBasic());
//         return false;
//     });
// });

