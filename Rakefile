require 'rubygems'

HEADER = /((^\s*\/\/.*\n)+)/

desc "rebuild the javascript-astar files for distribution"
task :build do
  begin
    require 'closure-compiler'
  rescue LoadError
    puts "closure-compiler not found.\nInstall it by running 'gem install closure-compiler"
    exit
  end
  graph = File.read('graph.js')
  astar = File.read('astar.js')
  header = astar.match(HEADER)
  File.open('dist/astar-concat.js', 'w+') do |file|
  
    file.write graph + astar
  end
  File.open('dist/astar-min.js', 'w+') do |file|
    compressedAstar = Closure::Compiler.new.compress(astar)
    compressedGraph = Closure::Compiler.new.compress(graph)
    file.write header[1].squeeze(' ') + compressedGraph + compressedAstar
  end
  
  
  system('docco graph.js astar.js')
  
end
