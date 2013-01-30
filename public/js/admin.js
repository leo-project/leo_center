(function() {
  Ext.define("LeoTamer.Admin", {
    extend: "Ext.panel.Panel",
    id: "admin",
    title: "Admin Tools",
    layout: "border",

    system_conf: Ext.create("LeoTamer.SystemConf"),
    users: Ext.create("LeoTamer.Users"),
    buckets: Ext.create("LeoTamer.Buckets"),
    endpoints: Ext.create("LeoTamer.Endpoints"),
    whereis: Ext.create("LeoTamer.Whereis"),

    admin_store: Ext.create("Ext.data.Store", {
      fields: ["name"],
      data: [
        { name: "System Conf" },
        { name: "Users" },
        { name: "Buckets" },
        { name: "Endpoints" },
        { name: "Whereis" }
      ]
    }),

    set_icon: function(value) {
      var img = undefined;
      switch(value) {
      case "System Conf":
        img = "<img src='images/system_conf.png'> ";
        break;
      case "Users":
        img = "<img src='images/users.png'> ";
        break;
      case "Buckets":
        img = "<img src='images/bucket.png'> ";
        break;
      case "Endpoints":
        img = "<img src='images/endpoint.png'> ";
        break;
      case "Whereis":
        img = "<img src='images/whereis.png'> ";
        break;
      default:
        throw "no icon for " + value;
      }
      return img + value;
    },

    initComponent: function() {
      var self = this;
      var admin_card, admin_grid;

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
          renderer: self.set_icon
        }],
        listeners: {
          select: function(grid, record, index) {
            admin_card.getLayout().setActiveItem(index);
          },
          afterrender: function(grid) {
            grid.getSelectionModel().select(0);
          }
        }
      });

      admin_card = Ext.create("Ext.panel.Panel", {
        region: "center",
        layout: "card",
        activeItem: 0,
        items: [
          self.system_conf,
          self.users,
          self.buckets,
          self.endpoints,
          self.whereis
        ]
      });

      Ext.apply(self, {
        items: [admin_grid, admin_card]
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
