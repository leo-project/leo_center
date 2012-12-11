(function() {
  Ext.define('LeoTamer.model.Nodes', {
    extend: 'Ext.data.Model',
    fields: ["type", "node", "status", "ring_hash_current", "ring_hash_previous", "joined_at"]
  });

  Ext.define("LeoTamer.Nodes", {
    extend: "Ext.panel.Panel",

    title: "Node Status",
    id: "nodes_panel",
    layout: "border",

    initComponent: function() {
      var command_store, detail_store;
      var do_send_command, confirm_send_command, send_command;
      var node_status_panel, status_renderer;
      var node_grid_grouping, node_store, node_grid_select, node_grid;

      command_store = Ext.create("Ext.data.Store", {
        fields: [ "command" ],
        data: [
          { command: "none" },
          { command: "resume" },
          { command: "suspend" },
          { command: "detach" }
        ]
      });

      detail_store = Ext.create("Ext.data.ArrayStore", {
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
              alert("Error on: \'" + self.url + "\'\n" + response.responseText);
            }
          }
        }
      });

      do_send_command = function(node, command) {
        Ext.Ajax.request({
          url: "nodes/exec.json",
          method: "POST",
          params: {
            node: node,
            command: command
          },
          success: function(response) {
            //TODO
          },
          failure: function(response, opts) {
            //TODO
          }
        })
      }

      confirm_send_command = function(node, command) {
        Ext.Msg.on("beforeshow",  function (win) {
          win.defaultFocus = 2; // set default focus to "No" button
        });

        msg = "Are you sure to send command '" + command + " " + node + "'?";

        Ext.Msg.show({
          title: "Confirm", 
          msg: msg,
          buttons: Ext.Msg.YESNO,
          icon: Ext.Msg.WARNING,
          fn: function(btn) {
            if (btn == "yes") {
              do_send_command(node, command);
            }
          }
        });
      }

      send_command = function() {
        node = node_grid.getSelectionModel().getSelection()[0].data;

        command_combo = Ext.create("Ext.form.ComboBox", {
            store: command_store,
            labelWidth: 125,
            fieldLabel: "Execute Command",
            displayField: "command",
            valueField: "command",
            emptyText: "Select Command",
            allowBlank: false,
            editable: false
        });

        command_select_window = Ext.create('Ext.window.Window', {
          title: node.node,
          items: command_combo,
          buttons: [{
            text: "Apply",
            handler: function() {
              command = command_combo.getRawValue()
              if (command != "none")
                confirm_send_command(node.node, command);
            }
          }, {
            text: "Cancel",
            handler: function() {
              command_select_window.close();
            }
          }]
        }).show();
      };

      node_status_panel = Ext.create("Ext.Panel", {
        title: "status",
        region: "east",
        width: 300,
        resizable: false,
        items: [
          {
            xtype: "panel",
            id: "node_status",
            border: false,
            padding: "5",
            buttons: [{
              text: "Change Status",
              handler: send_command
            }]
          }, {
            xtype: 'grid',
            title: "defail information",
            border: false,
            forceFit: true,
            hideHeaders: true,
            columns: [
              {
                dataIndex: "name",
                text: "Name"
              }, {
                dataIndex: "value",
                text: "Value"
              }
            ],
            store: detail_store
          }
        ]
      });

      status_renderer = function(val) {
        var src;
        switch (val) {
          case "running":
            src = "images/accept.gif";
            break;
          case "stop":
          case "downed":
            src = "images/error16.png";
            break;
          case "attached":
            src = "images/add16.png";
            break;
          case "suspended":
            src = "images/warn16.png";
            break;
          default:
            throw "invalid status specified.";
        }
        return "<img class='status' src='" + src + "'> " + val;
      };

      node_grid_grouping = Ext.create('Ext.grid.feature.Grouping', {
        groupHeaderTpl: '{name} ({rows.length} node{[values.rows.length > 1 ? "s" : ""]})',
        hideGroupedHeader: true
      });

      node_store = Ext.create("Ext.data.Store", {
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
          listeners: {
            load: function() {
              node_grid.getSelectionModel().selectFirstRow();
            },
            exception: function(self, response, operation) {
              alert("Error on: \'" + self.url + "\'\n" + response.responseText);
            }
          }
        },
        autoLoad: true
      });

      node_grid_select = function(self, record, item, index, event) {
        name = record.data.node;
        status = record.data.status;
        node_status_panel.setTitle("status of " + name);
        name_line = "Node Name: " + record.data.node;
        status_line = "Status: " + status_renderer(record.data.status);
        Ext.getCmp("node_status").update(name_line + "<br>" + status_line);
        detail_store.load({ 
          params: { 
            node: name,
            type: record.data.type
          }
        });
      };

      node_grid = Ext.create("Ext.grid.Panel", {
        title: 'Nodes',
        store: node_store,
        region: "center",
        forceFit: true,
        features: [ node_grid_grouping ],
        viewConfig: {
          trackOver: false
        },
        columns: [
          {
            dataIndex: "type"
          }, {
            text: "Node",
            dataIndex: 'node',
            sortable: true
          }, {
            text: "Status",
            dataIndex: 'status',
            renderer: status_renderer,
            sortable: true
          }, {
            text: "Ring (Cur)",
            dataIndex: 'ring_hash_current'
          }, {
            text: "Ring (Prev)",
            dataIndex: 'ring_hash_previous'
          }, {
            text: "Joined At",
            dataIndex: "joined_at"
          }
        ],
        tbar: [
          {
            xtype: "textfield",
            fieldLabel: "<img src='images/filter16.png'> Filter:",
            labelWidth: 50,
            listeners: {
              change: function(self, new_value) {
                node_store.clearFilter();
                node_store.filter("node", new RegExp(new_value));
              }
            }
          }
        ],
        listeners: {
          // select first row on load
          render : function(self){
            self.store.on('load', function(store, records, options){
              self.getSelectionModel().select(0);
            });
          },
          select: node_grid_select
        }
      });

      Ext.apply(this, {
        items: [node_grid, node_status_panel]
      });

      return this.callParent(arguments);
    }
  });

}).call(this);
