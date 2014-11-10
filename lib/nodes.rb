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

        { type: type,
          node: node.node,
          status: node.state,
          ring_hash_current: node.ring_cur,
          ring_hash_previous: node.ring_prev,
          joined_at: Integer(node.joined_at) }
      end

      { data: data }.to_json
    end

    module Nodes
      module LeoFSRelatedConfig
        Group = "1. Applicaion"
        Properties = {
          version:   "App version",
          log_dir:   "Log directory",
          ring_cur:  "Current ring-hash",
          ring_prev: "Previous ring-hash"
        }
      end

      ## ErlangVM-related items
      module ErlangRelatedItems
        Group = "2. Erlang VM"
        Properties = {
          vm_version:       "VM version",
          total_mem_usage:  "Total memory usage",
          system_mem_usage: "System memory usage",
          procs_mem_usage:  "Procs memory usage",
          ets_mem_usage:    "ETS memory usage",
          num_of_procs:     "# of procs",
          limit_of_procs:   "Limit of procs",
          thread_pool_size: "Thread pool size"
        }
      end

      ## Storage-related items
      module StorageStatus
        Group = "3. Storage"
        Properties = {
          active_num_of_objects:  "# of active objects",
          total_num_of_objects:   "Total # of objects",
          active_size_of_objects: "Active size of objects",
          total_size_of_objects:  "Total size of objects"
        }
      end

      module CompactStatus
        Group = "4. Compaction Status"
        Properties = {
          status: "Current Status",
          total_targets:          "Total # of targets",
          num_of_pending_targets: "# of pending targets",
          num_of_ongoing_targets: "# of ongoing targets",
          num_of_out_of_targets:  "# of out of targets"
        }
      end

      module StorageWatchdog
        Group = "5. Watchdog"
        Properties = {
          wd_rex_interval: "rex - Watch interval(sec)",
          wd_rex_threshold_mem_capacity: "rex - Threshold mem capacity",
          wd_cpu_enabled:  "cpu - watchdog enabled?",
          wd_cpu_interval: "cpu - watch interval(sec)",
          wd_cpu_threshold_cpu_load_avg: "cpu - threshold cpu load AVG",
          wd_cpu_threshold_cpu_util: "cpu - threshold cpu uiil(%)",
          wd_io_enabled:  "io - watchdog enabled?",
          wd_io_interval: "io - watch interval(sec)",
          wd_io_threshold_input_per_sec:  "io - threshold input/sec",
          wd_io_threshold_output_per_sec: "io - threshold output/sec",
          wd_disk_enabled:  "disk - watchdog enabled?",
          wd_disk_interval: "disk - watch interval(sec)",
          wd_disk_threshold_disk_use:  "disk - threshold disk use(%)",
          wd_disk_threshold_disk_util: "disk - threshold disk util(%)"
        }
      end

      module Messages
        Group = "6. Total # of Messages"
        Properties = {
          replication_msgs: "# of replication messages",
          sync_vnode_msgs:  "# of sync-vnode messages",
          rebalance_msgs:   "# of rebalance messages"
        }
      end

      ## Gateway-related items
      module GatewayWebServerConfig
        Group = "3. Http Server"
        Properties = {
          handler: "API",
          port: "Port",
          ssl_port: "SSL port",
          num_of_acceptors: "# of acceptors"
        }
      end

      module GatewayCacheConfig
        Group = "4. Cache"
        Properties = {
          http_cache: "Use HTTP cahce?",
          cache_workers: "# of cache workers",
          cache_expire:  "Cache expire in sec",
          cache_ram_capacity: "Memory-cache capacity",
          cache_disc_capacity: "Disc-cache capacity",
          cache_disc_threshold_len: "Threshold of size of disc-cache",
          cache_disc_dir_data: "Disc-cache's data directory",
          cache_disc_dir_journal: "Disc-cache journal directory",
          cache_max_content_len: "Max size of an object"
        }
      end

      module GatewayLargeObjConfig
        Group = "5. Large object"
        Properties = {
          max_chunked_objs: "Max # of chunked objects",
          max_len_for_obj: "Max size of an object",
          chunked_obj_len: "Size of a chunked object",
          threshold_of_chunk_len: "Threshold of size of an object"
        }
      end

      module GatewayWatchdog
        Group = "6. Watchdog"
        Properties = {
          wd_rex_interval: "rex - Watch interval(sec)",
          wd_rex_threshold_mem_capacity: "rex - Threshold mememory capacity",
          wd_cpu_enabled:  "cpu - watchdog enabled?",
          wd_cpu_interval: "cpu - watch interval(sec)",
          wd_cpu_threshold_cpu_load_avg: "cpu - threshold cpu load AVG",
          wd_cpu_threshold_cpu_util: "cpu - threshold cpu uiil(%)",
          wd_io_enabled:  "io - watchdog enabled?",
          wd_io_interval: "io - watch interval(sec)",
          wd_io_threshold_input_per_sec:  "io - threshold input/sec",
          wd_io_threshold_output_per_sec: "io - threshold output/sec"
        }
      end
    end

    get "/detail.json" do
      node, type = required_params(:node, :type)
      node_stat  = @@manager.status(node).node_stat
      storage_stat = @@manager.status(node).storage_stat
      gateway_stat = @@manager.status(node).gateway_stat

      ## Common property/status
      result = Nodes::LeoFSRelatedConfig::Properties.map do |property, text|
        {
          name: text,
          value: node_stat.__send__(property),
          group: Nodes::LeoFSRelatedConfig::Group
        }
      end

      result.concat(Nodes::ErlangRelatedItems::Properties.map do |property, text|
        {
          name: text,
          value: node_stat.__send__(property),
          group: Nodes::ErlangRelatedItems::Group
        }
      end)

      case type
        when "Storage" then
        begin
          file_stat = @@manager.du(node)
          compact_stat = @@manager.compact_status(node)
        rescue => ex
          warn ex.message
        else
          ## storage staus
          result.concat(Nodes::StorageStatus::Properties.map do |property, text|
                          { name: text,
                            value: file_stat.__send__(property),
                            id: property,
                            group: Nodes::StorageStatus::Group
                          } end)

          result.push({ name: "Ratio of Active Size",
                        value: "#{file_stat.ratio_of_active_size}%",
                        id: "ratio_of_active_size",
                        group: Nodes::StorageStatus::Group
                      })

          ## compaction status
          result.concat(Nodes::CompactStatus::Properties.map do |property, text|
                          { name: text,
                            value: compact_stat.__send__(property),
                            id: property,
                            group: Nodes::CompactStatus::Group
                          } end)

          result.push({ name: "Last Compaction Start",
                        value: compact_stat.last_compaction_start.to_i,
                        id: "last_compaction_start",
                        group: Nodes::StorageStatus::Group
                      })

          ## # of messages in the queue
          result.concat(Nodes::Messages::Properties.map do |property, text|
                          { name: text,
                            value: storage_stat.__send__(property),
                            id: property,
                            group: Nodes::Messages::Group
                          } end)

          ## watchdog-settings
          result.concat(Nodes::StorageWatchdog::Properties.map do |property, text|
                          { name: text,
                            value: node_stat.__send__(property),
                            id: property,
                            group: Nodes::StorageWatchdog::Group
                          } end)
        end

        when "Gateway" then
        begin
          ## http-server config
          result.concat(Nodes::GatewayWebServerConfig::Properties.map do |property, text|
                          { name: text,
                            value: gateway_stat.__send__(property),
                            id: property,
                            group: Nodes::GatewayWebServerConfig::Group
                          } end)

          ## cache config
          result.concat(Nodes::GatewayCacheConfig::Properties.map do |property, text|
                          { name: text,
                            value: gateway_stat.__send__(property),
                            id: property,
                            group: Nodes::GatewayCacheConfig::Group
                          } end)

          ## large-object config
          result.concat(Nodes::GatewayLargeObjConfig::Properties.map do |property, text|
                          { name: text,
                            value: gateway_stat.__send__(property),
                            id: property,
                            group: Nodes::GatewayLargeObjConfig::Group
                          } end)

          ## watchdog-settings
          result.concat(Nodes::GatewayWatchdog::Properties.map do |property, text|
                          { name: text,
                            value: node_stat.__send__(property),
                            id: property,
                            group: Nodes::GatewayWatchdog::Group
                          } end)
        end
      end

      { data: result }.to_json
    end


    post "/execute" do
      node, command = required_params(:node, :command)
      command = command
      confirm_password

      case command
      when "resume", "suspend", "detach"
        @@manager.__send__(command, node)
      else
        raise "invalid operation command: #{command}"
      end
      200
    end

    post "/rebalance" do
      confirm_password
      @@manager.rebalance
    end

    post "/compact_start" do
      node, num_of_targets, num_of_compact_proc = required_params(:node, :num_of_targets, :num_of_compact_proc)
      @@manager.compact_start(node, Integer(num_of_targets), Integer(num_of_compact_proc))
    end

    post "/compact_suspend" do
      node = required_params(:node)
      @@manager.compact_suspend(node)
    end

    post "/compact_resume" do
      node = required_params(:node)
      @@manager.compact_resume(node)
    end
  end
end
