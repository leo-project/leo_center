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
      @@manager.s3_set_endpoint(endpoint)
      nil
    end
  end
end
