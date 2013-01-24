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
        proxy: {
          type: "ajax",
          url: "system_conf/list.json",
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

      self.grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        forceFit: true,
        store: self.store,
        border: false,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "<img src='images/filter.png'> Filter:",
          labelWidth: 60,
          listeners: {
            change: function(text_field, new_value) {
              var store = self.store;
              store.clearFilter();
              store.filter("name", new RegExp(new_value));
            }
          }},
               "->",
               {
                 xtype: "button",
                 icon: "images/reload.png",
                 handler: function() {
                   self.store.load();
                 }
               }],
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
