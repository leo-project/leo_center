// ======================================================================
//
//  Leo Tamer
//
//  Copyright (c) 2012 Rakuten, Inc.
//
//  This file is provided to you under the Apache License,
//  Version 2.0 (the "License"); you may not use this file
//  except in compliance with the License.  You may obtain
//  a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing,
//  software distributed under the License is distributed on an
//  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
//  KIND, either express or implied.  See the License for the
//  specific language governing permissions and limitations
//  under the License.
//
// ======================================================================
(function() {
  Object.clone = function(source) {
    return $.extend({}, source);
  };

  Ext.define("LeoTamer.Msg", {
    statics: {
      // alert with ERROR icon
      alert: function(title, msg, fn, scope) {
        Ext.Msg.show({
          title: title,
          msg: msg,
          fn: fn,
          scope: scope,
          buttons: Ext.Msg.OK,
          icon: Ext.Msg.ERROR // set icon
        });
      }
    },

    constructor: function () {
      this.callSuper(arguments);
    }
  });

  Ext.define("LeoTamer.model.NameValue", {
    extend: "Ext.data.Model",
    fields: ["name", "value", "group"]
  });

  LeoTamer.confirm_password = function(callbacks) {
    Ext.Msg.prompt("Confirm", "Please input your password", function(btn, value) {
      if (btn === "ok") {
        var user_id = Ext.util.Cookies.get("user_id");
        var password = value;
        Ext.Ajax.request({
          url: "login",
          method: "POST",
          params: {
            user_id: user_id,
            password: password
          },
          success: function(response, opts) {
            text = response.responseText;
            result = Ext.JSON.decode(text);
            if (result.success) {
              // truely success
              callbacks.success(user_id, password);
            }
            else {
              // failure
              callbacks.failure(result.errors.reason);
            }
          },
          failure: function(response, opts) {
            callbacks.failure(response.responseText);
          }
        });
      }
    });
  }
}).call(this);
