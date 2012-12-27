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
  Ext.define('LeoTamer.model.UserGroup', {
    extend: 'Ext.data.Model',
    fields: ["user_id", "role", "group", "access_key_id", "created_at"]
  });

  Ext.define("LeoTamer.UserGroup", {
    extend: "Ext.panel.Panel",
    id: "user_group",
    title: "User Group",
    layout: "border",

    listeners: {
      activate: function(self) {
        self.load();
      }
    },

    grid_grouping: Ext.create("Ext.grid.feature.Grouping", {
      groupHeaderTpl: "{name} ({rows.length} user{[values.rows.length > 1 ? 's' : '']})"
    }),

    load: function() {
      this.store.load();
    },

    store: Ext.create("Ext.data.Store", {
      model: "LeoTamer.model.UserGroup",
      groupField: "group",
      proxy: {
        type: 'ajax',
        url: 'user_group/list.json',
        reader: {
          type: 'json',
          root: 'data'
        },
        // disable unused params
        noCache: false,
        limitParam: undefined,
        pageParam: undefined,
        sortParam: undefined,
        startParam: undefined,
        listeners: {
          exception: function(store, response) {
            Ext.Msg.alert("Error on: \'" + store.url + "\'", response.responseText);
          }
        }
      }
    }),

    add_user_group: function() {
      var self = this;
      var title = "Add New User Group";
      var msg = "Please input group name"
      Ext.Msg.prompt(title, msg, function(btn, value) {
        if (btn == "ok") {
          Ext.Ajax.request({
            url: "user_group/add",
            method: "POST",
            params: { group: value },
            success: function(response, opts) {
              self.load();
            },
            failure: function(response, opts) {
              Ext.Msg.alert("Error!", response.responseText);
            }
          })
        }
      })
    },

    update_user_group: function() {
      // TODO
    },

    delete_user_group: function() {
      var self = this;
      var title = "Delete User Group";
      // TODO
    },

    add_user: function() {
      var self = this;
      var title = "Add New User";
      var msg = "Please input user name"
      Ext.Msg.prompt(title, msg, function(btn, value) {
        if (btn == "ok") {
          Ext.Ajax.request({
            url: "users/add_user",
            method: "POST",
            params: { user_id: value },
            success: function(response, opts) {
              self.load();
            },
            failure: function(response, opts) {
              Ext.Msg.alert("Error!", response.responseText);
            }
          })
        }
      })
    },

    delete_user: function() {
      var self = this;
      var title = "Delete User";
      var last_selected = self.grid.getSelectionModel().getLastSelected();
      if (!last_selected) {
        Ext.Msg.alert("Error!", "Please select a user.");
      }
      else {
        var user_id = last_selected.data.user_id;
        var msg = "Are you sure to delete user: '" + user_id + "'?";
        Ext.Msg.on("beforeshow",  function (win) {
          win.defaultFocus = 2; // set default focus to "No" button
        });
        Ext.Msg.confirm(title, msg, function(btn) {
          if (btn == "yes") {
            Ext.Ajax.request({
              url: "users/delete_user",
              method: "DELETE",
              params: { user_id: user_id },
              success: function(response) {
                self.load();
              },
              failure: function(response) {
                Ext.Msg.alert("Error!", response.responseText);
              }
            });
          }
        });
      }
    },

    role_renderer: function(value) {
      switch (value) {
        case "admin":
          return "<img src='images/admin_user.png'> " + value;
        case "general":
          return "<img src='images/user.png'> " + value;
        default:
          throw "invalid value: " + value;
      }
    },

    initComponent: function() {
      var self = this;

      self.grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        forceFit: true,
        features: [ self.grid_grouping ],
        store: self.store,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "<img src='images/filter.png'> Filter:",
          labelWidth: 50,
          listeners: {
            change: function(text_field, new_value) {
              var store = self.store;
              store.clearFilter();
              store.filter("user_id", new RegExp(new_value));
            }
          }
        },
        {
          text: "Add Group",
          icon: "images/add.png",
          handler: function() {
            self.add_user_group();
          }
        },
        {
          text: "Update Group",
          icon: "images/update_user.png",
          handler: function() {
            // TODO
          }
        },
        {
          text: "Delete Group",
          icon: "images/remove.png",
          handler: function() {
            // TODO
          }
        }, 
        "-",
        {
          text: "Add User",
          icon: "images/add.png",
          handler: function() {
            self.add_user();
          }
        },
        {
          text: "Delete User",
          icon: "images/remove.png",
          handler: function() {
            self.delete_user();
          }
        },
        "->",
        {
          icon: "images/reload.png",
          handler: function() {
            self.load();
          }
        }],
        columns: {
          defaults: {
            resizable: false
          },
          items: [
            {
              header: "Role",
              dataIndex: "role",
              width: 20,
              renderer: self.role_renderer
            },
            {
              header: "User ID",
              dataIndex: "user_id",
              width: 40
            },
            {
              header: "Access Key ID",
              dataIndex: "access_key_id",
              width: 30
            },
            { header: "Created at", dataIndex: "created_at" }
          ]
        }
      });

      Ext.apply(self, {
        items: self.grid
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
