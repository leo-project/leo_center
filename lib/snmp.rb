class LeoTamer
  namespace "/snmp" do
    before do
      check_admin
    end

    helpers do
      def get_snmp_data(node, period)
        gf = GF::Client.new("localhost", 5125)
        gf_data = Config[:snmp].map do |graph|
          gf.export("LeoFS", node, URI.decode(graph), t: period)
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
            time: start + step * index,
            ets: value[0],
            procs: value[1],
            sys: value[2]
          }
        end
        ext_data.unshift({
          time: ext_data.first[:time].pred, ets: 0, procs: 0, sys: 0
        })
        return ext_data
      end
    end

    get "/chart.json" do
      node, period = required_params(:node, :period)
      {
        data: get_snmp_data(node, period)
      }.to_json
    end
  end
end
