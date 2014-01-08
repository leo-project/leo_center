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
var SUB_MENU_SYSTEM_CONF   = "System Conf";
var SUB_MENU_USERS         = "Users";
var SUB_MENU_BUCKETS       = "Buckets";
var SUB_MENU_ENDPOINTS     = "Endpoints";
var SUB_MENU_ASSIGNED_FILE = "Assigned File";

var IMG_SYSTEM_CONF   = "<img src='images/system_conf.png'/>";
var IMG_USERS         = "<img src='images/users.png'/>";
var IMG_BUCKETS       = "<img src='images/bucket.png'/>";
var IMG_ENDPOINTS     = "<img src='images/endpoint.png'/>";
var IMG_ASSIGNED_FILE = "<img src='images/whereis.png'/>";
var NBSP = "&nbsp";
var SUB_MENU_INDEX = "item";
var SUB_MENU_ITEMS = [SUB_MENU_INDEX];


(function() {
  Ext.define(PANE_ADMIN_VIEW, {
    extend: "Ext.panel.Panel",
    id: "admin_view",
    title: "Admin Tools",
    layout: "border",

    system_conf_sub_view:   Ext.create(PANE_SUB_SYSTEM_CONF),
    user_sub_view:          Ext.create(PANE_SUB_USERS),
    bucket_sub_view:        Ext.create(PANE_SUB_BUCKETS),
    endpoint_sub_view:      Ext.create(PANE_SUB_ENDPOINTS),
    assigned_file_sub_view: Ext.create(PANE_SUB_ASSIGNED_FILE),

    //
    // Set up the menu
    //
    admin_store: Ext.create("Ext.data.Store", {
      fields: SUB_MENU_ITEMS,
      data: [ { item: SUB_MENU_SYSTEM_CONF},
              { item: SUB_MENU_USERS},
              { item: SUB_MENU_BUCKETS},
              { item: SUB_MENU_ENDPOINTS},
              { item: SUB_MENU_ASSIGNED_FILE}
            ]
    }),

    // initialize
    initComponent: function() {
      // Right Pane: Sub Item Container
      var sub_item_container = Ext.create("Ext.panel.Panel", {
        region: "center",
        layout: "card",
        activeItem: 0,
        items: [
          this.system_conf_sub_view,
          this.user_sub_view,
          this.bucket_sub_view,
          this.endpoint_sub_view,
          this.assigned_file_sub_view
        ]
      });

      // Left Pane: Menu Container
      var menu_container = Ext.create("Ext.grid.Panel", {
        title: "Menu",
        region: "west",
        id: "menu_container",
        width: 200,
        forceFit: true,
        hideHeaders: true,
        store: this.admin_store,
        columns: [{
          dataIndex: SUB_MENU_INDEX,
          renderer:
          function(value) {
            var img;
            switch(value) {
            case SUB_MENU_SYSTEM_CONF:
              img = IMG_SYSTEM_CONF + NBSP;
              break;
            case SUB_MENU_USERS:
              img = IMG_USERS + NBSP;
              break;
            case SUB_MENU_BUCKETS:
              img = IMG_BUCKETS + NBSP;
              break;
            case SUB_MENU_ENDPOINTS:
              img = IMG_ENDPOINTS + NBSP;
              break;
            case SUB_MENU_ASSIGNED_FILE:
              img = IMG_ASSIGNED_FILE + NBSP;
              break;
            }
            return img + value;
          }
        }],
        listeners: {
          select: function(grid, record, index) {
            sub_item_container.getLayout().setActiveItem(index);
          },
          afterrender: function(grid) {
            grid.getSelectionModel().select(0);
          }
        }
      });

      Ext.apply(this, {
        items: [sub_item_container, menu_container]
      });
      return this.callParent(arguments);
    }
  });
}).call(this);
