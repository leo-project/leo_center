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
      // it fires when "Node Status" tab is selected
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
      groupField: "group",
      proxy: {
        type: "ajax",
        url: "nodes/detail.json",
        reader: {
          type: "json",
          root: "data"
        },
        // disabe unused params
        noCache: false,
        limitParam: undefined,
        pageParam: undefined,
        sortParam: undefined,
        startParam: undefined,
        listeners: {
          exception: function(self, response, operation) {
            LeoTamer.Msg.alert("Error on: \'" + self.url + "\'", response.responseText);
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
          LeoTamer.Msg.alert("Error!", response.responseText);
        }
      });
    },

    confirm_send_command: function(node, command) {
      var self = this;

      Ext.Msg.on("beforeshow",  function (win) {
        win.defaultFocus = 2; // set default focus to "No" button
      });

      // confirm user's password before dangerous action
      LeoTamer.confirm_password({
        success: function(response) {
          self.do_send_command(node, command);
        },
        failure: function(reason) {
          LeoTamer.Msg.alert("Error!", reason);
        }
      });
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
      groupHeaderTpl: "{name} [{rows.length}]",
      collapsible: false
    }),

    select_grouping: function(self, text, group) {
      var splitbutton = Ext.getCmp("nodes_grid_current_grouping");
      splitbutton.setText(text);
      self.store.group(group);
    },

    detail_grid_grouping: Ext.create("Ext.grid.feature.Grouping", {
      groupHeaderTpl: "{name}",
      collapsible: false
    }),

    on_grid_select: function(self, record) {
      var node_stat = record.data;
      var change_status_button = Ext.getCmp("change_status_button");

      // using HTML 4.0 character entity references to avoid Ext.Panel#setTitle()'s cutting space
      // &nbsp; //=> non-breaking space
      self.status_panel.setTitle(self.get_status_icon(node_stat.status) + "&nbsp;" + node_stat.node);
 
      if (node_stat.type === "Gateway") {
        change_status_button.hide();
      }
      else {
        switch (node_stat.status) {
          case "stop":
          case "attached":
            change_status_button.hide();
            break;
          default:
            change_status_button.show();
        }
      }

      if (node_stat.status === "stop") {
        // can't get detail information from stopped node
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

    // it shows what commands are available on each state
    available_commands_table: {
      running: {
        suspend: true,
        detach: true
      },
      suspend: {
        resume: true
      },
      restarted: {
        resume: true
      },
      stop: {
        detach: true
      }
    },

    initComponent: function() {
      var self = this;

      self.send_command = function() {
        var node, command_combo, command_select_window, status;

        node = self.grid.getSelectionModel().getSelection()[0].data;
        status = node.status;

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
          // filter to show only available commands on the state
          filterFn: function(record) {
            return self.available_commands_table[status][record.data.command] ? true : false;
          }
        });

        command_select_window = Ext.create('Ext.window.Window', {
          title: node.node,
          items: command_combo,
          buttons: [{
            text: "Apply",
            handler: function() {
              var command = command_combo.getValue();
              if (command) {
                self.confirm_send_command(node.node, command);

              }
              else {
                LeoTamer.Msg.alert("Error!", "Command not specified");
              }
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

      self.status_panel = Ext.create("Ext.Panel", {
        title: "Config/VM Status",
        region: "east",
        width: 300,
        resizable: false,
        items: [{
          xtype: "grid",
          border: false,
          forceFit: true,
          hideHeaders: true,
          viewConfig: { loadMask: false },
          features: [ self.detail_grid_grouping ],
          store: self.detail_store,
          columns: [{
            dataIndex: "name",
            text: "Name"
          }, {
            dataIndex: "value",
            text: "Value"
          }],
          listeners: {
            beforeselect: function() {
              return false; // disable row selection
            }
          },
          buttons: [{
            id: "change_status_button",
            margin: 10,
            text: "Change Status",
            handler: self.send_command
          }]
        }]
      });

      self.store = Ext.create("Ext.data.Store", {
        model: "LeoTamer.model.Nodes",
        proxy: {
          type: "ajax",
          url: "nodes/status.json",
          reader: {
            type: "json",
            root: "data"
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
              LeoTamer.Msg.alert("Error on: \'" + store.url + "\'", response.responseText);
            }
          }
        }
      });

      self.grid = Ext.create("Ext.grid.Panel", {
        store: self.store,
        region: "center",
        forceFit: true,
        features: [ self.grid_grouping ],
        columns: {
          defaults: { resizable: false },
          items: [{
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
            text: "Current Ring-hash",
            dataIndex: 'ring_hash_current',
            width: 50
          }, {
            text: "Previous Ring-hash",
            dataIndex: 'ring_hash_previous',
            width: 50
          }, {
            text: "Joined At",
            dataIndex: "joined_at"
          }]
        },
        tbar: [{
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
        "-",
        {
          xtype: "splitbutton",
          id: "nodes_grid_current_grouping",
          handler: function(splitbutton) {
            // show menu when splitbutton itself is pressed
            splitbutton.showMenu();
          },
          style: { "font-weight": "bold" },
          menu: {
            xtype: "menu",
            showSeparator: false,
            defaults: {
              style: { "font-weight": "bold" },
            },
            items: [{
              text: "Group by Type",
              icon: "images/table.png",
              handler: function(button) {
                self.select_grouping(self, button.text, "type");
              }
            }, {
              text: "Group by Status",
              icon: "images/table.png",
              handler: function(button) {
                self.select_grouping(self, button.text, "status");
              }
            }]
          },
          listeners: {
            render: function() {
              // default grouping state
              self.select_grouping(self, "Group by Type", "type");
            }
          }
        },
        "-",
        {
          text: "Rebalance",
          handler: function() {
            var msg = "Are you sure to send command 'rebalance'?";
            Ext.Msg.confirm("Confirm", msg, function(btn) {
              if (btn == "yes") {
                Ext.Ajax.request({
                  url: "nodes/rebalance",
                  method: "POST",
                  success: function(response) {
                    self.store.load();
                  },
                  failure: function(response) {
                    LeoTamer.Msg.alert("Error!", response.responseText);
                  }
                });
              }
            });
          }
        },
        "->",
        {
          xtype: "button",
          icon: "images/reload.png",
          handler: function() {
            self.store.load();
          }
        }],
        listeners: {
          render: function(grid) {
            grid.getStore().on("load", function() {
              // select row which was selected before reload
              grid.getSelectionModel().select(self.selected_index);
            });
          },
          beforeselect: function(grid, record, index) {
            self.selected_index = index; // save which row is selected before reload
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
