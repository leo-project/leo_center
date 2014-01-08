//======================================================================
//
// LeoFS
//
// Copyright (c) 2012-2014 Rakuten, Inc.
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
  Ext.define('LeoCenter.model.Users', {
    extend: 'Ext.data.Model',
    fields: [
      "user_id", "role", "access_key_id",
      { name: "created_at", type: "date", dateFormat: "U" }
    ]
  });

  Ext.define(
    PANE_SUB_USERS,
    { extend: "Ext.panel.Panel",
      id: "user_sub_view",
      title: "Users",
      layout: "border",
      border: false,

      listeners: {
        activate: function(self) {
          self.store.load();
        }
      },

      role_store: Ext.create(
        "Ext.data.Store",
        { fields: ["role", "role_id"],
          data: [{ role: "admin", role_id: 9 },
                 { role: "general user", role_id: 1 }
                ]
        }),

      store: Ext.create(
        "Ext.data.Store",
        { model: "LeoCenter.model.Users",
          groupField: "role",
          proxy: Ext.create("LeoCenter.proxy.Ajax.noParams", {
            url: "users/list.json"
          })
        }),

      add_user: function() {
        var self = this;
        var title = "Add New User";
        var msg = "Please input user name"
        Ext.Msg.prompt(title, msg, function(btn, value) {
          if (btn == "ok") {
            Ext.Ajax.request(
              { url: "users/add_user",
                method: "POST",
                params: { user_id: value },
                success: function(response, opts) {
                  self.store.load();
                },
                failure: function(response, opts) {
                  LeoCenter.Msg.alert("Error!", response.responseText);
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
          LeoCenter.Msg.alert("Error!", "Please select a user.");
          return;
        }

        var user_id_to_delete = last_selected.data.user_id;

        LeoCenter.confirm_password(function(password) {
          Ext.Ajax.request(
            { url: "users/delete_user",
              method: "DELETE",
              params: {
                user_id_to_delete: user_id_to_delete,
                password: password
              },
              success: function(response) {
                self.store.load();
              },
              failure: function(response) {
                LeoCenter.Msg.alert("Error!", response.responseText);
              }
            });
        });
      },

      do_update_user: function(user_id, role_id) {
        var self = this;
        Ext.Ajax.request({
          url: "users/update_user",
          method: "POST",
          params: { user_id: user_id,
                    role_id: role_id
                  },
          success: function(response) {
            self.store.load();
          },
          failure: function(response, opts) {
            LeoCenter.Msg.alert("Error!", response.responseText);
          }
        });
      },

      update_user: function() {
        var self = this;
        var last_selected = self.grid.getSelectionModel().getLastSelected();
        if (!last_selected) {
          LeoCenter.Msg.alert("Error!", "Please select a user.");
        }
        else {
          var user_id = last_selected.data.user_id;
          var role_combo, role_select_window;

          role_combo = Ext.create(
            "Ext.form.ComboBox",
            { padding: 10,
              store: self.role_store,
              labelWidth: 125,
              fieldLabel: "Select Role",
              displayField: "role",
              valueField: "role_id",
              emptyText: "Select Role",
              allowBlank: false,
              editable: false
            });

          role_select_window = Ext.create(
            "Ext.window.Window",
            { title: "Update User Role",
              items: role_combo,
              buttons: [{
                text: "Apply",
                handler: function() {
                  var role_id = role_combo.getValue();
                  if (role_id != "none")
                    self.do_update_user(user_id, role_id);
                  role_select_window.close();
                }
              }, {
                text: "Cancel",
                handler: function() {
                  role_select_window.close();
                }
              }]
            }).show();
        }
      },

      role_renderer: function(value) {
        switch (value) {
        case "admin":
          return "<img src='images/admin_user.png'> " + Ext.String.capitalize(value);
        case "general":
          return "<img src='images/user.png'> " + Ext.String.capitalize(value) + " User";
        default:
          throw "invalid value: " + value;
        }
      },

      grid_grouping: Ext.create(
        "Ext.grid.feature.Grouping",
        { groupHeaderTpl: "{name} [{rows.length}]",
          collapsible: false
        }),

      initComponent: function() {
        var self = this;

        self.grid = Ext.create(
          "Ext.grid.Panel",
          { region: "center",
            border: false,
            forceFit: true,
            store: self.store,
            features: [ self.grid_grouping ],
            tbar: [{
              xtype: "textfield",
              fieldLabel: "<img src='images/filter.png'> Filter:",
              labelWidth: 60,
              listeners: {
                change: function(text_field, new_value) {
                  var store = self.store;
                  store.clearFilter();
                  store.filter("user_id", new RegExp(new_value));
                }}},
                   "-",
                   { text: "Delete User",
                     icon: "images/remove.png",
                     handler: function() {
                       self.delete_user();
                     }},
                   { text: "Update Role",
                     icon: "images/update_user.png",
                     handler: function() {
                       self.update_user();
                     }},
                   "->",
                   { icon: "images/reload.png",
                     handler: function() {
                       self.store.load();
                     }}
                  ],

            columns: {defaults: { resizable: false },
                      items: [{ header: "Role",
                                dataIndex: "role",
                                width: 20,
                                renderer: self.role_renderer
                              },
                              { header: "User ID",
                                dataIndex: "user_id",
                                renderer: Ext.htmlEncode,
                                width: 40
                              },
                              { header: "Access Key ID",
                                dataIndex: "access_key_id",
                                width: 30
                              },
                              { header: "Created at",
                                dataIndex: "created_at",
                                renderer: Ext.util.Format.dateRenderer("c")
                              }
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
