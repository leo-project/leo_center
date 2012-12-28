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
  namespace "/bucket_status" do
    get "/list.json" do
      begin
        buckets = @@manager.get_buckets
      rescue RuntimeError => ex
        return { data: [] }.to_json if ex.message == "not found" # empty
        raise ex
      end

      buckets.select! {|bucket| bucket.owner == session[:user_id] }

      result = buckets.map do |bucket|
        {
          name: bucket.name,
          owner: bucket.owner,
          created_at: bucket.created_at
        }
      end

      { data: result }.to_json
    end
  end
end
