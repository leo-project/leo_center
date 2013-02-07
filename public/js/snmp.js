(function() {
  Ext.define("LeoTamer.model.Chart", {
    extend: "Ext.data.Model",
    fields: ["x", "y"]
  });

  Ext.define("LeoTamer.SNMP", {
    extend: "Ext.panel.Panel",
    id: "snmp",
    title: "SNMP",
    border: false,
    width: "100%",
    height: "100%",

    layout: {
      type: "hbox",
      pack: "start",
      align: 'stretch'
    },

    store: Ext.create("Ext.data.Store", {
      model: "LeoTamer.model.Chart",
      proxy: {
        type: "ajax",
        url: "snmp/chart.json",
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
    }),

    initComponent: function() {
      var self = this;

      self.chart_panel1 = Ext.create("Ext.Panel", {
        title: "Chart Penel1",
        padding: 12,
        height: 200,
        flex: 2,
        layout: "fit",
        items: [{ 
          xtype: "chart",
          width: 300,
          height: 300,
          store: self.store,
          series: [{
            type: "area",
            highlight: false,
            axis: "left",
            xField: "x",
            yField: "y",
          }]
        }]
      });

      self.chart_panel2 = Ext.create("Ext.Panel", {
        title: "Chart Penel1",
        padding: 12,
        height: 200,
        flex: 2,
        layout: "fit",
        items: [{ 
          xtype: "chart",
          store: self.store,
          series: [{
            type: "area",
            highlight: false,
            axis: "left",
            xField: "x",
            yField: "y",
          }]
        }]
      });

      Ext.apply(self, {
        items: [
          self.chart_panel1,
          self.chart_panel2
        ]
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
