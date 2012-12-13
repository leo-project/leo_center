(function() {
  Ext.define('LeoTamer.model.Buckets', {
    extend: 'Ext.data.Model',
    fields: ["name", "owner", "created_at", "dummy", "dummy2"]
  });

  Ext.define("LeoTamer.Buckets", {
    extend: "Ext.panel.Panel",
    id: "buckets",
    title: "Buckets",
    layout: "border",
    border: false,

    listeners: {
      activate: function(self) {
        self.load();
      }
    },

    grid_grouping: Ext.create('Ext.grid.feature.Grouping', {
      groupHeaderTpl: '{name} ({rows.length} bucket{[values.rows.length > 1 ? "s" : ""]})'
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
              title = "Add Bucket"
              msg = "bucket '" + value + "' is added successfully."
              Ext.Msg.show({
                title: title,
                msg: msg,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.INFO
              });
              self.load(); 
            },
            failure: function(response, opts) {
              Ext.Msg.alert("Error!", response.responseText);
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
          exception: function(store, response, operation) {
            alert("Error on: \'" + store.url + "\'\n" + response.responseText);
          }
        }
      }
    }),

    initComponent: function() {
      var self = this;

      self.grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        border: false,
        forceFit: true,
        features: [ self.grid_grouping ],
        store: self.store,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "<img src='images/filter.png'> Filter:",
          labelWidth: 50,
          listeners: {
            change: function(grid, new_value) {
              var store = grid.getStore();
              store.clearFilter();
              store.filter("name", new RegExp(new_value));
            }
          }
        },"-", {
          text: "Add Bucket",
          icon: "images/add.png",
          handler: function() {
            self.add_bucket(self);
          }
        }],
        columns: [
          { 
            header: "Bucket",
            dataIndex: "name",
            /*
            summaryRenderer: function(value){
              return "TOTAL";
            } */
          },
          /*
          { 
            header: "# of files",
            width: 50,
            dataIndex: "dummy2",
            renderer: function(value, _, record, _, _, store, view) {
              var sum = store.sum("dummy2");
              return render_progress_bar(value, sum);
            },
            summaryType: "sum",
            summaryRenderer: function(value, _, field) {
              var sum = bucket_grid.getStore().sum(field);
              return render_progress_bar(value, sum);
            }
          },
          { 
            header: "Capacity",
            width: 50,
            dataIndex: "dummy",
            renderer: function(value, _, record, _, _, store, view) {
              var sum = store.sum("dummy");
              return render_progress_bar(value, sum);
            },
            summaryType: "sum",
            summaryRenderer: function(value, _, field) {
              var sum = bucket_grid.getStore().sum(field);
              return render_progress_bar(value, sum);
            }
          },
          */
          { header: "Created at", dataIndex: "created_at" }
        ]
      });

      Ext.apply(self, {
        items: self.grid
      });

      return self.callParent(arguments);
    }
  });
}).call(this);
