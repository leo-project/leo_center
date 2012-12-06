(function() {
  Ext.define('LeoTamer.model.Credentials', {
    extend: 'Ext.data.Model',
    fields: ["user_id", "access_key_id", "created_at"]
  });

  Ext.define("LeoTamer.Credentials", {
    extend: "Ext.panel.Panel",
    id: "credentials",
    title: "Credentials",
    layout: "border",
    border: false,

    initComponent: function() {
      var credential_store, credential_grid;

      credential_store = Ext.create("Ext.data.Store", {
        model: "LeoTamer.model.Credentials",
        // data: [], //XXX: for mock
        proxy: {
          type: 'ajax',
          url: 'credentials/list.json',
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
              url: "credentials/add_user.json",
              method: "POST",
              params: { user: value },
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
                // credential_store.load(); //TODO
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
              url: "credentials/delete_user",
              method: "DELETE",
              params: { user: value },
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
                credential_store.load();
              },
              failure: function(response, opts) {
                console.log(response, opts);
                //TODO
              }
            })
          }
        })
      }

      credential_grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        border: false,
        forceFit: true,
        store: credential_store,
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
          icon: "images/add16.png", //TODO
          handler: delete_user
        }],
        columns: [
          { header: "User ID", dataIndex: "user_id" },
          { header: "Access Key ID", dataIndex: "access_key_id" },
          { header: "Created at", dataIndex: "created_at" }
        ]
      });

      Ext.apply(this, {
        items: credential_grid
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
