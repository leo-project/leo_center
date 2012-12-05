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

    header = Ext.create("Ext.toolbar.Toolbar", {
      region: "north",
      border: false,
      items: [
        { 
          xtype: "image",
          width: 75,
          src: "images/leofs-logo-0.png"
        },
        "->",
        {
          text: Ext.util.Cookies.get("user_id"),
          menu: {
            xtype: "menu",
            showSeparator: false,
            items: [
            /*
              { text: "My Account" },
              { text: "Account Activity" },
              { text: "Usage Reports" },
            */
              { text: "History" },
              { text: "Security Credentials" },
              "-",
              { 
                text: "Sign Out",
                handler: function() {
                  window.location = "/logout"
                }
              }
            ]
          }
        }
      ]
    });

    return viewport = Ext.create("Ext.Viewport", {
      layout: "border",
      items: [
        header,
        tabs
      ]
    });
  });
}).call(this);
