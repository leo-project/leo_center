class LeoTamer
  module SystemConf; end

  namespace "/system_conf" do
    SystemConf::Properties = {
      version: "Version",
      n: "Number of replicas",
      r: "Number of successful READ",
      w: "Number of successful WRITE",
      d: "Number of successful DELETE"
    }

    get "/list.json" do
      system_info = @@manager.status.system_info

      data = SystemConf::Properties.map do |property, text|
        {
          name: text,
          value: system_info.__send__(property)
        }
      end

      { data: data }.to_json
    end
  end
end
