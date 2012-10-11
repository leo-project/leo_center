require_relative "app"

LeoTamer::App.run!(:port => (ARGV[0] || 80))
