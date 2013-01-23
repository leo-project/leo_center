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

    do_send_command: function(user_id, password, node, command) {
      var self = this;

      Ext.Ajax.request({
        url: "nodes/execute",
        method: "POST",
        params: {
          user_id: user_id,
          password: password,
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
      LeoTamer.confirm_password(function(user_id, password) {
        self.do_send_command(user_id, password, node, command);
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
      groupHeaderTpl: "{name} [{rows.length}]"
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

    commands: ["suspend", "resume", "detach"],

    on_grid_select: function(self, record) {
      var node_stat = record.data;
      var change_status_button = Ext.getCmp("change_status_button");
      var status = node_stat.status;

      // using HTML 4.0 character entity references to avoid Ext.Panel#setTitle()'s cutting space
      // &nbsp; //=> non-breaking space
      self.status_panel.setTitle(self.get_status_icon(node_stat.status) + "&nbsp;" + node_stat.node);

      // check change status's availability
      if (node_stat.type === "Gateway") {
        change_status_button.disable();
      }
      else {
        switch (status) {
        case "stop":
        case "attached":
          change_status_button.disable();
          break;
        default:
          change_status_button.enable();
        }
      }

      Ext.Array.each(self.commands, function(command) {
        var command_button = Ext.getCmp("change_status_button_" + command);
        // check each command's availability
        if (self.available_commands_table[status][command]) {
          command_button.enable();
        }
        else {
          command_button.disable();
        }
      });

      if (status === "stop") {
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

      self.status_panel = Ext.create("Ext.Panel", {
        title: "Config/VM Status",
        region: "east",
        width: 300,
        resizable: false,
        tbar: [{
          xtype: "splitbutton",
          id: "change_status_button",
          icon: "images/rebalance.png",
          text: "Change Status",
          handler: function(splitbutton) {
            // show menu when splitbutton itself is pressed
            splitbutton.showMenu();
          },
          style: { "font-weight": "bold"}, //XXX: use CSS!
          menu:  {
            xtype: "menu",
            showSeparator: false,
            items: [{
              text: "Suspend",
              id: "change_status_button_suspend",
              handler: function(button) {
                var node = self.grid.getSelectionModel().getSelection()[0].data.node;
                self.confirm_send_command(node, "suspend");
              }
            }, {
              text: "Resume",
              id: "change_status_button_resume",
              handler: function(button) {
                var node = self.grid.getSelectionModel().getSelection()[0].data.node;
                self.confirm_send_command(node, "resume");
              }
            }, {
              text: "Detach",
              id: "change_status_button_detach",
              handler: function(button) {
                var node = self.grid.getSelectionModel().getSelection()[0].data.node;
                self.confirm_send_command(node, "detach");
              }
            }]
          }
        }],
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
        },
        listeners: {
          load: function() {
            var rebalance_button = Ext.getCmp("nodes_rebalance_button");
            var rebalance_ready = self.store.find("status", /attached|detached/) != -1;
            if (rebalance_ready) {
              rebalance_button.enable();
            }
            else {
              rebalance_button.disable();
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
            text: "Current Ring",
            dataIndex: 'ring_hash_current',
            width: 50
          }, {
            text: "Prev Ring",
            dataIndex: 'ring_hash_previous',
            width: 50
          }, {
            text: "Joined At",
            dataIndex: "joined_at"
          }]
        },
        tbar: [{
          xtype: "splitbutton",
          id: "nodes_grid_current_grouping",
          width: 120,
          handler: function(splitbutton) {
            // show menu when splitbutton itself is pressed
            splitbutton.showMenu();
          },
          style: { "font-weight": "bold"}, //XXX: use CSS!
          menu:  {
            xtype: "menu",
            showSeparator: false,
            items: [{
              text: "Group by type",
              icon: "images/table.png",
              handler: function(button) {
                self.select_grouping(self, button.text, "type");
              }
            }, {
              text: "Group by status",
              icon: "images/table.png",
              handler: function(button) {
                self.select_grouping(self, button.text, "status");
              }
            }]
          },
          listeners: {
            render: function() {
              // default grouping state
              self.select_grouping(self, "Group by type", "type");
            }
          }
        },
        "-",
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
        "-",
        {
          text: "Rebalance",
          id: "nodes_rebalance_button",
          icon: "images/rebalance.png",
          handler: function() {
            rebalance_ready = self.store.find("status", /attached|detached/) != -1;
            if (rebalance_ready) {
              var msg = "Are you sure to send 'rebalance'?";
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
