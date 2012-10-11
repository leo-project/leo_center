(function() {

  Highcharts.setOptions({
    credits: {
      enabled: false
    },
    global: {
      useUTC: false
    }
  });

  Ext.onReady(function() {
    var node_status, tabs, viewport;
    node_status = Ext.create("LeoTamer.Nodes");
    tabs = Ext.create("Ext.TabPanel", {
      region: "center",
      activeTab: 0,
      defaults: {
        bodyPadding: 10
      },
      items: [node_status]
    });
    return viewport = Ext.create("Ext.Viewport", {
      layout: "border",
      items: tabs
    });
  });

}).call(this);
