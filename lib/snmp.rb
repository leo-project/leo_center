class LeoTamer
  namespace "/snmp" do
    before do
      check_admin
    end

    helpers do
      def get_snmp_data(node)
        gf = GF::Client.new("localhost", 5125)
        gf_data = Config[:snmp].map do |graph|
          gf.export("LeoFS", node, URI.decode(graph), t: "8h")
        end
        first = gf_data.first
        start = first[:start_timestamp]
        step = first[:step]
        rows = gf_data.map {|data| data[:rows] }
        rows.each(&:flatten!)
        rows.each(&:pop) # remove last nil
        merged_data = rows.shift.zip(*rows)
        ext_data = merged_data.map.with_index do |value, index|
          { 
            x: start + step * index,
            y: value[0],
            y1: value[1],
            y2: value[2]
          }
        end
        ext_data.unshift({
          x: ext_data.first[:x].pred, y: 0, y1: 0, y2: 0
        })
        return ext_data
      end
    end

    get "/chart.json" do
      node = required_params(:node)
      {
        data: get_snmp_data(node)
      }.to_json
    end
  end
end
