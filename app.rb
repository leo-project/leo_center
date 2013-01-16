require "json"
require "haml"
require "sinatra/base"
require "sinatra/namespace"
require "leofs_manager_client"
require_relative "lib/helpers"

class LeoTamer < Sinatra::Base
  Version = "0.2.2"
  Config = TamerHelpers.load_config
  SessionKey = "leotamer_session" 
 
  class Error < StandardError; end

  session_config = Config[:session]
  if session_config.has_key?(:local)
    local_config = session_config[:local]
    unless local_config.has_key?(:secret)
      warn "session secret is not configured. please set it in config.yml. now LeoTamer uses random secret."
    end
    use Rack::Session::Cookie,
      key: SessionKey,
      secret: local_config[:secret] || Random.new.bytes(40),
      expire_after: local_config[:expire_after] || 300 # 5 minutes in seconds
  elsif session_config.has_key?(:redis)
    redis_config = session_config[:redis]
    unless url = redis_config[:url]
      raise Error, "redis url is required in session config. please set it in config.yml"
    end
    require "redis-rack"
    use Rack::Session::Redis,
      key: SessionKey,
      redis_server: url,
      expire_after: redis_config[:expire_after] || 300 # 5 minutes in seconds
  else
    raise Error, "invalid session config: #{session_config}"
  end

  register Sinatra::Namespace
  helpers TamerHelpers

  # error handlers don't get along with RSpec
  # disable it when environment is :test
  set :show_exceptions, environment == :test

  module Role
    roles = LeoFSManager::Client::USER_ROLES
    Admin = roles[:admin]
    Normal = roles[:normal]
  end

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

  error do
    ex = env['sinatra.error'] # Exception
    return 500, ex.message
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

    admin = credential.role_id == Role::Admin # boola
    group = ["hoge", "fuga"].sample #XXX: FAKE
    session[:admin] = admin
    session[:user_id] = user_id
    session[:group] = group
    session[:access_key_id] = credential.access_key_id # used in buckets/add_bucket
    session[:secret_access_key] = credential.secret_key

    # raw cookie to use in ExtJS
    response.set_cookie("user_id", user_id) 
    response.set_cookie("admin", admin)
    
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

  get "/*.html" do |haml_name|
    haml haml_name
  end
end

require_relative "lib/bucket_status"
require_relative "lib/user_group"
require_relative "lib/nodes"
require_relative "lib/users"
require_relative "lib/buckets"
require_relative "lib/endpoints"
require_relative "lib/system_conf"
