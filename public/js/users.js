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
        // data: [], //XXX: for mock
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
              console.log(self, response, operation);
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
                console.log(response, opts);
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
                console.log(response, opts);
                //TODO
              }
            })
          }
        })
      }

      delete_user = function() {
        title = "Delete User";
        msg = "Please input user name"
        Ext.Msg.prompt(title, msg, function(btn, value) {
          if (btn == "ok") {
            Ext.Ajax.request({
              url: "users/delete_user",
              method: "DELETE",
              params: { user_id: value },
              success: function(response, opts) {
                console.log(response, opts);
                title = "Delete User"
                msg = "user '" + value + "' is deleted successfully."
                Ext.Msg.show({
                  title: title,
                  msg: msg,
                  buttons: Ext.Msg.OK,
                  icon: Ext.Msg.INFO
                });
                user_store.load();
              },
              failure: function(response, opts) {
                console.log(response, opts);
                //TODO
              }
            })
          }
        })
      }

      user_grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        border: false,
        forceFit: true,
        store: user_store,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "<img src='images/filter16.png'> Filter:",
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
          icon: "images/add16.png",
          handler: add_user
        }, {
          text: "Delete User",
          icon: "images/remove16.png",
          handler: delete_user
        }],
        columns: [
          { header: "User ID", dataIndex: "user_id" },
          { header: "Role", dataIndex: "role" },
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
