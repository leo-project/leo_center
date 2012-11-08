(function() {
  Ext.define("LeoTamer.S3Related", {
    extend: "Ext.panel.Panel",
    id: "s3_related_panel",
    title: "S3 Related",
    layout: "border",
    /*
    layout: {
      type: "vbox",
      align: 'stretch',
      //pack: 'start',
    }, */

    initComponent: function() {
      var access_key_store, access_key_grid;
      var endpoint_store, endpoint_grid;
      var bucket_store, bucket_grid;

      access_key_grid = Ext.create("Ext.grid.Panel", {
        title: "Access Keys",
        region: "north",
        forceFit: true,
        columns: [
          { header: "Owner", dataIndex: "owner" },
          { header: "Access Key", dataIndex: "access_key" }
        ],
        data: []
      });

      endpoint_grid = Ext.create("Ext.grid.Panel", {
        title: "Endpoints",
        region: "center",
        forceFit: true,
        columns: [
          { header: "Endpoint", dataIndex: "endpoint" },
          { header: "Created At", dataIndex: "created_at" }
        ],
        data: []
      });

      bucket_grid = Ext.create("Ext.grid.Panel", {
        title: "Buckets",
        region: "south",
        forceFit: true,
        columns: [
          { header: "Bucket", dataIndex: "Bucket" },
          { header: "Owner", dataIndex: "owner" },
          { header: "Created At", dataIndex: "created_at" }
        ],
        data: []
      });

      Ext.apply(this, {
        defaults: { 
          flex: 3
        },
        tbar: [
          { text: "Edit Keys" },
          { text: "Edit Endpoints" },
          { text: "Edit Buckets" }
        ],
        items: [
          access_key_grid,
          endpoint_grid,
          bucket_grid
        ]
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
