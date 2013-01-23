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

    # property: "text"
    Nodes::Properties = {
      version: "LeoFS Version",
      vm_version: "VM Version",
      log_dir: "Log Directory",
      ring_cur: "Current Ring-hash",
      ring_prev: "Previous Ring-hash",
      total_mem_usage: "Total Memory Usage",
      system_mem_usage: "System Memory Usage",
      procs_mem_usage: "Procs Memory Usage",
      ets_mem_usage: "ETS Memory Usage",
      num_of_procs: "Number of Procs",
      limit_of_procs: "Limit of Procs",
      thread_pool_size: "Thread Pool Size"
    }

    Nodes::DetailGridDummyGrouping = "Config/VM Status"

    get "/detail.json" do
      node, type = required_params(:node, :type)

      node_stat = @@manager.status(node).node_stat

      result = Nodes::Properties.map do |property, text|
        { 
          name: text,
          value: node_stat.__send__(property),
          group: Nodes::DetailGridDummyGrouping
        }
      end

      if type == "Storage"
        begin
          storage_stat = @@manager.du(node)
        rescue => ex
          warn ex.message
        else
          result.push({
            name: "Total of Objects",
            value: storage_stat.total_of_objects,
            group: Nodes::DetailGridDummyGrouping
          })
        end
      end

      { data: result }.to_json
    end

    post "/execute" do
      node, command = required_params(:node, :command)
      command = command.to_sym
      confirm_password

      case command
      when :resume, :suspend, :detach
        @@manager.__send__(command, node)
      else
        raise "invalid operation command: #{command}"
      end
      200
    end

    post "/rebalance" do
      @@manager.rebalance
    end
  end
end
