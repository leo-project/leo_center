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
  Ext.define("LeoCenter.model.Endpoints", {
    extend: "Ext.data.Model",
    fields: [
      "endpoint",
      { name: "created_at", type: "date", dateFormat: "U" }
    ]
  });

  Ext.define("LeoCenter.Endpoints", {
    extend: "Ext.panel.Panel",
    id: "endpoints",
    title: "Endpoints",
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

    store: Ext.create("Ext.data.Store", {
      model: "LeoCenter.model.Endpoints",
      proxy: Ext.create("LeoCenter.proxy.Ajax.noParams", {
        url: "endpoints/list.json"
      })
    }),

    add_endpoint: function(self) {
      var title = "Add New Endpoint";
      var msg = "Please input endpoint name";

      Ext.Msg.prompt(title, msg, function(btn, value) {
        if (btn == "ok") {
          Ext.Ajax.request({
            url: "endpoints/add_endpoint",
            method: "POST",
            params: { endpoint: value },
            success: function(response) {
              self.load();
            },
            failure: function(response) {
              LeoCenter.Msg.alert("Error!", response.responseText);
            }
          })
        }
      })
    },

    delete_endpoint: function(self) {
      var self = this;
      var title = "Delete Endpoint";
      var last_selected = self.grid.getSelectionModel().getLastSelected();
      if (!last_selected) {
        LeoCenter.Msg.alert("Error!", "Please select a endpoint.");
      }
      else {
        var endpoint = last_selected.data.endpoint;
        var msg = "Are you sure to delete endpoint: '" + endpoint + "'?";
        Ext.Msg.on("beforeshow",  function (win) {
          win.defaultFocus = 2; // set default focus to "No" button
        });
        Ext.Msg.confirm(title, msg, function(btn) {
          if (btn == "yes") {
            Ext.Ajax.request({
              url: "endpoints/delete_endpoint",
              method: "DELETE",
              params: { endpoint: endpoint },
              success: function(response, opts) {
                self.load();
              },
              failure: function(response, opts) {
                LeoCenter.Msg.alert("Error!", response.responseText);
              }
            })
          }
        })
      }
    },

    initComponent: function() {
      var self = this;

      self.grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        border: false,
        forceFit: true,
        store: self.store,
        tbar: [{
          text: "Add Endpoint",
          icon: "images/add.png",
          handler: function() {
            self.add_endpoint(self);
          }
        }, {
          text: "Delete Endpoint",
          icon: "images/remove.png",
          handler: function() {
            self.delete_endpoint(self);
          }
        },
               "->",
               {
                 icon: "images/reload.png",
                 handler: function() {
                   self.load();
                 }
               }],
        columns: {
          defaults: { resizable: false },
          items: [{
            header: "Endpoint",
            dataIndex: "endpoint",
            width: 30,
            renderer: Ext.htmlEncode,
          }, {
            header: "Created at",
            dataIndex: "created_at",
            renderer: Ext.util.Format.dateRenderer("c")
          }]
        }
      });

      Ext.apply(self, {
        items: self.grid
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
