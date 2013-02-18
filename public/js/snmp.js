(function() {
  Ext.define("LeoTamer.model.Chart", {
    extend: "Ext.data.Model",
    fields: ["x", "y"]
  });

  Ext.define("LeoTamer.SNMP.Chart", {
    extend: "Ext.panel.Panel",

    initComponent: function() {
      var self = this;

      var store = Ext.create("Ext.data.Store", {
        model: "LeoTamer.model.Chart",
        proxy: {
          type: "ajax",
          url: self.url,
          extraParams: self.params,
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
        },
        autoLoad: true
      });

      Ext.apply(self, {
        title: self.title,
        layout: "fit",
        items: [{ 
          xtype: "chart",
          store: store,
          series: [{
            type: "area",
            highlight: false,
            axis: "left",
            xField: "x",
            yField: "y",
          }]
        }]
      });

      return self.callParent(arguments);
    }
  });

  Ext.define("LeoTamer.SNMP", {
    extend: "Ext.panel.Panel",
    id: "snmp",
    title: "SNMP",
    border: false,

    layout: {
      type: "fit"
    },

    initComponent: function() {
      var self = this;

      self.chart_panel1 = Ext.create("LeoTamer.SNMP.Chart", {
        title: "foo",
        url: "snmp/chart.json"
      });
      console.log(self.chart_panel1);

      Ext.apply(self, {
        defaults: {
          maxHeight: 300
        },
        items: [
          self.chart_panel1,
        ]
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
