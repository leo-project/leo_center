(function() {
  Ext.define("LeoTamer.Admin", {
    extend: "Ext.panel.Panel",
    id: "admin",
    title: "Admin",
    layout: "border",

    initComponent: function() {
      s3_buckets = Ext.create("LeoTamer.S3Buckets");
      credentials = Ext.create("LeoTamer.Credentials");

      store = Ext.create("Ext.data.Store", {
        fields: ["name"],
        data: [
          { name: "Buckets" },
          //{ name: "Endpoints" },
          { name: "Credentials" }
        ],
      });

      grid = Ext.create("Ext.grid.Panel", {
        title: "Menu",
        region: "west",
        id: "admin_grid",
        width: 200,
        forceFit: true,
        hideHeaders: true,
        store: store,
        columns: [{ dataIndex: "name" }],
        listeners: {
          select: function(self, record, index) {
            start.getLayout().setActiveItem(index);
          }
        }
      });

      start = Ext.create("Ext.panel.Panel", {
        region: "center",
        layout: "card",
        activeItem: 0,
        items: [
          s3_buckets,
          credentials,
        ]
      });

      Ext.apply(this, {
        items: [
          grid,
          start
        ]
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
