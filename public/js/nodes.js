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
          run: self.store.load.bind(self.store),
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
          exception: function(proxy, response, operation) {
            LeoTamer.Msg.alert("Error on: \'" + proxy.url + "\'", response.responseText);
          }
        }
      }
    }),

    do_send_command: function(password, command) {
      var self = this;
      var node = self.grid.getSelectionModel().getSelection()[0].data.node;

      Ext.Ajax.request({
        url: "nodes/execute",
        method: "POST",
        params: {
          password: password,
          node: node,
          command: command
        },
        success: self.store.load.bind(self.store),
        failure: function(response) {
          LeoTamer.Msg.alert("Error!", response.responseText);
        }
      });
    },

    confirm_send_command: function(command) {
      var self = this;

      // confirm user's password before dangerous action
      LeoTamer.confirm_password(function(password) {
        self.do_send_command(password, command);
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
        src = "images/fire.png";
        break;
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
      var change_status_button = Ext.getCmp("change_status_button");
      var compaction_button = Ext.getCmp("compaction_button");
      var status = node_stat.status;

      // using HTML 4.0 character entity references to avoid Ext.Panel#setTitle()'s cutting space
      // &nbsp; //=> non-breaking space
      self.status_panel.setTitle(self.get_status_icon(status) + "&nbsp;" + node_stat.node);

      // check change status's availability
      if (node_stat.type === "Gateway") {
        change_status_button.disable();
        compaction_button.disable();
      }
      else {
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
          params: {
            node: node_stat.node,
            type: node_stat.type
          },
          callback: function(records, operation, success) {
            if (!success) self.detail_store.removeAll();
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
      detached: {
        // no available commands
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
          text: "Change Status",
          handler: function(splitbutton) {
            // show menu when splitbutton itself is pressed
            splitbutton.showMenu();
          },
          menu:  {
            xtype: "menu",
            showSeparator: false,
            items: [{
              text: "To Suspend",
              icon: "images/warn.png",
              id: "change_status_button_suspend",
              handler: function(button) {
                self.confirm_send_command("suspend");
              }
            }, {
              text: "To Running",
              icon: "images/running.png",
              id: "change_status_button_resume",
              handler: function(button) {
                self.confirm_send_command("resume");
              }
            }, {
              text: "To Stop",
              icon: "images/downed.png",
              id: "change_status_button_detach",
              handler: function(button) {
                self.confirm_send_command("detach");
              }
            }]
          }
        }, {
          text: "Compaction",
          id: "compaction_button",
          handler: function() {
            LeoTamer.confirm_password(function(password) {
              var node = self.grid.getSelectionModel().getSelection()[0].data.node;
              var mask = new Ext.LoadMask(Ext.getBody());
              mask.show();
              Ext.Ajax.request({
                url: "nodes/compaction",
                method: "POST",
                timeout: 120,
                params: {
                  password: password,
                  node: node
                },
                success: function(response) {
                  self.store.load();
                },
                failure: function(response) {
                  LeoTamer.Msg.alert("Error!", response.responseText);
                },
                callback: function() {
                  mask.destroy();
                }
              });
            });
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
          cls: "bold_button",
          icon: "images/table.png",
          width: 140,
          handler: function(splitbutton) {
            // show menu when splitbutton itself is pressed
            splitbutton.showMenu();
          },
          menu:  {
            xtype: "menu",
            showSeparator: false,
            defaults: { cls: "bold_button" },
            items: [{
              text: "Group by type",
              icon: "images/table.png",
              handler: function(button) {
                self.select_grouping(button.text, "type");
              }
            }, {
              text: "Group by status",
              icon: "images/table.png",
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
            LeoTamer.confirm_password(function(password) {
              Ext.Ajax.request({
                url: "nodes/rebalance",
                method: "POST",
                params: { password: password },
                success: function(response) {
                  self.store.load();
                },
                failure: function(response) {
                  LeoTamer.Msg.alert("Error!", response.responseText);
                }
              });
            });
          }
        },
        "->",
        {
          xtype: "button",
          icon: "images/reload.png",
          handler: self.store.load,
          scope: self.store
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
            self.on_grid_select(record);
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
