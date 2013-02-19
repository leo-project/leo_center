(function() {
  Ext.define("LeoTamer.SNMP.Chart", {
    extend: "Ext.panel.Panel",

    just_date: function() {
      var date, just_date;
      date = new Date();
      just_date = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours()
      );
      return just_date;
    },

    initComponent: function() {
      var self = this;

      var store = Ext.create("Ext.data.Store", {
        fields: [
          { name: "x", type: "date", dateFormat: "U" },
          "y",
          "y1",
          "y2"
        ],
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
          legend: true,
          axes: [{
            type: "Numeric",
            grid: true,
            position: "left",
            fields: "y"
          }, {
            type: "Time",
            grid: true,
            position: "bottom",
            constrain: true,
            step: [Ext.Date.MINUTE, 30],
            minorTickSteps: 2, // every 10 minutes
            dateFormat: "H:i",
            fromDate: Ext.Date.add(self.just_date(), Ext.Date.HOUR, -7), // 7 hours ago
            // toDate: self.just_date(),
            fields: "x"
          }],
          series: [{
            type: "area",
            xField: "x",
            yField: ["y1", "y2", "y"],
            title: [
              "System memory usage",
              "ETS memory usage",
              "Processes memory usage"
            ],
            style: {
              opacity: 0.6
            }
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
          margin: "5 20 5 5" // get along with vertical scroll bar
        },
        items: erlang_vm_charts
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
