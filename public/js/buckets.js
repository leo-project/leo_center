(function() {
  Ext.define('LeoTamer.model.Buckets', {
    extend: 'Ext.data.Model',
    fields: ["name", "owner", "created_at", "dummy"]
  });

  Ext.define("LeoTamer.Buckets", {
    extend: "Ext.panel.Panel",
    id: "buckets_panel",
    title: "Buckets",
    layout: "border",
    border: false,

    initComponent: function() {
      var bucket_grid_grouping;
      var bucket_store, bucket_grid;

      bucket_grid_grouping = Ext.create('Ext.grid.feature.GroupingSummary', {
        groupHeaderTpl: '{name} ({rows.length} bucket{[values.rows.length > 1 ? "s" : ""]})'
      });

      bucket_store = Ext.create("Ext.data.Store", {
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

      add_bucket = function() {
        title = "Add New Bucket";
        msg = "Please input bucket name"
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
                bucket_store.load();
              },
              failure: function(response, opts) {
                //TODO
              }
            })
          }
        })
      };

      render_progress_bar = function(value, sum) {
        var id = Ext.id();
        Ext.defer(function () {
          Ext.widget('progressbar', {
            text: value,
            renderTo: id,
            value: value / sum,
          });
        }, 50);
        return Ext.String.format('<div id="{0}"></div>', id);
      };

      bucket_grid = Ext.create("Ext.grid.Panel", {
        region: "center",
        border: false,
        forceFit: true,
        features: [ bucket_grid_grouping ],
        store: bucket_store,
        tbar: [{
          xtype: "textfield",
          fieldLabel: "<img src='images/filter16.png'> Filter:",
          labelWidth: 50,
          listeners: {
            change: function(self, new_value) {
              bucket_store.clearFilter();
              bucket_store.filter("name", new RegExp(new_value));
            }
          }
        },"-", {
          text: "Add Bucket",
          icon: "images/add16.png",
          handler: add_bucket
        }],
        columns: [
          { 
            header: "Bucket",
            dataIndex: "name",
            /*
            summaryRenderer: function(value){
              return "TOTAL";
            }
            */
          },
          { 
            header: "# of Files",
            width: 50
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
          { header: "Created at", dataIndex: "created_at" }
        ]
      });

      Ext.apply(this, {
        items: bucket_grid
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
