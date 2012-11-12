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

    initComponent: function() {
      var bucket_store, bucket_grid;

      credential_store = Ext.create("Ext.data.Store", {
        model: "LeoTamer.model.Buckets",
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
              node_grid.getSelectionModel().selectFirstRow();
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

      credential_grid = Ext.create("Ext.grid.Panel", {
        title: "Credentials",
        region: "center",
        // forceFit: true,
        store: credential_store,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "User Name:",
          labelWidth: 75,
          listeners: {
            change: function(self, new_value) {
              node_store.clearFilter();
              node_store.filter("user", new RegExp(new_value));
            }
          }
        }],
        columns: [
          { header: "User", dataIndex: "name", width: 600 },
          { header: "Access Key ID", dataIndex: "access_key_id", width: 600 }
        ]
      });

      add_user = function() {
        title = "Add New User";
        msg = "Please input user name"
        Ext.Msg.prompt(title, msg, function(btn, value) {
          if (btn == "ok") {
            Ext.Ajax.request({
              url: "credentials/add_user",
              method: "POST",
              params: { bucket: value },
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

      Ext.apply(this, {
        tbar: [{ 
          text: "Add User",
          handler: add_user
        }],
        items: credential_grid
      });

      return this.callParent(arguments);
    }
  });
}).call(this);