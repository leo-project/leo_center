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

    s3_buckets = Ext.create("LeoTamer.S3Buckets");
    
    credentials = Ext.create("LeoTamer.Credentials");

    tabs = Ext.create("Ext.TabPanel", {
      region: "center",
      activeTab: 0,
      defaults: {
        bodyPadding: 10
      },
      items: [
        node_status,
        s3_buckets,
        credentials
      ]
    });

    return viewport = Ext.create("Ext.Viewport", {
      layout: "border",
      items: tabs
    });
  });
}).call(this);
