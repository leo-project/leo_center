(function() {
  Ext.define('LeoTamer.model.Endpoints', {
    extend: 'Ext.data.Model',
    fields: ["endpoint", "created_at"]
  });

  Ext.define("LeoTamer.Endpoints", {
    extend: "Ext.panel.Panel",
    id: "endpoints",
    title: "Endpoints",
    layout: "border",
    border: false,

    initComponent: function() {
      var endpoint_store, endpoint_grid;

      endpoint_store = Ext.create("Ext.data.Store", {
        model: "LeoTamer.model.Endpoints",
        proxy: {
          type: 'ajax',
          url: 'endpoints/list.json',
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

      add_endpoint = function() {
        title = "Add New Endpoint";
        msg = "Please input endpoint name"
        Ext.Msg.prompt(title, msg, function(btn, value) {
          if (btn == "ok") {
            Ext.Ajax.request({
              url: "endpoints/add_endpoint",
              method: "POST",
              params: { endpoint: value },
              success: function(response, opts) {
                title = "Add Endpoint"
                msg = "endpoint '" + value + "' is added successfully."
                Ext.Msg.show({
                  title: title,
                  msg: msg,
                  buttons: Ext.Msg.OK,
                  icon: Ext.Msg.INFO
                });
                endpoint_store.load();
              },
              failure: function(response, opts) {
                //TODO
              }
            })
          }
        })
      }

      delete_endpoint = function() {
        title = "Delete Endpoint";
        msg = "Please input endpoint name"
        Ext.Msg.prompt(title, msg, function(btn, value) {
          if (btn == "ok") {
            Ext.Ajax.request({
              url: "endpoints/delete_endpoint",
              method: "DELETE",
              params: { endpoint: value },
              success: function(response, opts) {
                title = "Delete Endpoint"
                msg = "endpoint '" + value + "' is deleted successfully."
                Ext.Msg.show({
                  title: title,
                  msg: msg,
                  buttons: Ext.Msg.OK,
                  icon: Ext.Msg.INFO
                });
                endpoint_store.load();
              },
              failure: function(response, opts) {
                //TODO
              }
            })
          }
        })
      }

      endpoint_grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        border: false,
        forceFit: true,
        store: endpoint_store,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "<img src='images/filter16.png'> Filter:",
          labelWidth: 50,
          listeners: {
            change: function(self, new_value) {
              store = self.getStore();
              store.clearFilter();
              store.filter("endpoint", new RegExp(new_value));
            }
          }
        },"-", {
          text: "Add Endpoint",
          icon: "images/add16.png",
          handler: add_endpoint
        }, {
          text: "Add Endpoint",
          icon: "images/remove16.png",
          handler: delete_endpoint
        }],
        columns: [
          { header: "Endpoint", dataIndex: "endpoint", width: 600 },
          { header: "Created at", dataIndex: "created_at", width: 600 }
        ]
      });

      Ext.apply(this, {
        items: endpoint_grid
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
