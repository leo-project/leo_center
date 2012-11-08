(function() {
  Ext.define("LeoTamer.S3Related", {
    extend: "Ext.panel.Panel",
    id: "s3_related_panel",
    title: "S3 Related",
    layout: "border",

    initComponent: function() {
      Ext.apply(this, {
        defaults: { split: true },
        items: [
        ]
      });

      return this.callParent(arguments);
    }
  });
}).call(this);
