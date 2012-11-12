(function() {
  Ext.define("LeoTamer.Admin", {
    extend: "Ext.panel.Panel",
    id: "admin",
    title: "Admin",
    layout: "border",

    initComponent: function() {
      s3_buckets = Ext.create("LeoTamer.S3Buckets");
      credentials = Ext.create("LeoTamer.Credentials");

      admin_store = Ext.create("Ext.data.Store", {
        fields: ["name"],
        data: [
          { name: "Buckets" },
          //{ name: "Endpoints" },
          { name: "Credentials" }
        ],
      });

      admin_grid = Ext.create("Ext.grid.Panel", {
        title: "Menu",
        region: "west",
        id: "admin_grid",
        width: 200,
        forceFit: true,
        hideHeaders: true,
        store: admin_store,
        columns: [{ dataIndex: "name" }],
        listeners: {
          select: function(self, record, index) {
            admin_card.getLayout().setActiveItem(index);
          }
        }
      });

      admin_card = Ext.create("Ext.panel.Panel", {
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
          admin_grid,
          admin_card
        ]
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
