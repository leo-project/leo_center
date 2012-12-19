class LeoTamer
  namespace "/endpoints" do
    get "/list.json" do
      data = @@manager.get_endpoints.map do |endpoint|
        { :endpoint => endpoint.endpoint,
          :created_at => endpoint.created_at }
      end

      { :data => data }.to_json
    end

    post "/add_endpoint" do
      endpoint = required_params(:endpoint)
      @@manager.set_endpoint(endpoint)
      200
    end

    delete "/delete_endpoint" do
      endpoint = required_params(:endpoint)
      @@manager.delete_endpoint(endpoint)
      200
    end
  end
end
