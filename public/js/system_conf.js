(function() {
  Ext.define("LeoTamer.SystemConf", {
    extend: "Ext.panel.Panel",
    id: "system_conf",
    title: "System Conf",
    layout: "border",
    border: false,

    listeners: {
      activate: function(self) {
        self.load();
      }
    },

    load: function() {
      this.store.load();
    },

    initComponent: function() {
      var self = this;

      self.store = Ext.create("Ext.data.ArrayStore", {
        model: "LeoTamer.model.NameValue",
        proxy: Ext.create("LeoTamer.proxy.Ajax.noParams", {
          url: "system_conf/list.json"
        })
      }),

      self.grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        forceFit: true,
        store: self.store,
        border: false,
        tbar: [
          "->",
          {
            xtype: "button",
            icon: "images/reload.png",
            handler: function() {
              self.store.load();
            }
          }
        ],
        columns: [{
          dataIndex: "name",
          text: "Name",
          width: 30
        }, {
          dataIndex: "value",
          text: "Value"
        }]
      });

      Ext.apply(self, {
        items: self.grid
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
