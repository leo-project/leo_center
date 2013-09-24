# ======================================================================
#
#  Leo Center
#
#  Copyright (c) 2012 Rakuten, Inc.
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
require 'openssl'
require 'webrick/https'

require "./app"

Config = CenterHelpers.load_config
ssl_config = Config[:ssl]
 
# decide http or https
if ssl_config.nil? || ssl_config[:ssl_enable].nil? ||
   ssl_config[:crt_path].nil? || ssl_config[:key_path].nil? || !ssl_config[:ssl_enable]
 
  # start http
  LeoCenter.run!(:port => (ARGV[0] || 80))
 
else
 
  # start https
  webrick_options = {
    :Port               => (ARGV[0] || 443),
    :Logger             => WEBrick::Log::new($stdout, WEBrick::Log::DEBUG),
    :DocumentRoot       => "./public",
    :SSLEnable          => ssl_config[:ssl_enable],
    :SSLCertificate     => OpenSSL::X509::Certificate.new(  File.open(ssl_config[:crt_path]).read),
    :SSLPrivateKey      => OpenSSL::PKey::RSA.new(          File.open(ssl_config[:key_path]).read),
    :SSLCertName        => [ [ "CN",WEBrick::Utils::getservername ] ]
  }
  Rack::Handler::WEBrick.run LeoCenter, webrick_options do |server|
    shutdown_proc = ->( sig ){ server.shutdown() }
    [ :INT, :TERM ].each{ |e| Signal.trap( e, &shutdown_proc ) }
  end
 
end
