(function() {
  Highcharts.setOptions({
    credits: { enabled: false },
    global: { useUTC: false }
  });

  Ext.onReady(function() {
    var node_status, tabs, viewport;
    
    node_status = Ext.create("LeoTamer.Nodes");

    admin = Ext.create("LeoTamer.Admin");

    tabs = Ext.create("Ext.TabPanel", {
      region: "center",
      activeTab: 0,
      defaults: { bodyPadding: 5 },
      items: [
        node_status,
        admin
      ]
    });

    return viewport = Ext.create("Ext.Viewport", {
      layout: "border",
      items: tabs
    });
  });
}).call(this);
