require "rack/test"

include Rack::Test::Methods
ENV['RACK_ENV'] = "test"

require_relative "../app"

def app
  LeoTamer.new
end

def get_json(url)
  get url
  JSON.parse(last_response.body.to_s)
end
