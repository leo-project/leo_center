class LeoTamer
  namespace "/users" do
    get "/list.json" do
      keys = @@manager.get_users
      result = keys.map do |user|
        {
          user_id: user.user_id,
          role: user.role.to_s,
          access_key_id: user.access_key_id,
          created_at: user.created_at
        }
      end

      { data: result }.to_json
    end

    post "/add_user" do
      user_id = required_params(:user_id)
      @@manager.create_user(user_id)
      200
    end

    delete "/delete_user" do
      user_id = required_params(:user_id)
      user_self = required_sessions(:user_id)
      raise "You can't modify your own role" if user_id == user_self
      @@manager.delete_user(user_id)
      200
    end

    post "/update_user" do
      user_id, role_id = required_params(:user_id, :role_id)
      user_self = required_sessions(:user_id)
      raise "You can't modify your own role" if user_id == user_self
      role_id = Integer(role_id)
      @@manager.update_user_role(user_id, role_id)
      200
    end
  end
end
