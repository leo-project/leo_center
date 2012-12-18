class LeoTamer
  namespace "/nodes" do
    get "/list.json" do
      { 
        data: @@manager.status.node_list.map do |node|
          { name: node.node }
        end
      }.to_json
    end

    get "/status.json" do
      required_params(:group)
      node_list = @@manager.status.node_list
      data = node_list.map do |node|
        case node.type
        when "S"
          type = "Storage"
        when "G"
          type = "Gateway"
        else
          raise Error, "invalid node type: #{node.type}"
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

    get "/detail.json" do
      node, type = required_params(:node, :type)

      begin
        node_stat = @@manager.status(node).node_stat
      rescue => ex
        halt 500, ex.message
      end

      properties = [
        :version, :vm_version, :log_dir, :ring_cur, :ring_prev, :total_mem_usage,
        :system_mem_usage, :procs_mem_usage, :ets_mem_usage, :num_of_procs,
        :limit_of_procs, :thread_pool_size 
      ]

      result = properties.map do |property|
        { :name => property, :value => node_stat.__send__(property) }
      end

      if type == "Storage"
        begin
          storage_stat = @@manager.du(node)
        rescue => ex
          warn ex.message
        else
          result.push({ :name => :total_of_objects, :value => storage_stat.total_of_objects })
        end
      end

      { :data => result }.to_json
    end

    post "/execute" do
      node, command = required_params(:node, :command)
      command = command.to_sym

      case command
      when :resume, :suspend, :detach
        begin
          @@manager.__send__(command, node)
        rescue => ex
          halt 500, ex.message
        end
      else
        halt 500, "invalid operation command: #{command}"
      end
      200
    end
  end
end
