(function() {
  Ext.define('LeoTamer.model.Credentials', {
    extend: 'Ext.data.Model',
    fields: ["user", "access_key_id"]
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
        groupField: "owner",
        data: [], //XXX: for mock
        /*
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
        */
        autoLoad: true
      });

      add_user = function() {
        title = "Add New User";
        msg = "Please input user name"
        Ext.Msg.prompt(title, msg, function(btn, value) {
          if (btn == "ok") {
            Ext.Ajax.request({
              url: "credentials/add_user",
              method: "POST",
              params: { user: value },
              success: function(response, opts) {
                title = "Add User"
                msg = "user '" + value + "' is added successfully."
                Ext.Msg.show({
                  title: title,
                  msg: msg,
                  buttons: Ext.Msg.OK,
                  icon: Ext.Msg.INFO
                });
              },
              failure: function(response, opts) {
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
          fieldLabel: "Filter:",
          labelWidth: 35,
          listeners: {
            change: function(self, new_value) {
              store = self.getStore();
              store.clearFilter();
              store.filter("user", new RegExp(new_value));
            }
          }
        },"-", {
          text: "Add User", //TODO: use icon
          handler: add_user
        }],
        columns: [
          { header: "User", dataIndex: "name", width: 600 },
          { header: "Access Key ID", dataIndex: "access_key_id", width: 600 }
        ]
      });

      Ext.apply(this, {
        items: credential_grid
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
