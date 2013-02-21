class LeoTamer
  namespace "/bucket_status" do
    get "/list.json" do
      begin
        buckets = @@manager.get_buckets
      rescue RuntimeError => ex
        return { data: [] }.to_json if ex.message == "not found" # empty
        raise ex
      end

      buckets.select! {|bucket| bucket.owner == session[:user_id] }

      result = buckets.map do |bucket|
        {
          name: bucket.name,
          owner: bucket.owner,
          created_at: Integer(bucket.created_at)
        }
      end

      { data: result }.to_json
    end
  end
end
