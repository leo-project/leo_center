(function() {
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
          margin: "5 20 5 5" // get along with vertical scroll bar
        },
        items: erlang_vm_charts
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
