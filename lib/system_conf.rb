class LeoTamer
  module SystemConf; end

  namespace "/system_conf" do
    SystemConf::Properties = [
      :version, :n, :r, :w, :d, #:ring_size, :ring_cur, :ring_prev
    ]

    SystemConf::NameMap = {
      n: "Number of replicas",
      r: "Number of successful READ",
      w: "Number of successful WRITE",
      d: "Number of successful DELETE"
    }

    get "/list.json" do
      system_info = @@manager.status.system_info

      data = SystemConf::Properties.map do |property|
        name = SystemConf::NameMap[property] || property.to_s
        name[0] = name[0].upcase
        {
          name: name,
          value: system_info.__send__(property)
        }
      end

      { data: data }.to_json
    end
  end
end
