require 'yaml'

module LeoTamer
  source_dir = File.expand_path(File.dirname(__FILE__))
  config_file = "#{source_dir}/../config.yml"
  Config = YAML.load(File.read(config_file))
end
