# ======================================================================
#
#  Leo Tamer
#
#  Copyright (c) 2012 Rakuten, Inc.
#
#  This file is provided to you under the Apache License,
#  Version 2.0 (the "License"); you may not use this file
#  except in compliance with the License.  You may obtain
#  a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing,
#  software distributed under the License is distributed on an
#  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
#  specific language governing permissions and limitations
#  under the License.
#
# ======================================================================
class LeoTamer
  namespace "/user_group" do
=begin
    before do
      halt 401 unless session[:admin]
    end
=end
    get "/list.json" do
      users = @@manager.get_users

      #TODO: filter user own group

      result = users.map do |user|
        {
          user_id: user.user_id,
          role: user.role.to_s,
          group: ["hoge", "fuga"].sample,
          access_key_id: user.access_key_id,
          created_at: user.created_at
        }
      end

      { data: result }.to_json
    end

    get "/name_list.json" do
      %w{hoge fuga}.to_json
    end

    post "/add_group" do
      group = required_params(:group)
    end

    post "/update_group" do
      group = required_params(:group)
    end

    delete "/delete_group" do
      group = required_params(:group)
    end

    post "/add_user.json" do
      group, user_id = required_params(:group, :user_id)
      p group, user_id
      # TODO
      { success: true }.to_json
    end
  end
end
