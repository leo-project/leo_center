Ext.define('LeoTamer.model.Nodes', {
  extend: 'Ext.data.Model',
  fields: ["type", "node", "status", "ring_hash_current", "ring_hash_previous", "joined_at"]
})

Ext.define("LeoTamer.model.NameValue", {
  extend: 'Ext.data.Model',
  fields: ["name", "value"]
})

Ext.define("LeoTamer.Nodes", {
  extend: "Ext.panel.Panel",
  id: "nodes_panel",
  title: "Node Status",
  layout: "border",

  initComponent: ->
    node_store = Ext.create("Ext.data.Store", {
      model: "LeoTamer.model.Nodes",
      groupField: 'type',
      proxy: {
        type: 'ajax',
        url: 'nodes/status.json',
        reader: {
          type: 'json',
          root: 'data',
        }
      },
      autoLoad: true
    })

    status = (val) ->
      switch val
        when "running"
          src = "images/accept.gif"
        when "stop"
          src = "images/cross.gif"
        when "suspended"
          src = "images/error.gif"
        else
          throw "invalid status specified."
      return "<img class='status' src='#{src}'> #{val}"

    groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
      groupHeaderTpl: '{name} ({rows.length} node{[values.rows.length > 1 ? "s" : ""]})',
      hideGroupedHeader: true
    })

    # store for node status combobox
    status_store = Ext.create("Ext.data.Store", {
      fields: ["status"],
      data: [
        { status: "attached" },
        { status: "running" },
        { status: "restarted" },
        { status: "suspended" },
        { status: "downed" },
        { status: "stopped" }
      ]
    })

    # store for node detail status
    detail_store = Ext.create("Ext.data.ArrayStore", {
      model: "LeoTamer.model.NameValue",
      proxy: {
        type: 'ajax',
        url: 'nodes/detail.json',
        reader: {
          type: 'json',
          root: 'data',
        }
      },
      autoLoad: true
    })

    node_grid_dblclick = (self, record, item, index, event) ->
      console.log self, record, item, index, event

      Ext.create('Ext.window.Window', {
        title: record.data.node # node name
        width: 600,
        items: [{
          xtype: "panel",
          padding: "0 0 10 0",
          items: {
            xtype: "combo",
            store: status_store,
            labelWidth: 300,
            fieldLabel: "Status:",
            displayField: "status",
            valueField: "status",
            editable: false,
            readOnly: true,
            listeners: {
              afterrender: (self) ->
                # set default value
                self.setValue(record.data.status)
            }
          },
          ### XXX: it will be used
          buttons: [{
            text: "OK",
            handler: ->
          }, {
            text: "Cancel",
            handler: ->
          }]
          ###
        }, {
          xtype: 'grid',
          forceFit: true,
          columns: [{
            dataIndex: "name",
            text: "Name"
          }, {
            dataIndex: "value",
            text: "Value"
          }],
          store: detail_store
        }],
        buttons: [{
          text: "Close",
          scope: this,
          handler: ->
            # close the window itself
            Ext.WindowManager.getActive().close()
        }]
      }).show()

    node_grid = Ext.create("Ext.grid.Panel", {
      title: 'nodes',
      store: node_store,
      region: "center",
      forceFit: true,
      layout: "fit",
      features: [ groupingFeature ],
      viewConfig: { trackOver: false },
      columns:[
        { dataIndex: "type" },
        {
          text: "Node",
          dataIndex: 'node',
          sortable: true
        },{
          text: "Status",
          dataIndex: 'status',
          renderer: status,
          sortable: true
        },{
          text: "Ring (Cur)",
          dataIndex: 'ring_hash_current',
        },{
          text: "Ring (Prev)",
          dataIndex: 'ring_hash_previous',
        },{
          text: "Joined At",
          dataIndex: "joined_at"
        }
      ],
      tbar:[{
      # html: "<img src='images/download.png'> Download (CSV)"
      #}, {
        xtype: "textfield",
        fieldLabel: "Filter:",
        labelWidth: 50,
        listeners: {
          change: (self, new_value) ->
            node_store.clearFilter() if new_value == ""
            node_store.filter("node", new_value)
        }
      }],
      listeners: {
        viewready: ->
          this.getSelectionModel().select(0)
        itemdblclick: node_grid_dblclick
      }
    })

    Ext.apply(this, {
      defaults: { split: true },
      items: node_grid
    })

    this.callParent(arguments)
})
