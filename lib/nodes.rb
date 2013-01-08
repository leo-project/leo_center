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
  module Nodes; end;

  namespace "/nodes" do
    before do
      halt 401 unless session[:admin]
    end

    get "/list.json" do
      {
        data: @@manager.status.node_list.map do |node|
          { name: node.node }
        end
      }.to_json
    end

    get "/status.json" do
      node_list = @@manager.status.node_list
      data = node_list.map do |node|
        case node.type
        when "S"
          type = "Storage"
        when "G"
          type = "Gateway"
        else
          raise Error, "unknown node type: #{node.type}"
        end

        {
          type: type,
          node: node.node,
          status: node.state,
          ring_hash_current: node.ring_cur,
          ring_hash_previous: node.ring_prev,
          joined_at: node.joined_at
        }
      end

      { data: data }.to_json
    end

    Nodes::Properties = [
      :version, :vm_version, :log_dir, :ring_cur, :ring_prev, :total_mem_usage,
      :system_mem_usage, :procs_mem_usage, :ets_mem_usage, :num_of_procs,
      :limit_of_procs, :thread_pool_size
    ]

    get "/detail.json" do
      node, type = required_params(:node, :type)

      node_stat = @@manager.status(node).node_stat

      result = Nodes::Properties.map do |property|
        { name: property.to_s.gsub("_", " "), value: node_stat.__send__(property) }
      end

      if type == "Storage"
        begin
          storage_stat = @@manager.du(node)
        rescue => ex
          warn ex.message
        else
          result.push({
            name: "total_of_objects",
            value: storage_stat.total_of_objects
          })
        end
      end

      { data: result }.to_json
    end

    post "/execute" do
      node, command = required_params(:node, :command)
      command = command.to_sym

      case command
      when :resume, :suspend, :detach
        @@manager.__send__(command, node)
      else
        raise "invalid operation command: #{command}"
      end
      200
    end
  end
end
