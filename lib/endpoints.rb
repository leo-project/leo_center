class LeoTamer
  namespace "/endpoints" do
    before do
      check_admin
    end

    get "/list.json" do
      data = @@manager.get_endpoints.map do |endpoint|
        { endpoint: endpoint.endpoint,
          created_at: endpoint.created_at }
      end

      { data: data }.to_json
    end

    post "/add_endpoint" do
      endpoint = required_params(:endpoint)
      @@manager.set_endpoint(endpoint)
      200
    end

    delete "/delete_endpoint" do
      endpoint = required_params(:endpoint)
      raise "You can't delete the last endpoint" if @@manager.get_endpoints.size == 1
      @@manager.delete_endpoint(endpoint)
      200
    end
  end
end
