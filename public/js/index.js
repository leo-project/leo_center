(function() {
  /* config for logs
     Highcharts.setOptions({
     credits: { enabled: false },
     global: { useUTC: false }
     });
  */

  Ext.onReady(function() {
    var node_status, bucket_status, admin, tabs, viewport;
    var header, get_credential;

    bucket_status = Ext.create("LeoTamer.BucketStatus");
    user_group = Ext.create("LeoTamer.UserGroup");

    // items for only administrator
    if (Ext.util.Cookies.get("admin") === "true") {
      node_status = Ext.create("LeoTamer.Nodes");
      admin = Ext.create("LeoTamer.Admin");
    }

    tabs = Ext.create("Ext.TabPanel", {
      region: "center",
      activeTab: 0, // first tab
      tabBar: {
        defaults: { height: 30 },
        height: 28
      },
      defaults: { bodyPadding: 5 },
      items: [bucket_status, node_status, admin]
    });

    get_credential = function() {
      Ext.Msg.prompt("Confirm", "Please input your password", function(btn, value) {
        if (btn === "ok" ) {
          Ext.Ajax.request({
            url: "user_credential",
            method: "GET",
            params: {
              user_id: Ext.util.Cookies.get("user_id"),
              password: value
            },
            success: function(response) {
              Ext.Msg.alert("Your Credential", response.responseText);
            },
            failure: function(response) {
              LeoTamer.Msg.alert("Error!", response.responseText);
            }
          });
        }
      });
    };

    header = Ext.create("Ext.toolbar.Toolbar", {
      id: "viewport_header",
      region: "north",
      border: false,
      items: [{
        xtype: "image",
        margin: 6,
        width: 75,
        height: 24,
        src: "images/leofs-logo-w.png"
      },
      "->",
      {
        id: "user_menu",
        text: Ext.util.Cookies.get("user_id"), // raw cookie from server
        icon: "images/admin_user.png",
        menu: {
          xtype: "menu",
          showSeparator: false,
          items: [{
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
          }]
        }
      }]
    });

    return Ext.create("Ext.Viewport", {
      layout: "border",
      items: [header, tabs]
    });
  });
}).call(this);
