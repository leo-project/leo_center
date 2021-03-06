# ======================================================================
#
#  Leo Center
#
#  Copyright (c) 2012-2014 Rakuten, Inc.
#
#  This file is provided to you under the Apache License,
#  Version 2.0 (the "License"); you may not use this file
#  except in compliance with the License.  You may obtain
#  a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing,
#  software distributed under the License is distributed on an
#  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
#  specific language governing permissions and limitations
#  under the License.
#
# ======================================================================
gem "sinatra", "~> 1.4.3"
gem "leo_manager_client", "~> 0.4.9"

require "json"
require "haml"
require "sinatra/base"
require "sinatra/namespace"
require "logger"
require "leo_manager_client"
require_relative "lib/helpers"


class LoggerEx < Logger
  alias write <<
end

class LeoCenter < Sinatra::Base
  Version = "0.4.6"
  set :environment, :production
  Config = CenterHelpers.load_config
  SessionKey = "leofs_console_session"

  class Error < StandardError; end

  session_config = Config[:session]
  if session_config.has_key?(:local)
    local_config = session_config[:local]
    unless local_config.has_key?(:secret)
      warn "session secret is not configured. please set it in config.yml. now LeoCenter uses random secret."
    end
    use Rack::Session::Cookie,
    key: SessionKey,
    secret: local_config[:secret] || Random.new.bytes(40),
    expire_after: local_config[:expire_after] || 300 # 5 minutes in seconds
  else
    raise Error, "invalid session config: #{session_config}"
  end

  register Sinatra::Namespace
  helpers CenterHelpers

  helpers do
    def confirm_password
      user_id = required_sessions(:user_id)
      password = required_params(:password)
      begin
        credential = @@manager.login(user_id, password)
      rescue RuntimeError
        halt 401, "Invalid User ID or Password."
      end
      return credential
    end
  end

  # error handlers don't get along with RSpec
  # disable it when environment is :test
  set :show_exceptions, environment == :test

  module Role
    roles = LeoManager::Client::USER_ROLES
    Admin = roles[:admin]
    Normal = roles[:normal]
  end

  configure :test do
    #TODO: user dummy server
    @@manager = LeoManager::Client.new(*Config[:managers])
  end

  configure :production, :development do
    @@manager = LeoManager::Client.new(*Config[:managers])

    enable :logging
    access_log = File.new("#{settings.root}/log/#{settings.environment}_access.log", 'a+')
    access_log.sync = true
    use Rack::CommonLogger, access_log

    before do
      debug "params: #{params}"
      unless session[:user_id]
        case request.path
        when "/login", "/logout", "/sign_up"
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
    admin = credential.role_id == Role::Admin # bool
    user_id = credential.id
    group = ["group_1", "group_2"].sample # @TODO
    session[:admin]   = admin
    session[:user_id] = user_id
    session[:group]   = group
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

  post "/user_credential" do
    confirm_password
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
require_relative "lib/whereis"
require_relative "lib/growthforecast"
require_relative "lib/snmp"
CenterHelpers.load_plugins
