require "open-uri"
require "json"

module GrowthForecast
  class Client
    def initialize(host, port)
      @host = host.freeze
      @port = port
      @base_uri = "http://#{@host}:#{@port}/".freeze
    end

    attr_reader :host, :port

    def export(service_name, section_name, graph, opt=nil)
      uri_encode!(service_name, section_name, graph)
      path = "xport/#{service_name}/#{section_name}/#{graph}"
      if opt && opt.is_a?(Hash)
        path.concat("?")
        param_str = opt.map {|k, v| "#{k}=#{URI.encode(v)}" }.join("&")
        path.concat(param_str)
      end
      return request(path)
    end

    def export_complex(pattern, opt=nil)
      uri_encode!(pattern)
      path = "xport/#{pattern}"
      if opt && opt.is_a?(Hash)
        path.concat("?")
        param_str = opt.map {|k, v| "#{k}=#{URI.encode(v)}" }.join("&")
        path.concat(param_str)
      end
      p path
      return request(path)
    end

    private

    JSON_OPTS = {
      symbolize_names: true
    }

    def request(path)
      json = OpenURI.open_uri(@base_uri + path).read
      return JSON.parse(json, JSON_OPTS)
    end

    def uri_encode!(*args)
      args.each do |arg|
        arg.replace(URI.encode(arg))
      end
    end
  end
end

GF = GrowthForecast # alias
