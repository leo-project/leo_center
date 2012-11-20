require 'leofs_manager_client'

class LeoTamer
  configure do
    @@manager ||= LeoFSManager::Client.new(*Config[:managers])
  end

  namespace "/credentials" do
    get "/list.json" do
      keys = @@manager.s3_get_keys
      result = keys.map do |user|
        {
          :user_id => user.user_id,
          :access_key_id => user.access_key_id,
          :created_at => user.created_at
        }
      end

      { data: result }.to_json
    end
  end
end
