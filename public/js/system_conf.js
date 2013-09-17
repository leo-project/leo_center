//======================================================================
//
// LeoFS
//
// Copyright (c) 2012-2013 Rakuten, Inc.
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
  Ext.define("LeoTamer.SystemConf", {
    extend: "Ext.panel.Panel",
    id: "system_conf",
    title: "System Conf",
    layout: "border",
    border: false,

    listeners: {
      activate: function(self) {
        self.load();
      }
    },

    load: function() {
      this.store.load();
    },

    initComponent: function() {
      var self = this;

      self.store = Ext.create("Ext.data.ArrayStore", {
        model: "LeoTamer.model.NameValue",
        proxy: Ext.create("LeoTamer.proxy.Ajax.noParams", {
          url: "system_conf/list.json"
        })
      }),

      self.grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        forceFit: true,
        store: self.store,
        border: false,
        tbar: [
          "->",
          {
            xtype: "button",
            icon: "images/reload.png",
            handler: function() {
              self.store.load();
            }
          }
        ],
        columns: [{
          dataIndex: "name",
          text: "Name",
          width: 30
        }, {
          dataIndex: "value",
          text: "Value"
        }]
      });

      Ext.apply(self, {
        items: self.grid
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
