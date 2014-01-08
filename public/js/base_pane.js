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

var COOKIE_USER_ID = "user_id";
var ROLE_ADMIN   = "admin";
var ROLE_GENERAL = "general";

// @doc the Base Pane
//
(function() {
  Ext.onReady(function() {
    // Load the panes
    var bucket_status = Ext.create(PANE_BUCKET_STATUS);
    var node_status   = Ext.create(PANE_NODE_STATUS);
    var admin_view    = Ext.create(PANE_ADMIN_VIEW);

    // Able to see panes for administrators
    var user_id = Ext.String.htmlEncode(Ext.util.Cookies.get(COOKIE_USER_ID));
    var panes = (Ext.util.Cookies.get(ROLE_ADMIN) === "true")
      ? [bucket_status, node_status, admin_view]
      : [bucket_status];

    // Prefer the tab-panes
    //    selected tab is 'bucket-status'
    var tabs = Ext.create(
      "Ext.TabPanel",
      { region: "center",
        activeTab: 0,
        tabBar: { defaults: { height: 30 },
                  height: 28
                },
        defaults: { bodyPadding: 5 },
        items: panes
      });

    // User-Info-Pane's on-click event handler
    //   Retrieve user credential keys by user-id
    var get_credential = function() {
      LeoCenter.confirm_password(function(password) {
        Ext.Ajax.request(
          { url: "user_credential",
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
              else {
                LeoCenter.Msg.alert("Error!", response_text);
              }
            }
          });
      });
    };

    //
    // User Info Pane
    //
    var user_info = Ext.create(
      "Ext.toolbar.Toolbar",
      { id: "viewport_user_info",
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
                  text: user_id,
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
      items: [user_info, tabs]
    });
  });
}).call(this);
