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
// @doc Node Status View
//
(function() {
  Ext.define("LeoCenter.model.Nodes",
             { extend: "Ext.data.Model",
               fields: ["type",
                        "node",
                        "status",
                        "ring_hash_current",
                        "ring_hash_previous",
                        { name: "joined_at",
                          type: "date",
                          dateFormat: "U" }
                       ]
             });

  /**
   * the pane of node-status
   *
   */
  Ext.define(
    PANE_NODE_STATUS,
    { extend: "Ext.panel.Panel",
      title: "Node Status",
      id: "node_status_view",
      reload_interval: 30000,

      layout: {
        type: "hbox",
        align: "stretch"
      },

      select_first_row: function() {
        var self = this;
        var grid = self.grid;
        grid.getStore().on("load", function() {
          grid.getSelectionModel().select(0);
          grid.getView().focus(null, 500);
        }, null, { single: true });
      },

      listeners: {
        // it fires when "Node Status" tab is selected
        activate: function(self) {
          self.select_first_row();
          self.reloader = {
            run: function() { self.store.load(); },
            interval: self.reload_interval
          };
          Ext.TaskManager.start(self.reloader);
        },
        deactivate: function(self) {
          Ext.TaskManager.stop(self.reloader);
        }
      },

      command_store: Ext.create(
        "Ext.data.Store",
        { fields: [ "command" ],
          data: [{ command: "resume"  },
                 { command: "suspend" },
                 { command: "detach"  }
                ]
        }),

      detail_store: Ext.create(
        "Ext.data.ArrayStore",
        { model: "LeoCenter.model.NameValue",
          groupField: "group",
          proxy: Ext.create("LeoCenter.proxy.Ajax.noParams", {
            url: "nodes/detail.json"
          })
        }),

      do_send_command: function(password, node, command) {
        var self = this;

        Ext.Ajax.request({
          url: "nodes/execute",
          method: "POST",
          params: { password: password,
                    node: node,
                    command: command
                  },
          success: self.store.load.bind(self.store),
          failure: function(response) {
            LeoCenter.Msg.alert("Error!", response.responseText);
          }
        });
      },

      confirm_send_command: function(command) {
        var self = this;
        var node = self.grid.getSelectionModel().getSelection()[0].data; // selected node
        var node_name = node.node;
        var future_status = self.command_to_status[command];
        var msg = 'Are you sure to change status from <b>"'
          + node.status + '" to "'
          + future_status + '"</b> ?';

        // confirm user's password before dangerous action
        LeoCenter.confirm_password(function(password) {
          self.do_send_command(password, node_name, command);
        }, msg);
      },

      get_status_icon: function(status) {
        switch (status) {
        case "running":  return "images/available.png";
        case "stop":
        case "downed":   return "images/fire.png";
        case "detached": return "images/unavailable.png";
        case "restarted":
        case "attached": return "images/add.png";
        case "suspend":  return "images/warn.png";
        default:
          throw "invalid status specified: " + status;
        }
      },

      get_status_img: function(status) {
        var self = this;
        return "<img class='status' src='" + self.get_status_icon(status) + "'> ";
      },

      status_renderer: function(val) {
        var self = this;
        var img = self.get_status_img(val);
        return img + val;
      },

      grid_grouping: Ext.create("Ext.grid.feature.Grouping", {
        groupHeaderTpl: "{name} [{rows.length}]"
      }),

      select_grouping: function(text, group) {
        var self = this;
        var splitbutton = Ext.getCmp("nodes_grid_current_grouping");
        splitbutton.setText(text);
        self.store.group(group);
      },

      detail_grid_grouping: Ext.create("Ext.grid.feature.Grouping", {
        groupHeaderTpl: "{name}",
        collapsible: false
      }),

      commands: ["suspend", "resume", "detach"],

      on_grid_select: function(record) {
        var self = this;
        var node_stat = record.data;
        var node = node_stat.node;
        var change_status_button = Ext.getCmp("change_status_button");
        var compaction_button = Ext.getCmp("compaction_button");
        var status = node_stat.status;

        self.status_panel.setTitle(node_stat.node);
        change_status_button.setIcon(self.get_status_icon(status));

        // check change status's availability
        if (node_stat.type === "Gateway") {
          change_status_button.disable();
          compaction_button.disable();
        }
        else { // Storage
          switch (status) {
          case "stop":
          case "attached":
          case "detached":
            change_status_button.disable();
            compaction_button.disable();
            break;
          default:
            change_status_button.enable();
            compaction_button.enable();
          }
        }

        if (!change_status_button.isDisabled()) {
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
        }

        if (status === "stop") {
          // can't get detail information from stopped node
          self.detail_store.removeAll();
        }
        else {
          self.detail_store.load({
            params: { node: node,
                      type: node_stat.type
                    },
            callback: function(records, operation, success) {
              if (!success) self.detail_store.removeAll();
            }
          });
        }
      },

      // what status the command make nodes to be
      command_to_status: { suspend: "suspend",
                           resume:  "running",
                           detach:  "detached"
                         },

      // it shows what commands are available on each state
      available_commands_table: { running:   {suspend: true, detach: true},
                                  suspend:   {resume: true},
                                  detached:  {},
                                  restarted: {resume: true},
                                  stop:      {detach: true}
                                },

      status_sort_table: { attached:  1,
                           running:   2,
                           suspend:   3,
                           restarted: 4,
                           detached:  5,
                           stop:      6
                         },

      // compaction status and available compaction command
      // status: command
      available_compact_command: { idle: "Start",
                                   running: "Suspend",
                                   suspend: "Resume"
                                 },

      initComponent: function() {
        var self = this;

        var change_status_button = Ext.create(
          "Ext.SplitButton",
          { id: "change_status_button",
            cls: "bold_button",
            text: "Change Status",
            handler: function(splitbutton) {
              // show menu when splitbutton itself is pressed
              splitbutton.showMenu();
            },
            menu: { xtype: "menu",
                    showSeparator: false,
                    items: [{ text: "To Suspend",
                              icon: "images/warn.png",
                              id: "change_status_button_suspend",
                              handler: function(button) {
                                self.confirm_send_command("suspend");
                              }
                            },
                            { text: "To Running",
                              icon: "images/available.png",
                              id: "change_status_button_resume",
                              handler: function(button) {
                                self.confirm_send_command("resume");
                              }
                            },
                            { text: "To Detached",
                              icon: "images/unavailable.png",
                              id: "change_status_button_detach",
                              handler: function(button) {
                                self.confirm_send_command("detach");
                              }
                            }]
                  }
          });

        var show_compaction_window = function() {
          var node = self.grid.getSelectionModel().getSelection()[0].data.node;
          var pending_targets = self.detail_store.getById("num_of_pending_targets").get("value");
          var status = self.detail_store.getById("status").get("value");
          var command = self.available_compact_command[status];

          var form = Ext.create(
            "Ext.form.Panel",
            { frame: true,
              minWidth: 300,
              defaults: { padding: 5 },
              items: [{ xtype: "displayfield",
                        value: "Current Status: " + status
                      },
                      { xtype: "displayfield",
                        value: "Command: " + command
                      }],
              buttons: [
                { text: command,
                  handler: function(button) {
                    var form = button.up("form").getForm();
                    var errors = {};

                    if (!form.isValid()) {
                      form.getFields().each(function(field) {
                        var label  = field.fieldLabel;
                        var field_errors = field.getErrors();
                        if (field_errors.length === 0) return;
                        errors[label] = field_errors[0];
                        field.setRawValue(""); // clear the field
                      });

                      var error_text = "";
                      Ext.Object.each(errors, function(key, value) {
                        error_text += key + ": " + value;
                      });

                      LeoCenter.Msg.alert("Error!", error_text);
                      return;
                    }

                    LeoCenter.confirm_password(function(password) {
                      form.submit({
                        url: "/nodes/compact_" + command.toLowerCase(),
                        params: { node: node },
                        success: function() {
                          self.store.load();
                          button.up("window").close();
                        },
                        failure: function(form, action) {
                          var response = action.response;
                          LeoCenter.Msg.alert("Error!", response.responseText);
                        }
                      });
                    });
                  }
                },
                { text: "Cancel",
                  handler: function(button) {
                    var compaction_window = button.up("window");
                    compaction_window.close();
                  }
                }
              ]
            });

          if (command === "Start") {
            options = { xtype: "fieldset",
                        title: "Options",
                        defaults: {
                          padding: 5,
                          labelWidth: 160,
                          width: 220,
                          labelAlign: "right",
                        },
                        items: [{ xtype: "numberfield",
                                  id: "compaction_num_of_targets",
                                  fieldLabel: "Num of Targets",
                                  name: "num_of_targets",
                                  allowBlank: false,
                                  value: pending_targets,
                                  maxValue: pending_targets,
                                  minValue: 1
                                },
                                { xtype: "numberfield",
                                  fieldLabel: "Num of Compaction Procs",
                                  name: "num_of_compact_proc",
                                  allowBlank: false,
                                  value: 1,
                                  maxValue: 16,
                                  minValue: 1
                                }
                               ]
                      }
            form.add(options);
          }

          Ext.create(
            "Ext.Window",
            { title: "Compaction: " + node,
              border: false,
              items: form
            }).show();
        };

        var compaction_button = Ext.create(
          "Ext.Button",
          { text: "Compaction",
            cls: "bold_button",
            id: "compaction_button",
            icon: "images/compaction.png",
            handler: function() {
              show_compaction_window();
            }
          });

        self.status_panel = Ext.create(
          "Ext.Panel",
          { title: "Config/VM Status",
            width: 380,
            autoScroll: true,
            tbar: [
              change_status_button,
              compaction_button
            ],
            items: [{ xtype: "grid",
                      border: false,
                      forceFit: true,
                      hideHeaders: true,
                      viewConfig: { loadMask: false },
                      features: [ self.detail_grid_grouping ],
                      store: self.detail_store,
                      columns: [{ dataIndex: "name",
                                  text: "Name"
                                },
                                { dataIndex: "value",
                                  text: "Value",
                                  renderer: function(value, _, record) {
                                    // fomat last_compaction_start date
                                    if (record.internalId === "last_compaction_start") {
                                      if (value === 0) return "";
                                      var date = Ext.Date.parse(value, "U"); // parse UNIX time to Date
                                      return Ext.Date.format(date, "c"); // ISO 8601 format
                                    }
                                    return value;
                                  }
                                }],
                      listeners: {
                        beforeselect: function() {
                          return false; // disable row selection
                        }
                      }
                    }]
          });

        var set_rebalance_button_state = function() {
          var rebalance_button = Ext.getCmp("nodes_rebalance_button");
          var rebalance_ready = self.store.find("status", /attached|detached/) != -1;
          if (rebalance_ready) {
            rebalance_button.enable();
          }
          else {
            rebalance_button.disable();
          }
        }

        self.store = Ext.create(
          "Ext.data.Store",
          { model: "LeoCenter.model.Nodes",
            proxy: Ext.create("LeoCenter.proxy.Ajax.noParams", {
              url: "nodes/status.json"
            }),
            listeners: {
              load: function() {
                set_rebalance_button_state();
              }
            }
          });

        var status_sort = function(state) {
          self.store.sort({
            property: "status",
            direction: state,
            sorterFn: function(record1, record2) {
              var property = "status";
              var status1 = record1.get(property);
              var status2 = record2.get(property);
              if (status1 == status2) return 0;
              var v1 = self.status_sort_table[status1];
              var v2 = self.status_sort_table[status2];
              return v1 > v2 ? 1 : -1;
            }
          });
        };

        var grid_columns = {
          defaults: { resizable: false },
          items: [{ text: "Node",
                    dataIndex: "node",
                    renderer: Ext.htmlEncode,
                    sortable: true,
                    width: 150
                  },
                  { text: "Status",
                    dataIndex: "status",
                    renderer: Ext.Function.bind(self.status_renderer, self), // modify fn scope
                    sortable: true,
                    doSort: status_sort,
                    width: 50
                  },
                  { text: "Current Ring",
                    dataIndex: 'ring_hash_current',
                    width: 50
                  },
                  { text: "Prev Ring",
                    dataIndex: 'ring_hash_previous',
                    width: 50
                  },
                  { text: "Joined At",
                    dataIndex: "joined_at",
                    renderer: Ext.util.Format.dateRenderer("c")
                  }]
        };

        var grid_grouping_button = Ext.create(
          "Ext.SplitButton",
          { id: "nodes_grid_current_grouping",
            cls: ["bold_button", "left_align_button"],
            icon: "images/table.png",
            width: 140,
            handler: function(splitbutton) {
              // show menu when splitbutton itself is pressed
              splitbutton.showMenu();
            },
            menu: { xtype: "menu",
                    showSeparator: false,
                    defaults: {
                      icon: "images/table.png",
                      cls: ["bold_menu_item", "left_align_menu_item"]
                    },
                    items: [{ text: "Group by type",
                              handler: function(button) {
                                self.select_grouping(button.text, "type");
                              }
                            },
                            { text: "Group by status",
                              handler: function(button) {
                                self.select_grouping(button.text, "status");
                              }
                            }]
                  },
            listeners: {
              render: function() {
                // default grouping state
                self.select_grouping("Group by type", "type");
              }
            }
          });

        var nodes_rebalance_button = Ext.create(
          "Ext.Button",
          { text: "Rebalance",
            id: "nodes_rebalance_button",
            cls: "bold_button",
            icon: "images/rebalance.png",
            handler: function() {
              LeoCenter.confirm_password(function(password) {
                Ext.Ajax.request({
                  url: "nodes/rebalance",
                  method: "POST",
                  params: { password: password },
                  success: function(response) {
                    self.store.load();
                  },
                  failure: function(response) {
                    LeoCenter.Msg.alert("Error!", response.responseText);
                  }
                });
              }, "Are you sure to execute rebalance?");
            }
          });

        var grid_tbar = Ext.create(
          "Ext.Toolbar",
          { items: [ grid_grouping_button,
                     "-",
                     { xtype: "textfield",
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
                     nodes_rebalance_button,
                     "->",
                     { xtype: "button",
                       icon: "images/reload.png",
                       handler: self.store.load,
                       scope: self.store
                     }
                   ]
          });

        self.grid = Ext.create(
          "Ext.grid.Panel",
          { flex: 2,
            store: self.store,
            forceFit: true,
            features: [ self.grid_grouping ],
            columns: grid_columns,
            tbar: grid_tbar,
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
                self.on_grid_select(record);
              }
            }
          });

        self.left_container = Ext.create(
          "Ext.Container",
          { flex: 2,
            layout: {
              type: "vbox",
              pack: "start",
              align: "stretch"
            },
            items: [self.grid]
          });

        Ext.apply(
          self, { items: [self.left_container,
                          self.status_panel
                         ]
                });
        return self.callParent(arguments);
      }
    });
}).call(this);
