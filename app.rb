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
    :key => "leotamer_session",
    :secret => "CHANGE ME"

  before do
    debug "params: #{params}" if $DEBUG
    unless session[:user_name]
      case request.path
      when "/login"
        # don't redirect
      when "/"
        redirect "/login"
      else
        halt 401
      end
    end
  end

  error do
    env['sinatra.error'].message
  end

  get "/" do
    haml :index
  end

  get "/login" do
    # halt 500 unless request.secure?
    redirect "/" if session[:user_name]
    haml :login
  end

  post "/login" do
    user_name = params[:user_name]
    session[:user_name] = user_name
    response.set_cookie("user_name", user_name) # used in ExtJS
    { success: true }.to_json
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
require_relative "lib/endpoints"
require_relative "lib/credentials"
