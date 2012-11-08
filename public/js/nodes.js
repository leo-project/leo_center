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
      var operation_store, detail_store;
      var do_send_command, confirm_send_command, send_command;
      var node_status_panel, status_renderer;
      var node_grid_grouping, node_store, node_grid_select, node_grid;

      operation_store = Ext.create("Ext.data.Store", {
        fields: [ "status" ],
        data: [
          { status: "resume" },
          { status: "suspend" },
          { status: "detach" }
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
              console.log(self, response, operation);
              alert("Error on: \'" + self.url + "\'\n" + response.responseText);
            }
          }
        }
      });

      do_send_command = function(node, command) {
        Ext.Ajax.request({
          url: "node/exec.json",
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
            store: operation_store,
            labelWidth: 200,
            fieldLabel: "Select Operation Command",
            displayField: "status",
            valueField: "status",
            emptyText: "Select Command",
            editable: false
        });

        command_select_window = Ext.create('Ext.window.Window', {
          title: "System Operation: " + node.node,
          items: command_combo,
          buttons: [{
            text: "Apply",
            handler: function() {
              confirm_send_command(node.node, command_combo.getRawValue());
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
            buttons: [{
              text: "System Operation",
              handler: send_command
            }]
          }, {
            xtype: 'grid',
            title: "defail information",
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
            src = "images/cross.gif";
            break;
          case "suspended":
            src = "images/error.gif";
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
              console.log(self, response, operation);
              alert("Error on: \'" + self.url + "\'\n" + response.responseText);
            }
          }
        },
        autoLoad: true
      });

      node_grid_select = function(self, record, item, index, event) {
        console.log(self, record, item, index, event);
        name = record.data.node;
        status = record.data.status;
        node_status_panel.setTitle("status of " + name);
        name_line = "Node Name: " + record.data.node;
        status_line = "Status: " + status_renderer(record.data.status);
        Ext.getCmp("node_status").update(name_line + "<br>" + status_line);
        detail_store.load({ 
          params: { node: name }
        });
      };

      node_grid = Ext.create("Ext.grid.Panel", {
        title: 'nodes',
        store: node_store,
        region: "center",
        forceFit: true,
        features: [node_grid_grouping],
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
            fieldLabel: "Filter:",
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
        items: [
          node_grid,
          node_status_panel
        ]
      });

      return this.callParent(arguments);
    }
  });

}).call(this);
