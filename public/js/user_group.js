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

    selection_model: Ext.create("Ext.selection.CheckboxModel", {
      checkOnly: true,
      headerWidth: 4
    }),

    load: function() {
      this.store.load();
    },

    role_store: Ext.create("Ext.data.Store", {
      fields: ["role", "role_id"],
      data: [
        { role: "admin", role_id: 9 },
        { role: "general", role_id: 1 }
      ]
    }),

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
            LeoTamer.Msg.alert("Error on: \'" + store.url + "\'", response.responseText);
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
            url: "user_group/add_group",
            method: "POST",
            params: { group: value },
            success: function(response, opts) {
              self.load();
            },
            failure: function(response, opts) {
              LeoTamer.Msg.alert("Error!", response.responseText);
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

      var form = Ext.create("Ext.form.Panel", {
        url: "user_group/add_user.json",
        defaults: {
          padding: "10",
          width: 300,
          vtype: "alphanum",
          allowBlank: false
        },
        items:[{
          xtype: "combo",
          fieldLabel: "Group",
          name: "group"
        }, {
          xtype: "textfield",
          fieldLabel: "User ID",
          name: "user_id"
        }],
        buttons: [{
          text: "OK",
          enableKeyEvents: true,
          handler: function() {
            form.submit({
              method: "POST",
              success: function() {
                self.load();
              },
              failure: function(form, action) {
                alert("foo");
                LeoTamer.Msg.alert("Add User Faild!", "reason: " + action.result.errors.reason);
              }
            });
          }
        }]
      });

      Ext.create("Ext.Window", {
        title: "Add New User",
        items: form
      }).show();
    },

    // TODO: multiple selection
    delete_user: function() {
      var self = this;
      var title = "Delete User";
      var last_selected = self.grid.getSelectionModel().getLastSelected();
      if (!last_selected) {
        LeoTamer.Msg.alert("Error!", "Please select a user.");
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
                LeoTamer.Msg.alert("Error!", response.responseText);
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
        selModel: self.selection_model,
        plugins: [
          Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
          })
        ],
        tbar: [{
          xtype: "textfield",
          fieldLabel: "<img src='images/filter.png'> Filter:",
          labelWidth: 60,
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
              editor: {
                xtype: "combo",
                store: self.role_store,
                displayField: "role",
                valueField: "role",
                mode: "local",
                triggerAction: "all",
                lazyRender: true,
                allowBlank: false,
                editable: false
              },
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
