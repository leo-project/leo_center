class LeoTamer
  namespace "/users" do
    get "/list.json" do
      keys = @@manager.get_users
      result = keys.map do |user|
        {
          :user_id => user.user_id,
          :role => user.role.to_s,
          :access_key_id => user.access_key_id,
          :created_at => user.created_at
        }
      end

      { data: result }.to_json
    end

    post "/add_user" do
      user_id = required_params(:user_id)
      begin
        @@manager.create_user(user_id)
      rescue => ex
        halt 500, ex.message
      end
      200
    end

    delete "/delete_user" do
      user_id = required_params(:user_id)
      begin
        @@manager.delete_user(user_id)
      rescue => ex
        halt 500, ex.message
      end
      200
    end

    post "/update_user" do
      user_id, role_id = required_params(:user_id, :role_id)
      role_id = Integer(role_id)
      begin
        @@manager.update_user_role(user_id, role_id)
      rescue => ex
        halt 500, ex.message
      end
      200
    end
  end
end
