require 'leofs_manager_client'

class LeoTamer
  configure do
    @@manager ||= LeoFSManager::Client.new(*Config[:managers])
  end

  namespace "/nodes" do
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
      node = params[:node]
      type = params[:type]
      node_stat = @@manager.status(node).node_stat

      properties = [
        :log_dir, :ring_cur, :ring_prev, :total_mem_usage,
        :system_mem_usage, :procs_mem_usage, :ets_mem_usage, :num_of_procs
      ]

      result = properties.map do |property|
        { :name => property, :value => node_stat.__send__(property) }
      end

      if type == "Storage"
        storage_stat = @@manager.du(node)
        p storage_stat
        result.concat([
          { :name => :file_size, :value => storage_stat.file_size },
          { :name => :total_of_objects, :value => storage_stat.total_of_objects }
        ])
      end

      { :data => result }.to_json
    end

    post "/exec.json" do
      node = params[:node]
      command = params[:command].to_sym

      case command
      when :resume, :suspend, :detach
        # @@manager.__send__(command, node)
      else
        raise Error, "invalid operation command: #{command}"
      end
    end
  end
end
