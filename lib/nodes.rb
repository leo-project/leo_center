require 'leofs_manager_client'

module LeoTamer
  class App
    configure do
      @@nodes = LeoFSManager::Client.new(*Config[:managers])
    end

    namespace "/nodes" do
      get "/list.json" do
        { 
          data: @@nodes.status.node_list.map do |node|
            {name: node.node }
          end
        }.to_json
      end
  
      get "/status.json" do
        node_list = @@nodes.status.node_list
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
        node = params[:node] || "storage_0@127.0.0.1" # dummy
        node_stat = @@nodes.status(node).node_stat
        
        result = [
          { :name => "log_dir", :value => node_stat.log_dir },
          { :name => "ring_cur", :value => node_stat.ring_cur },
          { :name => "ring_prev", :value => node_stat.ring_prev },
          { :name => "total_mem_usage", :value => node_stat.total_mem_usage },
          { :name => "system_mem_usage", :value => node_stat.system_mem_usage },
          { :name => "procs_mem_usage", :value => node_stat.procs_mem_usage },
          { :name => "ets_mem_usage", :value => node_stat.ets_mem_usage },
          { :name => "num_of_procs", :value => node_stat.num_of_procs }
        ]
  
        { :data => result }.to_json
      end

      put "/exec.json" do
        node = params[:node]
        command = params[:command].to_sym

        case command
        when :resume, :suspend, :detach
          @@nodes.__send__(command, node)
        else
        end
      end
    end
  end
end
