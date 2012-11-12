require 'leofs_manager_client'

class LeoTamer
  configure do
    @@manager ||= LeoFSManager::Client.new(*Config[:managers])
  end

  namespace "/endpoints" do
    get "/list.json" do
      nil
    end
  end
end
