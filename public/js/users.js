(function() {
  Ext.define('LeoTamer.model.Users', {
    extend: 'Ext.data.Model',
    fields: ["user_id", "role", "access_key_id", "created_at"]
  });

  Ext.define("LeoTamer.Users", {
    extend: "Ext.panel.Panel",
    id: "Users",
    title: "Users",
    layout: "border",
    border: false,

    initComponent: function() {
      var user_store, user_grid;

      user_store = Ext.create("Ext.data.Store", {
        model: "LeoTamer.model.Users",
        proxy: {
          type: 'ajax',
          url: 'users/list.json',
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
            load: function() {
              endpoint_grid.getSelectionModel().selectFirstRow();
            },
            exception: function(self, response, operation) {
              alert("Error on: \'" + self.url + "\'\n" + response.responseText);
            }
          }
        },
        autoLoad: true
      });

      add_user = function() {
        title = "Add New User";
        msg = "Please input user name"
        Ext.Msg.prompt(title, msg, function(btn, value) {
          if (btn == "ok") {
            Ext.Ajax.request({
              url: "users/add_user",
              method: "POST",
              params: { user_id: value },
              success: function(response, opts) {
                title = "Add User"
                msg = "user '" + value + "' is added successfully."
                Ext.Msg.show({
                  title: title,
                  msg: msg,
                  buttons: Ext.Msg.OK,
                  icon: Ext.Msg.INFO
                });
                user_store.load();
              },
              failure: function(response, opts) {
                Ext.Msg.alert("Error!", response.responseText);
              }
            })
          }
        })
      }

      delete_user = function() {
        title = "Delete User";
        last_selected = user_grid.getSelectionModel().getLastSelected();
        if (!last_selected) {
          Ext.Msg.alert("Error!", "Please select a user.");
        }
        else {
          user_id = last_selected.data.user_id;
          msg = "Are you sure to delete user: '" + user_id + "'?";
          Ext.Msg.on("beforeshow",  function (win) {
            win.defaultFocus = 2; // set default focus to "No" button
          });
          Ext.Msg.confirm(title, msg, function(btn) {
            if (btn == "yes") {
              Ext.Ajax.request({
                url: "users/delete_user",
                method: "DELETE",
                params: { user_id: user_id },
                success: function(response, opts) {
                  title = "Delete User"
                  msg = "user '" + user_id + "' is deleted successfully."
                  Ext.Msg.show({
                    title: title,
                    msg: msg,
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.INFO
                  });
                  user_store.load();
                },
                failure: function(response, opts) {
                  Ext.Msg.alert("Error!", response.responseText);
                }
              });
            }
          });
        }
      }

      user_grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        border: false,
        forceFit: true,
        store: user_store,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "<img src='images/filter.png'> Filter:",
          labelWidth: 50,
          listeners: {
            change: function(self, new_value) {
              store = self.getStore();
              store.clearFilter();
              store.filter("user", new RegExp(new_value));
            }
          }
        },"-", {
          text: "Add User",
          icon: "images/add.png",
          handler: add_user
        }, {
          text: "Delete User",
          icon: "images/remove.png",
          handler: delete_user
        }],
        columns: [
          { header: "User ID", dataIndex: "user_id" },
          { 
            header: "Role",
            dataIndex: "role",
            renderer: function(value) {
              switch (value) {
                case "admin": 
                  return "<img src='images/admin_user.png'> " + value;
                case "normal":
                  return "<img src='images/user.png'> " + value;
              }
            }
          },
          { header: "Access Key ID", dataIndex: "access_key_id" },
          { header: "Created at", dataIndex: "created_at" }
        ]
      });

      Ext.apply(this, {
        items: user_grid
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
