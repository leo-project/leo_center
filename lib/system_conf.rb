class LeoTamer
  module SystemConf; end

  namespace "/system_conf" do
    SystemConf::Properties = [
      :version, :n, :r, :w, :d, :ring_size, :ring_cur, :ring_prev
    ]

    get "/list.json" do
      system_info = @@manager.status.system_info

      data = SystemConf::Properties.map do |property|
        {
          name: property,
          value: system_info.__send__(property)
        }
      end

      { data: data }.to_json
    end
  end
end
