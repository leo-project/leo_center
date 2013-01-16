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
  Ext.define("LeoTamer.model.Nodes", {
    extend: "Ext.data.Model",
    fields: ["type", "node", "status", "ring_hash_current", "ring_hash_previous", "joined_at"]
  });

  Ext.define("LeoTamer.Nodes", {
    extend: "Ext.panel.Panel",

    title: "Node Status",
    id: "nodes_panel",
    layout: "border",
    reload_interval: 30000,

    select_first_row: function() {
      var self = this;
      var grid = self.grid;
      grid.getStore().on("load", function() {
        grid.getSelectionModel().select(0);
      }, null, { single: true });
    },

    listeners: {
      activate: function(self) {
        self.select_first_row();

        self.reloader = {
          run: function() {
            self.store.load();
          },
          interval: self.reload_interval
        };
        Ext.TaskManager.start(self.reloader);
      },
      deactivate: function(self) {
        Ext.TaskManager.stop(self.reloader);
      }
    },

    command_store: Ext.create("Ext.data.Store", {
      fields: [ "command" ],
      data: [
        { command: "resume" },
        { command: "suspend" },
        { command: "detach" }
      ]
    }),

    detail_store: Ext.create("Ext.data.ArrayStore", {
      model: "LeoTamer.model.NameValue",
      proxy: {
        type: 'ajax',
        url: 'nodes/detail.json',
        reader: {
          type: 'json',
          root: 'data'
        },
        // disabe unused params
        noCache: false,
        limitParam: undefined,
        pageParam: undefined,
        sortParam: undefined,
        startParam: undefined,
        listeners: {
          exception: function(self, response, operation) {
            Ext.Msg.alert("Error on: \'" + self.url + "\'", response.responseText);
          }
        }
      }
    }),

    do_send_command: function(node, command) {
      var self = this;

      Ext.Ajax.request({
        url: "nodes/execute",
        method: "POST",
        params: {
          node: node,
          command: command
        },
        success: function(response) {
          self.store.load();
        },
        failure: function(response) {
          Ext.Msg.alert("Error!", response.responseText);
        }
      });
    },

    confirm_send_command: function(node, command) {
      var self = this;

      Ext.Msg.on("beforeshow",  function (win) {
        win.defaultFocus = 2; // set default focus to "No" button
      });

      switch (command) {
        case "detach":
        case "suspend":
          Ext.Msg.prompt("Confirm", "Please input your password", function(btn, value) {
            if (btn == "ok" ) {
              console.log(tamer.user_id);
              Ext.Ajax.request({
                url: "login",
                method: "POST",
                params: {
                  user_id: Ext.util.Cookies.get("user_id"),
                  password: value
                },
                success: function(response, opts) {
                  text = response.responseText;
                  response = Ext.JSON.decode(text);
                  if (response.success) {
                    // truely success
                    self.do_send_command(node, command);
                  }
                  else {
                    // failure
                    Ext.Msg.alert("Error!", response.errors.reason);
                  }
                },
                failure: function(response, opts) {
                  Ext.Msg.alert("Error!", response.responseText);
                }
              });
            }
          });
          break;
        default:
          var msg = "Are you sure to send command '" + command + " " + node + "'?";
          Ext.Msg.confirm("Confirm", msg, function(btn) {
            if (btn == "yes") self.do_send_command(node, command);
          });
      }
    },

    get_status_icon: function(val) {
      var src;
      switch (val) {
        case "running":
          src = "images/running.png";
          break;
        case "stop":
        case "downed":
        case "detached":
          src = "images/downed.png";
          break;
        case "restarted":
        case "attached":
          src = "images/add.png";
          break;
        case "suspend":
          src = "images/warn.png";
          break;
        default:
          throw "invalid status specified: " + val;
      }
      return "<img class='status' src='" + src + "'> ";
    },

    status_renderer: function(val) {
      var self = this;
      var img = self.get_status_icon(val);
      return img + val;
    },

    grid_grouping: Ext.create("Ext.grid.feature.Grouping", {
      groupHeaderTpl: "{name} [{rows.length}]"
    }),

    rewrite_status_body: function(self, node_stat) {
      var name = node_stat.node;
      var status = node_stat.status;

      self.status_body.update(self.get_status_icon(status) + " " + name);

      var change_status_button = Ext.getCmp("change_status_button");

      if (node_stat.type == "Gateway") {
         change_status_button.hide();
      }
      else {
         change_status_button.show();
      }
    },

    on_grid_select: function(self, record) {
      var node_stat = record.data;

      self.rewrite_status_body(self, node_stat);

      if (node_stat.status === "stop") {
        self.detail_store.removeAll();
      }
      else {
        self.detail_store.load({
          params: {
            node: node_stat.node,
            type: node_stat.type
          }
        });
      }
    },

    available_command_filter: function(status, command) {
      switch (status) {
        case "running":
          if (command === "suspend") return true;
          if (command === "detach") return true;
          return false;
        case "suspend":
        case "restarted":
          if (command === "resume") return true;
          return false;
        case "stop":
          if (command === "detach") return true;
          return false;
      }
    },

    initComponent: function() {
      var self = this;

      self.send_command = function() {
        var node, command_combo, command_select_window;

        node = self.grid.getSelectionModel().getSelection()[0].data;

        command_combo = Ext.create("Ext.form.ComboBox", {
          padding: 10,
          store: self.command_store,
          labelWidth: 125,
          fieldLabel: "Execute Command",
          displayField: "command",
          valueField: "command",
          emptyText: "Select Command",
          allowBlank: false,
          editable: false
        });

        self.command_store.filter({
          filterFn: function(record) {
            return self.available_command_filter(node.status, record.data.command);
          }
        });

        command_select_window = Ext.create('Ext.window.Window', {
          title: node.node,
          items: command_combo,
          buttons: [{
            text: "Apply",
            handler: function() {
              var command = command_combo.getValue();
              self.confirm_send_command(node.node, command);
              command_select_window.close();
            }
          }, {
            text: "Cancel",
            handler: function() {
              command_select_window.close();
            }
          }],
          listeners: {
            close: function() {
              self.command_store.clearFilter();
            }
          }
        }).show();
      };

      self.status_body = Ext.create("Ext.Panel", {
        id: "node_status",
        border: false,
        padding: 5,
        height: 60,
        buttons: [{
          xtype: "button",
          id: "change_status_button",
          text: "Change Status",
          handler: self.send_command
        }]
      });

      self.status_panel = Ext.create("Ext.Panel", {
        title: "Node Status/Name",
        region: "east",
        width: 300,
        resizable: false,
        items: [
          self.status_body,
          {
            xtype: 'grid',
            title: "Config/VM Status",
            border: false,
            forceFit: true,
            hideHeaders: true,
            viewConfig: {
              loadMask: false
            },
            store: self.detail_store,
            columns: [
              {
                dataIndex: "name",
                text: "Name"
              }, {
                dataIndex: "value",
                text: "Value"
              }
            ],
            listeners: {
              beforeselect: function() {
                return false; // disable row select
              }
            }
          }
        ]
      });

      self.store = Ext.create("Ext.data.Store", {
        model: "LeoTamer.model.Nodes",
        groupField: 'type',
        proxy: {
          type: 'ajax',
          url: 'nodes/status.json',
          reader: {
            type: 'json',
            root: 'data'
          },
          // disable unused params
          noCache: false,
          limitParam: undefined,
          pageParam: undefined,
          sortParam: undefined,
          startParam: undefined,
          groupParam: undefined,
          listeners: {
            exception: function(store, response, operation) {
              Ext.Msg.alert("Error on: \'" + store.url + "\'", response.responseText);
            }
          }
        }
      });

      self.grid = Ext.create("Ext.grid.Panel", {
        store: self.store,
        region: "center",
        forceFit: true,
        features: [ self.grid_grouping ],
        viewConfig: {
          trackOver: false
        },
        columns: {
          defaults: {
            resizable: false
          },
          items: [
            {
              text: "Node",
              dataIndex: 'node',
              sortable: true,
              width: 150
            }, {
              text: "Status",
              dataIndex: 'status',
              renderer: Ext.Function.bind(self.status_renderer, self), // modify fn scope
              sortable: true,
              width: 50
            }, {
              text: "Ring (Cur)",
              dataIndex: 'ring_hash_current',
              width: 50
            }, {
              text: "Ring (Prev)",
              dataIndex: 'ring_hash_previous',
              width: 50
            }, {
              text: "Joined At",
              dataIndex: "joined_at"
            }
          ]
        },
        tbar: [
          {
            xtype: "textfield",
            fieldLabel: "<img src='images/filter.png'> Filter:",
            labelWidth: 60,
            listeners: {
              change: function(text_field, new_value) {
                var store = self.store;
                store.clearFilter();
                store.filter("node", new RegExp(new_value));
              }
            }
          },
          "->",
          {
            xtype: "button",
            icon: "images/reload.png",
            handler: function() {
              self.store.load();
            }
          }
        ],
        listeners: {
          render: function(grid) {
            grid.getStore().on("load", function() {
              grid.getSelectionModel().select(self.selected_index);
            });
          },
          beforeselect: function(grid, record, index) {
            self.selected_index = index;
          },
          select: function(grid, record, index) {
            self.on_grid_select(self, record);
          }
        }
      });

      Ext.apply(self, {
        items: [self.grid, self.status_panel]
      });

      return self.callParent(arguments);
    }
  });

}).call(this);
