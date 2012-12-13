(function() {
  Ext.define("LeoTamer.Admin", {
    extend: "Ext.panel.Panel",
    id: "admin",
    title: "Admin",
    layout: "border",

    buckets: Ext.create("LeoTamer.Buckets"),
    endpoints: Ext.create("LeoTamer.Endpoints"),
    credentials: Ext.create("LeoTamer.Users"),

    admin_store: Ext.create("Ext.data.Store", {
      fields: ["name"],
      data: [
        { name: "Buckets" },
        { name: "Endpoints" },
        { name: "Users" },
      ]
    }),

    initComponent: function() {
      var self = this;
      var set_icon, admin_card, admin_grid;

      set_icon = function(value) {
        var img = undefined
        switch(value) {
          case "Buckets":
            img = "<img src='images/bucket.png'> ";
            break;
          case "Endpoints":
            img = "<img src='images/endpoint.png'> ";
            break;
          case "Users":
            img = "<img src='images/users.png'> ";
            break;
        }
        return img + value;
      }

      admin_grid = Ext.create("Ext.grid.Panel", {
        title: "Menu",
        region: "west",
        id: "admin_grid",
        width: 200,
        forceFit: true,
        hideHeaders: true,
        store: self.admin_store,
        columns: [{
          dataIndex: "name",
          renderer: set_icon
        }],
        listeners: {
          select: function(self, record, index) {
            admin_card.getLayout().setActiveItem(index);
          },
          afterrender: function(self) {
            self.getSelectionModel().select(0);
          }
        }
      });

      admin_card = Ext.create("Ext.panel.Panel", {
        region: "center",
        layout: "card",
        activeItem: 0,
        items: [
          self.buckets,
          self.endpoints,
          self.credentials
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
