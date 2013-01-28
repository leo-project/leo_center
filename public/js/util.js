(function() {
  Object.clone = function(source) {
    return $.extend({}, source);
  };

  Ext.define("LeoTamer.Msg", {
    statics: {
      // alert with ERROR icon
      alert: function(title, msg, fn, scope) {
        Ext.Msg.show({
          title: title,
          msg: msg,
          fn: fn,
          scope: scope,
          buttons: Ext.Msg.OK,
          icon: Ext.Msg.ERROR // set icon
        });
      }
    },

    constructor: function () {
      this.callSuper(arguments);
    }
  });

  Ext.define("LeoTamer.model.NameValue", {
    extend: "Ext.data.Model",
    fields: ["name", "value", "group"]
  });

  LeoTamer.confirm_password = function(callback, msg) {
    var msg = msg || "Please input your password";
    Ext.Msg.prompt("Confirm", msg, function(btn, password) {
      if (btn === "ok") callback(password);
    });
  }
}).call(this);
