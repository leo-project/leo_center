require "sinatra/base"
require "sinatra/namespace"
require "json"
require "haml"

class LeoTamer < Sinatra::Base
  class Error < StandardError; end

  def debug(str)
    puts str if $DEBUG
  end

  register Sinatra::Namespace
  use Rack::Session::Cookie,
    :expire_after => 60*60*24*14, # 2 weeks
    :secret => "leo_tamer"

  before do
    debug "params: #{params}" if $DEBUG
    if !session[:user_id] && request.path != "/login"
      redirect "/login"
    end
  end

  error do
    env['sinatra.error'].message
  end

  get "/" do
    haml :index
  end

  get "/login" do
    haml :login
  end

  post "/login" do
    session[:user_id] = params[:user_id]
    redirect "/"
  end

  get "/logout" do
    session.clear
    redirect "/login"
  end

  get "/*.html" do |temp|
    haml temp.to_sym
  end
end

require_relative "lib/config"
require_relative "lib/nodes"
require_relative "lib/buckets"
require_relative "lib/credentials"
