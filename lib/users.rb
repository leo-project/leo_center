class LeoTamer
  namespace "/users" do
    get "/list.json" do
      keys = @@manager.s3_get_users
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
      user_id = params[:user_id]
      halt 500, "parameter 'user_id' is required" unless user_id
      @@manager.s3_create_user(user_id)
      200
    end

    delete "/delete_user" do
      user_id = params[:user_id]
      halt 500, "parameter 'user_id' is required" unless user_id
      @@manager.s3_delete_user(user_id)
      200
    end
  end
end
