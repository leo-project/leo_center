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
            xField: "x",
            yField: "y",
          }]
        }]
      });

      return self.callParent(arguments);
    }
  });

  Ext.define("LeoTamer.SNMP.Chart.ErlangVM", {
    extend: "LeoTamer.SNMP.Chart",

    initComponent: function() {
      var self = this;
      
      Ext.apply(self, {
        title: "Erlang VM Status of " + self.node,
        url: "snmp/erlang_vm.json",
        params: {
          node: self.node
        }
      });

      return self.callParent(arguments);
    }
  });

  Ext.define("LeoTamer.SNMP", {
    extend: "Ext.panel.Panel",
    id: "snmp",
    title: "SNMP",
    border: false,
    autoScroll: true,
    layout: "fit",

    initComponent: function() {
      var self = this;
      var erlang_vm_charts;
      var node_list;

      Ext.Ajax.request({
        url: "nodes/list.json",
        async: false,
        success: function(response) {
          var json = response.responseText;
          node_list = Ext.JSON.decode(json).data;
        }
      });

      erlang_vm_charts = Ext.Array.map(node_list, function(node) {
        return Ext.create("LeoTamer.SNMP.Chart.ErlangVM", {
          node: node.name
        });
      });

      Ext.apply(self, {
        defaults: {
          maxHeight: 300,
          padding: 10
        },
        items: erlang_vm_charts
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
