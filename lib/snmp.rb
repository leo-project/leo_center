class LeoTamer
  namespace "/snmp" do
    before do
      check_admin
    end

    helpers do
      def gf2ext(service_name, section_name, graph)
        gf = GF::Client.new("localhost", 5125)
        data = gf.export(service_name, section_name, graph, t: "h")
        start = data[:start_timestamp]
        step = data[:step]
        rows = data[:rows]
        rows.flatten!
        return rows.map.with_index do |value, index|
          { x: start + step * index, y: value || 0 }
        end
      end

      def cmp2ext(pattern)
        gf = GF::Client.new("localhost", 5125)
        data = gf.export_complex("AREA:31:gauge:0:AREA:33:gauge:1:AREA:9:gauge:1", t: "h")
        p data
        start = data[:start_timestamp]
        step = data[:step]
        rows = data[:rows]
        ext = rows.map.with_index do |value, index|
          {
            x: start + step * index,
            y: value[0] || 0,
            y1: value[1] || 0,
            y2: value[1] || 0
          }
        end
        ext.unshift({
          x: ext.first[:x].pred, y: 0, y1: 0, y2: 0
        })
        return ext
      end
    end

    get "/erlang_vm.json" do
      node = required_params(:node)
      cmp2ext(nil)
      data = Array.new (50) do |n|
        { x: n, y: rand(100) }
      end
      #data = gf2ext("LeoFS", "Storage", "ETS memory usage (5-min Averages)")
      data = cmp2ext(nil)
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
