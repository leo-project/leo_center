require_relative "app"

LeoTamer.run!(:port => (ARGV[0] || 80))
