#======================================================================
#
# LeoFS
#
# Copyright (c) 2012-2013 Rakuten, Inc.
#
# This file is provided to you under the Apache License,
# Version 2.0 (the "License"); you may not use this file
# except in compliance with the License.  You may obtain
# a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
#======================================================================
class LeoCenter
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
