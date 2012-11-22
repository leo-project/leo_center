(function() {
  Ext.define("LeoTamer.Admin", {
    extend: "Ext.panel.Panel",
    id: "admin",
    title: "Admin",
    layout: "border",

    initComponent: function() {
      buckets = Ext.create("LeoTamer.Buckets");
      endpoints = Ext.create("LeoTamer.Endpoints");
      credentials = Ext.create("LeoTamer.Credentials");
      history = Ext.create("LeoTamer.History");

      admin_store = Ext.create("Ext.data.Store", {
        fields: ["name"],
        data: [
          { name: "Buckets" },
          { name: "Endpoints" },
          { name: "Credentials" },
          { name: "History" }
        ],
      });

      set_icon = function(value) {
        img = undefined
        switch(value) {
          case "Buckets":
            img = "<img src='images/bucket16.png'> ";
            break;
          case "Endpoints":
            img = "<img src='images/endpoint16.png'> ";
            break;
          case "Credentials":
            img = "<img src='images/credential16.png'> ";
            break;
          case "History":
            img = "<img src='images/history16.png'> ";
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
        store: admin_store,
        columns: [{
          dataIndex: "name",
          renderer: set_icon
        }],
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
          buckets,
          endpoints,
          credentials,
          history
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
