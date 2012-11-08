(function() {
  Ext.define("LeoTamer.S3Buckets", {
    extend: "Ext.panel.Panel",
    id: "s3_related_panel",
    title: "S3 Buckets",
    layout: "border",

    initComponent: function() {
      var bucket_grid_grouping;
      var bucket_store, bucket_grid;

      bucket_grid_grouping = Ext.create('Ext.grid.feature.Grouping', {
        groupHeaderTpl: '{name} ({rows.length} bucket{[values.rows.length > 1 ? "s" : ""]})',
        hideGroupedHeader: true
      });

      bucket_grid = Ext.create("Ext.grid.Panel", {
        title: "Buckets",
        region: "center",
        forceFit: true,
        features: [ bucket_grid_grouping ],
        columns: [
          { header: "Bucket", dataIndex: "Bucket" },
          { header: "Owner", dataIndex: "owner" },
          { header: "Created At", dataIndex: "created_at" }
        ],
        data: []
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
        // defaults: { flex: 3 },
        tbar: [
          { text: "Edit Buckets" }
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
