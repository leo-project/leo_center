class LeoTamer
  namespace "/snmp" do
    before do
      check_admin
    end

    helpers do
      def gf2ext(service_name, section_name, graph)
        gf = GF::Client.new("localhost", 5125)
        data = gf.export(service_name, section_name, graph, t: "h")
        p data
        start = data[:start_timestamp]
        step = data[:step]
        rows = data[:rows]
        rows.flatten!
        return rows.map.with_index do |value, index|
          { x: start + step * index, y: value || 0 }
        end
      end
    end

    get "/erlang_vm.json" do
      node = required_params(:node)
      data = Array.new (50) do |n|
        { x: n, y: rand(100) }
      end
      data = gf2ext("LeoFS", "Storage", "ETS memory usage (1-min Averages)")
      {
        data: data
      }.to_json
    end

    get "/chart.json" do
      data = gf2ext("LeoFS", "Storage", "number_of_processes_1min_avg")
      {
        data: data
      }.to_json
    end
  end
end
