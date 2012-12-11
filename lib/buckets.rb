class LeoTamer
  namespace "/buckets" do
    get "/list.json" do
      begin
        buckets = @@manager.s3_get_buckets
      rescue RuntimeError => ex
        return { data: [] }.to_json if ex.message == "Not Found"
      end

      result = buckets.map do |bucket|
        { 
          :name => bucket.name,
          :owner => bucket.owner,
          :created_at => bucket.created_at,
          :dummy => rand(100),
          :dummy2 => rand(100)
        }
      end
      { data: result }.to_json
    end

    post "/add_bucket" do
      bucket_name = params[:bucket]
      halt 500, "parameter 'endpoint' is required" unless endpoint
      access_key = session[:access_key_id]
      halt 500, "invalid session" unless access_key
      begin
        @@manager.s3_add_bucket(bucket_name, access_key)
      rescue => ex
        halt 500, ex.message
      end
      200
    end
  end
end
