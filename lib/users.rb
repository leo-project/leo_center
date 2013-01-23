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
  namespace "/users" do
    before do
      halt 401 unless session[:admin]
    end

    get "/list.json" do
      keys = @@manager.get_users
      result = keys.map do |user|
        {
          user_id: user.user_id,
          role: user.role.to_s,
          access_key_id: user.access_key_id,
          created_at: user.created_at
        }
      end

      { data: result }.to_json
    end

    post "/add_user" do
      user_id = required_params(:user_id)
      @@manager.create_user(user_id)
      200
    end

    delete "/delete_user" do
      confirm_password
      user_id_to_delete = required_params(:user_id_to_delete)
      user_self = required_sessions(:user_id)
      raise "You can't modify your own role" if user_id_to_delete == user_self
      @@manager.delete_user(user_id_to_delete)
      200
    end

    post "/update_user" do
      user_id, role_id = required_params(:user_id, :role_id)
      user_self = required_sessions(:user_id)
      raise "You can't modify your own role" if user_id == user_self
      role_id = Integer(role_id)
      @@manager.update_user_role(user_id, role_id)
      200
    end
  end
end
