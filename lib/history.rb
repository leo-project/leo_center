class LeoTamer
  configure do
    @@manager ||= LeoFSManager::Client.new(*Config[:managers])
  end

  namespace "/history" do
    get "/list.json" do
       #TODO
    end
  end
end
