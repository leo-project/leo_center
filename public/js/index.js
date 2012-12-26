(function() {
  /*
  Highcharts.setOptions({
    credits: { enabled: false },
    global: { useUTC: false }
  });
  */

  Ext.onReady(function() {
    var node_status, admin, tabs, viewport;
    var header, get_credential;
    
    node_status = Ext.create("LeoTamer.Nodes");

    admin = Ext.create("LeoTamer.Admin");

    tabs = Ext.create("Ext.TabPanel", {
      region: "center",
      activeTab: 0,
      defaults: { bodyPadding: 5 },
      items: [node_status, admin]
    });

    get_credential = function() {
      Ext.Ajax.request({
        url: "user_credential",
        method: "GET",
        success: function(response) {
          Ext.Msg.alert("Your Credential", response.responseText);
        },
        failure: function(response) {
          Ext.Msg.alert("Error!", response.responseText);
        }
      })
    };

    header = Ext.create("Ext.toolbar.Toolbar", {
      region: "north",
      border: false,
      items: [
        { 
          xtype: "image",
          width: 75,
          height: 24,
          src: "images/logo_header.png"
        },
        "->",
        {
          text: Ext.util.Cookies.get("user_id"),
          icon: "images/admin_user.png",
          menu: {
            xtype: "menu",
            showSeparator: false,
            items: [
              { 
                text: "Security Credentials",
                icon: "images/credential.png",
                handler: get_credential
              },
              "-",
              { 
                text: "Sign Out",
                icon: "images/logout.png",
                handler: function() {
                  window.location = "/logout"
                }
              }
            ]
          }
        }
      ]
    });

    return Ext.create("Ext.Viewport", {
      layout: "border",
      items: [header, tabs]
    });
  });
}).call(this);
