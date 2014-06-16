
/* global Graph, astar, ok, test, equal */


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

test( "Diagonal Pathfinding", function() {
  var result1 = runSearch(new Graph([
      [1,1,1,1],
      [0,1,1,0],
      [0,0,1,1]
  ], { diagonal: true}), [0,0], [2,3]);

  equal (result1.text, "(1,1)(2,2)(2,3)", "Result is expected");
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

function runSearch(graph, start, end, options) {
  if (!(graph instanceof Graph)) {
    graph = new Graph(graph);
  }
  start = graph.grid[start[0]][start[1]];
  end = graph.grid[end[0]][end[1]];
  var sTime = new Date(),
    result = astar.search(graph, start, end, options),
    eTime = new Date();
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

  function CityGraph(data, links) {
    this.nodes = [];
    this.links = links;
    this.cities = {};

    for (var i = 0; i < data.length; ++i) {
      var city = data[i],
          obj = new CityNode(city.name, city.lat, city.lng);

      if (this.nodes.indexOf(obj) == -1) {
          this.nodes.push(obj);
      }

      this.cities[obj.name] = obj;
    }
  }

  CityGraph.prototype.neighbors = function (node) {
    var neighbors = [],
        ids = this.links[node.name];
    for (var i = 0, len = ids.length; i < len; ++i) {
      var name = ids[i],
          neighbor = this.cities[name];
      neighbors.push(neighbor);
    }
    return neighbors;
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
  // Heuristic function
  CityNode.prototype.GPS_distance = function(city) {
      var x = (city.longRad - this.longRad) * Math.cos((this.latRad + city.latRad)/2),
          y = city.latRad - this.latRad,
          res = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) * 6371;
      return res;
  };
  // Real cost function
  CityNode.prototype.getCost = function(city) {
    // Re-use heuristic function for now
    // TODO: Determine the real distance between cities (from another data set)
    return this.GPS_distance(city);
  };

  var graph = new CityGraph(data, links);

  var start = graph.cities["Paris"],
      end = graph.cities["Cannes"];

  var GPSheuristic = function(node0, node1) {
    return node0.GPS_distance(node1);
  };

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

