(function() {
  Ext.define("LeoTamer.model.Whereis", {
    extend: "Ext.data.Model",
    fields: ["node", "vnode_id", "size", "clock", "checksum", "timestamp", "delete", "num_of_chunks"]
  });

  Ext.define("LeoTamer.Whereis", {
    extend: "Ext.panel.Panel",
    id: "whereis",
    title: "Whereis",
    layout: "border",
    border: false,

    load: function() {
      this.store.load();
    },

    store: Ext.create("Ext.data.Store", {
      model: "LeoTamer.model.Whereis",
      proxy: {
        type: "ajax",
        url: "whereis/list.json",
        reader: {
          type: "json",
          root: "data"
        },
        // disable unused params
        noCache: false,
        limitParam: undefined,
        pageParam: undefined,
        sortParam: undefined,
        startParam: undefined,
        listeners: {
          exception: function(store, response, operation) {
            LeoTamer.Msg.alert("Error on: \'" + store.url + "\'", response.responseText);
          }
        }
      }
    }),

    initComponent: function() {
      var self = this;

      self.grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        border: false,
        forceFit: true,
        store: self.store,
        tbar: [{
          xtype: "textfield",
          id: "whereis_grid_tbar_path",
          fieldLabel: "<img src='images/filter.png'> Path:",
          labelWidth: 60,
          listeners: {
            change: function() {
              self.store.loadData([]);
            },
            specialkey: function(text_field, event) {
              if (event.getKey() == event.ENTER) {
                var path = text_field.getValue();
                if (path !== "") {
                  self.store.load({
                    params: {
                      path: path
                    }
                  });
                }
              }
            }
          }
        }],
        columns: {
          defaults: { resizable: false },
          items: [
            { header: "Node", dataIndex: "node" },
            { header: "VNode ID", dataIndex: "vnode_id" },
            { header: "Size", dataIndex: "size", width: 30 },
            { header: "Clock", dataIndex: "clock" },
            { header: "Checksum", dataIndex: "checksum" },
            { header: "Timestamp", dataIndex: "timestamp" },
            { header: "Delete", dataIndex: "delete", width: 30 },
            { header: "Number of Chunks", dataIndex: "num_of_chunks", width: 30 }
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
