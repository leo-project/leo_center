//======================================================================
//
// LeoFS
//
// Copyright (c) 2012-2013 Rakuten, Inc.
//
// This file is provided to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file
// except in compliance with the License.  You may obtain
// a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
//
//======================================================================
(function() {
  Ext.define("LeoCenter.Msg", {
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

  // model for { name: "hoge", value: "fuga" }
  Ext.define("LeoCenter.model.NameValue", {
    extend: "Ext.data.Model",
    fields: ["name", "value", "group"]
  });

  LeoCenter.confirm_password = function(callback, msg) {
    var msg = msg || "";

    if (msg !== "") msg += "<br><br>";
    msg += "Please Input Your Passowrd:";

    var msg_box = Ext.Msg.prompt("Confirm", msg, function(btn, password) {
      if (btn === "ok") callback(password);
    });
    msg_box.textField.inputEl.dom.type = "password";
  }

  Ext.util.Format.SI = function(number, format) {
    var format = format || "0";
    if (number < 1024) {
      return Ext.util.Format.number(number, format);
    } else if (number < 1048576) {
      return Ext.util.Format.number(Math.round(((number * 100) / 1024)) / 100, format) + "K";
    } else if (number < 1073741824) {
      return Ext.util.Format.number(Math.round(((number * 100) / 1048576)) / 100, format) + "M";
    } else if (number < 1099511627776) {
      return Ext.util.Format.number(Math.round(((number * 100) / 1073741824)) / 100, format) + "G";
    } else {
      return Ext.util.Format.number(Math.round(((number * 100) / 1099511627776)) / 100, format) + "T";
    }
  };

  Ext.define("LeoCenter.proxy.Ajax.noParams", {
    extend: "Ext.data.proxy.Ajax",

    config: {
      reader: {
        type: "json",
        root: "data"
      },
      // disable unused params
      noCache: false,
      limitParam: undefined,
      pageParam: undefined,
      sortParam: undefined,
      startParam: undefined,
      listeners: {
        exception: function(store, response, operation) {
          console.log(response.status);
          if (response.status === 401) { // session timeout
            LeoCenter.Msg.alert("Session Timeout", "Your session is expired.", function() {
              Ext.util.Cookies.clear("user_id");
              Ext.util.Cookies.clear("admin");
              location = "/";
            });
          }
          else if (response.responseText === "") {
            LeoCenter.Msg.alert("Error on: \'" + store.url + "\'", "An Error Occurred");
          }
          else {
            LeoCenter.Msg.alert("Error on: \'" + store.url + "\'", response.responseText);
          }
        }
      }
    },

    constructor: function() {
      var self = this;
      self.initConfig(self.config);
      return self.callParent(arguments);
    }
  });
}).call(this);
