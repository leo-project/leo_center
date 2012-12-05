require "sinatra/base"
require "sinatra/namespace"
require "json"
require "haml"
require "leofs_manager_client"

class LeoTamer < Sinatra::Base
  require_relative "lib/config"

  class Error < StandardError; end

  def debug(str)
    puts str if $DEBUG
  end

  register Sinatra::Namespace
  use Rack::Session::Cookie,
    :key => "leotamer_session",
    :secret => "CHANGE ME"
  
  configure do
    @@manager = LeoFSManager::Client.new(*Config[:managers])
  end

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

  post "/sign_up" do
    user_id = params[:user_id]
    password = params[:password]
    @@manager.s3_create_user(user_id, password)
  end

  get "/login" do
    # halt 500 unless request.secure?
    redirect "/" if session[:user_name]
    haml :login
  end

  post "/login" do
    user_id = params[:user_id]
    password = params[:password]
    #@@manager.login(user_id, password) rescue return haml :login_error
    session[:user_id] = user_id
    response.set_cookie("user_id", user_id) # used in ExtJS
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

require_relative "lib/nodes"
require_relative "lib/buckets"
require_relative "lib/endpoints"
require_relative "lib/credentials"
