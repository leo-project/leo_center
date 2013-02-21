(function() {
  Ext.define('LeoTamer.model.BucketStatus', {
    extend: 'Ext.data.Model',
    fields: [
      "name", "owner", 
      { name: "created_at", type: "date", dateFormat: "U" }
    ]
  });

  Ext.define("LeoTamer.BucketStatus", {
    extend: "Ext.panel.Panel",
    id: "bucket_status",
    title: "Bucket Status",
    layout: "border",
    border: false,

    listeners: {
      // fires when tab open
      activate: function(self) {
        self.load();
      }
    },

    grid_grouping: Ext.create("Ext.grid.feature.Grouping", {
      groupHeaderTpl: "{name} [{rows.length}]",
      collapsible: false
    }),

    load: function() {
      this.store.load();
    },

    add_bucket: function(self) {
      var title = "Add New Bucket";
      var msg = "Please input bucket name";

      Ext.Msg.prompt(title, msg, function(btn, value) {
        if (btn == "ok") {
          Ext.Ajax.request({
            url: "buckets/add_bucket",
            method: "POST",
            params: { bucket: value },
            success: function(response, opts) {
              self.load();
            },
            failure: function(response, opts) {
              LeoTamer.Msg.alert("Error!", response.responseText);
            }
          })
        }
      })
    },

    render_progress_bar: function(value, sum) {
      var id = Ext.id();
      Ext.defer(function () {
        Ext.widget('progressbar', {
          text: value,
          border: false,
          renderTo: id,
          value: value / sum,
        });
      }, 50);
      return Ext.String.format('<div id="{0}"></div>', id);
    },

    store: Ext.create("Ext.data.Store", {
      model: "LeoTamer.model.BucketStatus",
      groupField: "owner",
      proxy: Ext.create("LeoTamer.proxy.Ajax.noParams", {
        url: "bucket_status/list.json"
      })
    }),

    initComponent: function() {
      var self = this;

      self.grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        forceFit: true,
        features: [ self.grid_grouping ],
        store: self.store,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "<img src='images/filter.png'> Filter:",
          labelWidth: 60,
          listeners: {
            change: function(text_field, new_value) {
              var store = self.store;
              store.clearFilter();
              store.filter("name", new RegExp(new_value));
            }
          }
        },
        "-",
        {
          text: "Add Bucket",
          icon: "images/add.png",
          handler: function() {
            self.add_bucket(self);
          }
        },
        "->",
        {
          icon: "images/reload.png",
          handler: function() {
            self.load();
          }
        }],
        columns: {
          defaults: {
            resizable: false
          },
          items: [
            {
              header: "Bucket",
              dataIndex: "name",
              renderer: Ext.htmlEncode,
              width: 30
            },
            { 
              header: "Created at",
              dataIndex: "created_at",
              renderer: Ext.util.Format.dateRenderer("c")
            }
          ]
        }
      });

      Ext.apply(self, {
        items: self.grid
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
