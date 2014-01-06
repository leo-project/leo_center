//======================================================================
//
// LeoFS
//
// Copyright (c) 2012-2014 Rakuten, Inc.
//
// This file is provided to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file
// except in compliance with the License.  You may obtain
// a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
//
//======================================================================
(function() {
  /* config for logs
     Highcharts.setOptions({
     credits: { enabled: false },
     global: { useUTC: false }
     });
  */

  Ext.onReady(function() {
    var bucket_status = Ext.create("LeoCenter.BucketStatus");
    var user_group = Ext.create("LeoCenter.UserGroup");
    var user_id = Ext.String.htmlEncode(Ext.util.Cookies.get("user_id"));

    // items for only administrator
    if (Ext.util.Cookies.get("admin") === "true") {
      var node_status = Ext.create("LeoCenter.Nodes");
      var admin = Ext.create("LeoCenter.Admin");
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
      LeoCenter.confirm_password(function(password) {
        Ext.Ajax.request({
          url: "user_credential",
          method: "POST",
          params: { password: password },
          success: function(response) {
            Ext.Msg.alert("Your Credential", response.responseText);
          },
          failure: function(response) {
            var response_text = response.responseText;

            if (response.status === 401) {
              LeoCenter.Msg.alert("Session Timeout", "Your session is expired.", function() {
                location = "/";
              });
            }
            else if (response_text === "Invalid User ID or Password.") {
              // "Invalid User ID or Password." is confusing
              LeoCenter.Msg.alert("Error!", "Invalid Password");
            }
            else {
              LeoCenter.Msg.alert("Error!", response_text);
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
        width: 102,
        height: 24,
        src: "images/leocenter-logo-w.png"},
              "->",
              { id: "user_menu",
                text: user_id, // raw cookie from server
                icon: "images/admin_user.png",
                menu: {
                  xtype: "menu",
                  showSeparator: false,
                  items: [{ text: "Security Credentials",
                            icon: "images/credential.png",
                            handler: get_credential},
                          "-",
                          { text: "Sign Out",
                            icon: "images/logout.png",
                            handler: function() {
                              window.location = "/logout"}}]}
              }]
    });

    return Ext.create("Ext.Viewport", {
      layout: "border",
      items: [header, tabs]
    });
  });
}).call(this);
