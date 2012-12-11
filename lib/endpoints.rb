class LeoTamer
  namespace "/endpoints" do
    get "/list.json" do
      data = @@manager.s3_get_endpoints.map do |endpoint|
        { :endpoint => endpoint.endpoint,
          :created_at => endpoint.created_at }
      end

      { :data => data }.to_json
    end

    post "/add_endpoint" do
      endpoint = params[:endpoint]
      halt 500, "parameter 'endpoint' is required" unless endpoint
      @@manager.s3_set_endpoint(endpoint)
      200
    end

    delete "/delete_endpoint" do
      endpoint = params[:endpoint]
      halt 500, "parameter 'endpoint' is required" unless endpoint
      @@manager.s3_delete_endpoint(endpoint)
      200
    end
  end
end
