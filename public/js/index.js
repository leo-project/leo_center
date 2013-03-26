(function() {
  /* config for logs
     Highcharts.setOptions({
     credits: { enabled: false },
     global: { useUTC: false }
     });
  */

  Ext.onReady(function() {
    var bucket_status = Ext.create("LeoTamer.BucketStatus");
    var user_group = Ext.create("LeoTamer.UserGroup");
    var user_id = Ext.String.htmlEncode(Ext.util.Cookies.get("user_id"));

    // items for only administrator
    if (Ext.util.Cookies.get("admin") === "true") {
      var node_status = Ext.create("LeoTamer.Nodes");
      var admin = Ext.create("LeoTamer.Admin");
    }

    var tabs = Ext.create("Ext.TabPanel", {
      region: "center",
      activeTab: 0, // first tab
      tabBar: {
        defaults: { height: 30 },
        height: 28
      },
      defaults: { bodyPadding: 5 },
      items: [bucket_status, node_status, admin]
    });

    var get_credential = function() {
      LeoTamer.confirm_password(function(password) {
        Ext.Ajax.request({
          url: "user_credential",
          method: "GET",
          params: { password: password },
          success: function(response) {
            Ext.Msg.alert("Your Credential", response.responseText);
          },
          failure: function(response) {
            var response_text = response.responseText;

            if (response.status === 401) {
              location = "/";
            }
            else if (response_text === "Invalid User ID or Password.") {
              // "Invalid User ID or Password." is confusing
              LeoTamer.Msg.alert("Error!", "Invalid Password");
            }
            else {
              LeoTamer.Msg.alert("Error!", response_text);
            }
          }
        });
      });
    };

    var header = Ext.create("Ext.toolbar.Toolbar", {
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
        text: user_id, // raw cookie from server
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
