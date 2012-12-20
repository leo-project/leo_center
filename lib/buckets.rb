class LeoTamer
  namespace "/buckets" do
    get "/list.json" do
      begin
        buckets = @@manager.get_buckets
      rescue RuntimeError => ex
        return { data: [] }.to_json if ex.message == "not found" # empty
        raise ex
      end

      result = buckets.map do |bucket|
        { 
          name: bucket.name,
          owner: bucket.owner,
          created_at: bucket.created_at
        }
      end

      { data: result }.to_json
    end

    post "/add_bucket" do
      bucket_name = required_params(:bucket)
      access_key = required_sessions(:access_key_id)
      @@manager.add_bucket(bucket_name, access_key)
      200
    end
  end
end
