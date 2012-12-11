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
    unless session[:user_id]
      case request.path
      when "/login", "/sign_up"
        # don't redirect
      when "/"
        redirect "/login"
      else
        halt 401
      end
    end
  end

  helpers do
    def required_params(*params_to_check)
      request_params = params
      noexist_params = params_to_check.reject {|param| request_params[param] }
      unless noexist_params.empty?
        noexist_params.map! {|param| "'#{param}'" }
        halt 500, "parameter #{noexist_params.join(" ")} is required"
      end
      params_to_check.map {|param| request_params[param] }
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
    begin
      credential = @@manager.s3_create_user(user_id, password)
    rescue RuntimeError => ex
      { 
        success: false,
        errors: {
          reason: ex.message
        }
      }.to_json
    else
      { success: true }.to_json
    end
  end

  get "/login" do
    # halt 500 unless request.secure?
    redirect "/" if session[:user_id]
    haml :login
  end

  post "/login" do
    user_id = params[:user_id]
    password = params[:password]
    begin
      credential = @@manager.login(user_id, password)
    rescue RuntimeError => ex
      { 
        success: false,
        errors: {
          reason: "Invalid User ID or Password."
        }
      }.to_json
    else
      session[:user_id] = user_id
      session[:role_id] = credential.role_id
      session[:access_key_id] = credential.access_key_id
      session[:secret_access_key] = credential.secret_key
      response.set_cookie("user_id", user_id) # used in ExtJS
      { success: true }.to_json
    end
  end

  get "/logout" do
    session.clear
    redirect "/login"
  end

  get "/user_credential.json" do
    <<-EOS
      AWS_ACCESS_KEY_ID: #{session[:access_key_id]}<br>
      AWS_SECRET_ACCESS_KEY: #{session[:secret_access_key]}
    EOS
  end

  get "/*.html" do |temp|
    haml temp.to_sym
  end
end

require_relative "lib/nodes"
require_relative "lib/buckets"
require_relative "lib/endpoints"
require_relative "lib/users"
