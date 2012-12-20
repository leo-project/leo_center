module TamerHelpers
  def debug(str)
    puts str if $DEBUG
  end

  def required_params(*params_to_check)
    request_params = params
    noexist_params = params_to_check.reject {|param| request_params[param] }
    unless noexist_params.empty?
      noexist_params.map! {|param| "'#{param}'" }
      raise "parameter #{noexist_params.join(" ")} are required"
    end
    if params_to_check.size == 1
      request_params[params_to_check.first]
    else
      params_to_check.map {|param| request_params[param] }
    end
  end

  def required_sessions(*keys_to_check)
    valid = keys_to_check.all? {|key| session.has_key?(key) }
    raise "invalid session" unless valid
    if keys_to_check.size == 1
      session[keys_to_check.first]
    else
      keys_to_check.map {|key| session[key] }
    end
  end

  # error msg for Ext.form
  def json_err_msg(msg)
    { 
      success: false,
      errors: {
        reason: msg
      }
    }.to_json
  end
end
