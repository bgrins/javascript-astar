require 'rubygems'

HEADER = /((^\s*\/\/.*\n)+)/
HEADER = /()/
desc "rebuild the javascript-astar files for distribution"
task :build do
  begin
    require 'closure-compiler'
  rescue LoadError
    puts "closure-compiler not found.\nInstall it by running 'gem install closure-compiler"
    exit
  end
  source = File.read('graph.js') + File.read ('astar.js')
  header = source.match(HEADER)
  File.open('dist/astar-min.js', 'w+') do |file|
    compressed = Closure::Compiler.new.compress(source)
    file.write header[1].squeeze(' ') + compressed
  end
  
  
  system('docco graph.js astar.js')
  
end
