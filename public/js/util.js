(function() {

  Object.clone = function(source) {
    return $.extend({}, source);
  };

  Ext.define("LeoTamer.model.NameValue", {
    extend: 'Ext.data.Model',
    fields: ["name", "value"]
  });

}).call(this);
