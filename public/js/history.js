(function() {
  Ext.define("LeoTamer.History", {
    extend: "Ext.panel.Panel",
    id: "history_panel",
    title: "History",
    layout: "border",
    border: false,

    initComponent: function() {
      var history_store, history_grid;

      history_store = Ext.create("Ext.data.Store", {
        model: "LeoTamer.model.History",
        proxy: {
          type: 'ajax',
          url: 'history/list.json',
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
              history_grid.getSelectionModel().selectFirstRow();
            },
            exception: function(self, response, operation) {
              console.log(self, response, operation);
              alert("Error on: \'" + self.url + "\'\n" + response.responseText);
            }
          }
        },
        // autoLoad: true
      });

      history_grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        border: false,
        forceFit: true,
        // store: history_store,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "<img src='images/filter16.png'> Filter:",
          labelWidth: 50,
          listeners: {
            change: function(self, new_value) {
              store = self.getStore();
              store.clearFilter();
              store.filter("history", new RegExp(new_value));
            }
          }
        }],
        columns: [
          { header: "History", dataIndex: "history", width: 600 },
          { header: "Created At", dataIndex: "created_at", width: 600 }
        ]
      });

      Ext.apply(this, {
        items: history_grid
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
