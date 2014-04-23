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
// @doc SUB VIEW - Assigned File in the AdminView
//
(function() {
  Ext.define(
    "LeoCenter.model.AssignedFile",
    { extend: "Ext.data.Model",
      fields: [ "node",
                "vnode_id",
                "size",
                "clock",
                "checksum",
                { name: "timestamp", type: "date", dateFormat: "U" },
                "delete", "num_of_chunks"
              ]
    });

  Ext.define(
    PANE_SUB_ASSIGNED_FILE,
    { extend: "Ext.panel.Panel",
      id: "assigned_file_sub_view",
      title: "Assigned File",
      layout: "border",
      border: false,

      store: Ext.create(
        "Ext.data.Store",
        { model: "LeoCenter.model.AssignedFile",
          proxy: Ext.create("LeoCenter.proxy.Ajax.noParams", {
            url: "whereis/list.json"
          })
        }),

      detail_store: Ext.create(
        "Ext.data.ArrayStore",
        { fields: ["name", "value"],
          data: []
        }),

      initComponent: function() {
        var self = this;

        self.grid = Ext.create(
          "Ext.grid.Panel",
          { region: "center",
            border: false,
            forceFit: true,
            store: self.store,
            tbar: [{ xtype: "textfield",
                     id: "whereis_grid_tbar_path",
                     fieldLabel: "<img src='images/filter.png'> Path:",
                     labelWidth: 60,
                     width: 500,

                     listeners: {
                       change: function() {
                         delete self.path;
                         self.store.removeAll();
                         self.detail_store.removeAll();
                         self.detail_grid.setTitle("");
                       },
                       specialkey: function(text_field, event) {
                         if (event.getKey() !== event.ENTER) return;
                         var path = text_field.getValue();
                         if (path === "") return;
                         self.path = path;
                         self.store.load({
                           params: {
                             path: path
                           },
                           callback: function() {
                             var grid = self.grid;
                             grid.getSelectionModel().select(0);
                             grid.getView().focus(null, 500);
                           }
                         });
                       }
                     }
                   },
                   "->",
                   {
                     icon: "images/reload.png",
                     handler: function() {
                       if (!self.path) return;
                       self.store.load({
                         params: {
                           path: self.path
                         },
                         callback: function() {
                           self.grid.getSelectionModel().select(0);
                         }
                       });
                     }
                   }],

            columns: { defaults: { resizable: false },
                       items: [{ dataIndex: "delete",
                                 width: 8,
                                 renderer: function(value) {
                                   if (value === false) return "";
                                   return "<img src='images/trash.png'>";
                                 }
                               },
                               { header: "Node", dataIndex: "node" },
                               {
                                 header: "Size",
                                 dataIndex: "size",
                                 width: 30,
                                 renderer: function(size) {
                                   var format_string = "0";
                                   if (size < 1024) {
                                     return Ext.util.Format.number(size, format_string);
                                   } else if (size < 1048576) {
                                     return Ext.util.Format.number(
                                       Math.round(((size * 100) / 1024)) / 100, format_string) + " KB";
                                   } else if (size < 1073741824) {
                                     return Ext.util.Format.number(
                                       Math.round(((size * 100) / 1048576)) / 100, format_string) + " MB";
                                   } else if (size < 1099511627776) {
                                     return Ext.util.Format.number(
                                       Math.round(((size * 100) / 1073741824)) / 100, format_string) + " GB";
                                   } else {
                                     return Ext.util.Format.number(
                                       Math.round(((size * 100) / 1099511627776)) / 100, format_string) + " TB";
                                   }
                                 }
                               },
                               { header: "Actual Size", dataIndex: "size", width: 40 },
                               { header: "Timestamp",
                                 dataIndex: "timestamp",
                                 renderer: Ext.util.Format.dateRenderer("c")
                               }
                              ]
                     },
            listeners: {
              select: function(grid, record, index) {
                self.detail_grid.setTitle(record.get("node"));
                self.detail_store.loadData(
                  [ ["Ring address", record.get("vnode_id")],
                    ["Clock", record.get("clock")],
                    ["Number of chunks", record.get("num_of_chunks")],
                    ["Checksum", record.get("checksum")]
                  ]);
              }
            }
          });

        self.detail_grid = Ext.create(
          "Ext.grid.Panel",
          { region: "east",
            title: "&nbsp;",
            width: 400,
            forceFit: true,
            store: self.detail_store,
            hideHeaders: true,
            columns: {
              defaults: { resizable: false },
              items: [{ dataIndex: "name", width: 60 },
                      { dataIndex: "value" }
                     ]
            }
          });

        Ext.apply(self, {
          items: [self.grid, self.detail_grid]
        });
        return self.callParent(arguments);
      }
    });
}).call(this);
