class LeoTamer
  namespace "/whereis" do
    before do
      halt 401 unless session[:admin]
    end

    get "/list.json" do
      path = required_params(:path)
      {
        data: @@manager.whereis(path).map do |whereis|
          {
            node: whereis.node,
            vnode_id: whereis.vnode_id,
            size: whereis.size,
            clock: whereis.clock,
            checksum: whereis.checksum,
            timestamp: Integer(whereis.timestamp),
            delete: whereis.delete,
            num_of_chunks: whereis.num_of_chunks
          }
        end
      }.to_json
    end
  end
end
