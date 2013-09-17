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
class LeoTamer
  namespace "/endpoints" do
    before do
      check_admin
    end

    get "/list.json" do
      data = @@manager.get_endpoints.map do |endpoint|
        { endpoint: endpoint.endpoint,
          created_at: Integer(endpoint.created_at) }
      end

      { data: data }.to_json
    end

    post "/add_endpoint" do
      endpoint = required_params(:endpoint)
      @@manager.set_endpoint(endpoint)
      200
    end

    delete "/delete_endpoint" do
      endpoint = required_params(:endpoint)
      raise "You can't delete the last endpoint" if @@manager.get_endpoints.size == 1
      @@manager.delete_endpoint(endpoint)
      200
    end
  end
end
