(function() {
  Ext.define("LeoTamer.model.Whereis", {
    extend: "Ext.data.Model",
    fields: ["node", "vnode_id", "size", "clock", "checksum", "timestamp", "delete", "num_of_chunks"]
  });

  Ext.define("LeoTamer.Whereis", {
    extend: "Ext.panel.Panel",
    id: "whereis",
    title: "Assigned File",
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

    detail_store: Ext.create("Ext.data.ArrayStore", {
      fields: ["name", "value"],
      data: []
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
          width: 500,
          listeners: {
            change: function() {
              self.store.removeAll();
              self.detail_store.removeAll();
              self.detail_grid.setTitle("");
            },
            specialkey: function(text_field, event) {
              if (event.getKey() == event.ENTER) {
                var path = text_field.getValue();
                if (path !== "") {
                  self.store.load({
                    params: {
                      path: path
                    },
                    callback: function() {
                      self.grid.getSelectionModel().select(0);
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
            { 
              dataIndex: "delete",
              width: 8,
              renderer: function(value) {
                if (value === 0) {
                  return "";
                }
                else {
                  return "<img src='images/trash.png'>";
                }
              }
            },
            { header: "Node", dataIndex: "node" },
            // { header: "VNode ID", dataIndex: "vnode_id" },
            { header: "Size", dataIndex: "size", width: 30 },
            // { header: "Clock", dataIndex: "clock" },
            // { header: "Checksum", dataIndex: "checksum" },
            { header: "Timestamp", dataIndex: "timestamp" },
            // { header: "Number of Chunks", dataIndex: "num_of_chunks", width: 30 }
          ]
        },
        listeners: {
          select: function(grid, record, index) {
            self.detail_grid.setTitle(record.get("node"));
            self.detail_store.loadData([
              ["VNode ID", record.get("vnode_id")],
              ["Clock", record.get("clock")],
              ["Checksum", record.get("checksum")],
              ["# of chunks", record.get("num_of_chunks")]
            ]);
          }
        }
      });

      self.detail_grid = Ext.create("Ext.grid.Panel", {
        region: "east",
        title: "&nbsp;",
        width: 300,
        forceFit: true,
        store: self.detail_store,
        hideHeaders: true,
        columns: {
          defaults: { resizable: false },
          items: [
            { dataIndex: "name" },
            { dataIndex: "value" }
          ]
        }
      });

      Ext.apply(self, {
        items: [self.grid, self.detail_grid]
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
