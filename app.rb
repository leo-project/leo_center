require "sinatra/base"
require "sinatra/namespace"
require "json"
require "haml"
require "leofs_manager_client"

class LeoTamer < Sinatra::Base
  VERSION = "0.2.2"

  require_relative "lib/config"

  class Error < StandardError; end

  # error handlers don't get along with RSpec
  # disable it when environment is :test
  set :show_exceptions, environment == :test

  register Sinatra::Namespace
  use Rack::Session::Cookie,
    :key => "leotamer_session",
    :secret => "CHANGE ME"

  configure :test do
    #TODO: user dummy server
    @@manager = LeoFSManager::Client.new(*Config[:managers])
  end

  configure :production, :development do
    @@manager = LeoFSManager::Client.new(*Config[:managers])

    before do
      debug "params: #{params}"
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
  end

  helpers do
    def debug(str)
      puts str if $DEBUG
    end

    def required_params(*params_to_check)
      request_params = params
      noexist_params = params_to_check.reject {|param| request_params[param] }
      unless noexist_params.empty?
        noexist_params.map! {|param| "'#{param}'" }
        raise "parameter #{noexist_params.join(" ")} are required"
      end
      if params_to_check.size == 1
        request_params[params_to_check.first]
      else
        params_to_check.map {|param| request_params[param] }
      end
    end

    def required_sessions(*keys_to_check)
      valid = keys_to_check.all? {|key| session.has_key?(key) }
      raise "invalid session" unless valid
      if keys_to_check.size == 1
        session[keys_to_check.first]
      else
        keys_to_check.map {|key| session[key] }
      end
    end

    # error msg for Ext.form
    def json_err_msg(msg)
      { 
        success: false,
        errors: {
          reason: msg
        }
      }.to_json
    end
  end

  error do
    ex = env['sinatra.error'] # Exception
    return 500, ex.message
  end

  after "*.json" do
    p response
  end

  get "/" do
    haml :index
  end

  post "/sign_up" do
    user_id, password = required_params(:user_id, :password)
    begin
      credential = @@manager.create_user(user_id, password)
    rescue RuntimeError => ex
      halt 200, json_err_msg(ex.message)
    end
    { success: true }.to_json
  end

  get "/login" do
    redirect "/" if session[:user_id]
    haml :login
  end

  post "/login" do
    user_id, password = required_params(:user_id, :password)

    begin
      credential = @@manager.login(user_id, password)
    rescue RuntimeError
      halt 200, json_err_msg("Invalid User ID or Password.")
    end

    # not admin user
    if credential.role_id != 9
      halt 200, json_err_msg("You are not authorized. Please contact the administrator.")
    end

    session[:user_id] = user_id
    session[:role_id] = credential.role_id
    session[:access_key_id] = credential.access_key_id
    session[:secret_access_key] = credential.secret_key
    response.set_cookie("user_id", user_id) # raw cookie to use in ExtJS
    
    { success: true }.to_json
  end

  get "/logout" do
    session.clear
    redirect "/login"
  end

  get "/user_credential" do
    required_sessions(:access_key_id, :secret_access_key)
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
