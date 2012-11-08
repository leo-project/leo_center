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

    s3_related = Ext.create("LeoTamer.S3Buckets");

    tabs = Ext.create("Ext.TabPanel", {
      region: "center",
      activeTab: 0,
      defaults: {
        bodyPadding: 10
      },
      items: [
        node_status,
        s3_related
      ]
    });

    return viewport = Ext.create("Ext.Viewport", {
      layout: "border",
      items: tabs
    });
  });
}).call(this);
