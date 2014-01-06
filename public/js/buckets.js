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
  Ext.define('LeoCenter.model.Buckets', {
    extend: 'Ext.data.Model',
    fields: [
      "name", "owner",
      { name: "created_at", type: "date", dateFormat: "U" }
    ]
  });

  Ext.define("LeoCenter.Buckets", {
    extend: "Ext.panel.Panel",
    id: "buckets",
    title: "Buckets",
    layout: "border",
    border: false,

    listeners: {
      activate: function(self) {
        self.load();
      }
    },

    grid_grouping: Ext.create("Ext.grid.feature.Grouping", {
      groupHeaderTpl: "{name} [{rows.length}]",
      collapsible: false
    }),

    load: function() {
      this.store.load();
    },

    add_bucket: function(self) {
      var title = "Add New Bucket";
      var msg = "Please input bucket name";

      Ext.Msg.prompt(title, msg, function(btn, value) {
        if (btn == "ok") {
          Ext.Ajax.request({
            url: "buckets/add_bucket",
            method: "POST",
            params: { bucket: value },
            success: function(response, opts) {
              self.load();
            },
            failure: function(response, opts) {
              LeoCenter.Msg.alert("Error!", response.responseText);
            }
          })
        }
      })
    },

    render_progress_bar: function(value, sum) {
      var id = Ext.id();
      Ext.defer(function () {
        Ext.widget('progressbar', {
          text: value,
          border: false,
          renderTo: id,
          value: value / sum,
        });
      }, 50);
      return Ext.String.format('<div id="{0}"></div>', id);
    },

    store: Ext.create("Ext.data.Store", {
      model: "LeoCenter.model.Buckets",
      groupField: "owner",
      proxy: Ext.create("LeoCenter.proxy.Ajax.noParams", {
        url: "buckets/list.json"
      })
    }),

    initComponent: function() {
      var self = this;

      self.grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        forceFit: true,
        features: [ self.grid_grouping ],
        store: self.store,
        border: false,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "<img src='images/filter.png'> Filter:",
          labelWidth: 60,
          listeners: {
            change: function(text_field, new_value) {
              var store = self.store;
              store.clearFilter();
              store.filter("name", new RegExp(new_value));
            }
          }
        },
               "-",
               {
                 text: "Add Bucket",
                 icon: "images/add.png",
                 handler: function() {
                   self.add_bucket(self);
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
          defaults: {
            resizable: false
          },
          items: [{
            header: "Bucket",
            dataIndex: "name",
            renderer: Ext.util.Format.htmlEncode,
            width: 30
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
