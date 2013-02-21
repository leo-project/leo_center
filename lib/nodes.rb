class LeoTamer
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
          joined_at: Integer(node.joined_at)
        }
      end

      { data: data }.to_json
    end

    module Nodes
      module LeoFSRelatedConfig
        Group = "LeoFS related Items"
        Properties = {
          version: "LeoFS Version",
          vm_version: "VM Version",
          log_dir: "Log Directory",
          ring_cur: "Current Ring-hash",
          ring_prev: "Previous Ring-hash"
        }
      end

      module ErlangRelatedItems
        Group = "Erlang related Items"
        Properties = {
          total_mem_usage: "Total Memory Usage",
          system_mem_usage: "System Memory Usage",
          procs_mem_usage: "Procs Memory Usage",
          ets_mem_usage: "ETS Memory Usage",
          num_of_procs: "Number of Procs",
          limit_of_procs: "Limit of Procs",
          thread_pool_size: "Thread Pool Size"
        }
      end
    end

    get "/detail.json" do
      node, type = required_params(:node, :type)

      node_stat = @@manager.status(node).node_stat

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

      if type == "Storage"
        begin
          storage_stat = @@manager.du(node)
        rescue => ex
          warn ex.message
        else
          result.push({
            name: "Total of Objects",
            value: storage_stat.total_of_objects,
            group: "Storage related Items"
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
      confirm_password
      @@manager.rebalance
    end

    post "/compaction" do
      node = required_params(:node)
      confirm_password
      @@manager.compact(node)
    end
  end
end
