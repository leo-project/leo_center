(function() {
  Ext.define('LeoTamer.model.Buckets', {
    extend: 'Ext.data.Model',
    fields: ["name", "owner", "created_at"]
  });

  Ext.define("LeoTamer.S3Buckets", {
    extend: "Ext.panel.Panel",
    id: "s3_related_panel",
    title: "S3 Buckets",
    maxWidth: 1000,
    layout: "border",

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
          url: 's3_buckets/list.json',
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

      bucket_grid = Ext.create("Ext.grid.Panel", {
        title: "Buckets",
        region: "center",
        maxWidth: 600,
        forceFit: true,
        features: [ bucket_grid_grouping ],
        store: bucket_store,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "Bucket Name:",
          labelWidth: 75,
          listeners: {
            change: function(self, new_value) {
              bucket_store.clearFilter();
              bucket_store.filter("name", new RegExp(new_value));
            }
          }
        }],
        columns: [
          { header: "Bucket", dataIndex: "name" },
          { header: "Created At", dataIndex: "created_at" }
        ]
      });

      add_bucket = function() {
        title = "Add New Bucket";
        msg = "Please input bucket name"
        Ext.Msg.prompt(title, msg, function(btn, value) {
          if (btn == "ok") {
            Ext.Ajax.request({
              url: "s3_buckets/add_bucket",
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
              },
              failure: function(response, opts) {
                //TODO
              }
            })
          }
        })
      }

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
        tbar: [
          { 
            text: "Add Bucket",
            handler: add_bucket
          }
        ],
        items: [
          bucket_grid,
          bucket_sub_grid
        ]
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
