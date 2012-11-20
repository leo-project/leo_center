(function() {
  Ext.define('LeoTamer.model.Buckets', {
    extend: 'Ext.data.Model',
    fields: ["name", "owner", "created_at"]
  });

  Ext.define("LeoTamer.Buckets", {
    extend: "Ext.panel.Panel",
    id: "buckets_panel",
    title: "Buckets",
    layout: "border",
    border: false,

    initComponent: function() {
      var bucket_grid_grouping;
      var bucket_store, bucket_grid;

      bucket_grid_grouping = Ext.create('Ext.grid.feature.Grouping', {
        groupHeaderTpl: '{name} ({rows.length} bucket{[values.rows.length > 1 ? "s" : ""]})',
        hideGroupedHeader: true
      });

      bucket_store = Ext.create("Ext.data.Store", {
        model: "LeoTamer.model.Buckets",
        groupField: "owner",
        proxy: {
          type: 'ajax',
          url: 'buckets/list.json',
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

      add_bucket = function() {
        title = "Add New Bucket";
        msg = "Please input bucket name"
        Ext.Msg.prompt(title, msg, function(btn, value) {
          if (btn == "ok") {
            Ext.Ajax.request({
              url: "buckets/add_bucket",
              method: "POST",
              params: { bucket: value },
              success: function(response, opts) {
                title = "Add Bucket"
                msg = "bucket '" + value + "' is added successfully."
                Ext.Msg.show({
                  title: title,
                  msg: msg,
                  buttons: Ext.Msg.OK,
                  icon: Ext.Msg.INFO
                });
                bucket_store.load();
              },
              failure: function(response, opts) {
                //TODO
              }
            })
          }
        })
      };

      bucket_grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        border: false,
        forceFit: true,
        features: [ bucket_grid_grouping ],
        store: bucket_store,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "<img src='images/filter16.png'> Filter:",
          labelWidth: 50,
          listeners: {
            change: function(self, new_value) {
              bucket_store.clearFilter();
              bucket_store.filter("name", new RegExp(new_value));
            }
          }
        },"-", {
          text: "Add Bucket",
          icon: "images/add16.png",
          handler: add_bucket
        }],
        columns: [
          { header: "Bucket", dataIndex: "name" },
          { header: "Created At", dataIndex: "created_at" }
        ]
      });



      bucket_sub_grid = Ext.create("Ext.grid.Panel", {
        title: "Details",
        region: "east",
        width: 300,
        forceFit: true,
        columns: [
          { header: "Name", dataIndex: "name" },
          { header: "Value", dataIndex: "value" },
        ],
        data: []
      });

      Ext.apply(this, {
        items: [
          bucket_grid,
          bucket_sub_grid
        ]
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
