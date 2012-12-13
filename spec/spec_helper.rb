require "rack/test"

include Rack::Test::Methods

def get_json(url)
  get url
  @data = JSON.parse(last_response.body.to_s)
end
