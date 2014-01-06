#======================================================================
#
# LeoFS
#
# Copyright (c) 2012-2014 Rakuten, Inc.
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
  namespace "/whereis" do
    before do
      halt 401 unless session[:admin]
    end

    get "/list.json" do
      path = required_params(:path)
      {
        data: @@manager.whereis(path).map do |whereis|
          {
            node: whereis.node,
            vnode_id: whereis.vnode_id,
            size: whereis.size,
            clock: whereis.clock,
            checksum: whereis.checksum,
            timestamp: whereis.timestamp.to_i,
            delete: whereis.delete,
            num_of_chunks: whereis.num_of_chunks
          }
        end
      }.to_json
    end
  end
end
