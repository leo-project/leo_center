// ======================================================================
//
//  Leo Tamer
//
//  Copyright (c) 2012 Rakuten, Inc.
//
//  This file is provided to you under the Apache License,
//  Version 2.0 (the "License"); you may not use this file
//  except in compliance with the License.  You may obtain
//  a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing,
//  software distributed under the License is distributed on an
//  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
//  KIND, either express or implied.  See the License for the
//  specific language governing permissions and limitations
//  under the License.
//
// ======================================================================
(function() {
  /*
  Highcharts.setOptions({
    credits: { enabled: false },
    global: { useUTC: false }
  });
  */

  Ext.onReady(function() {
    var node_status, bucket_status, admin, tabs, viewport;
    var header, get_credential;

    node_status = Ext.create("LeoTamer.Nodes");
    bucket_status = Ext.create("LeoTamer.Buckets");
    user_group = Ext.create("LeoTamer.Users");
    if (Ext.util.Cookies.get("admin") == "true") {
      admin = Ext.create("LeoTamer.Admin");
    }

    tabs = Ext.create("Ext.TabPanel", {
      region: "center",
      activeTab: 0,
      defaults: { bodyPadding: 5 },
      items: [bucket_status, user_group, node_status, admin]
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
