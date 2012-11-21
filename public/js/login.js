(function() {
  Ext.onReady(function() {
    form = Ext.create("Ext.form.Panel", {
      url: "login",
      defaultType: "textfield",
      layout: {
        type: "vbox",
        align: "center"
      },
      defaults: {
        padding: "10",
        width: 500,
        labelAlign: "right",
        allowBlank: false 
      },
      items:[{ 
        fieldLabel:'Username', 
        name: 'user_name',
      },{ 
        fieldLabel: "Password",
        name: "pass", 
        inputType: "password",
      }],
      buttons: [{
        text: "login",
        handler: function() {
          form.getForm().submit({
            method: "POST",
            success: function() {
              window.location = "/"
            }
          });
        }
      }]
    });

    login = Ext.create("Ext.window.Window", {
      title: "login",
      layout: "vbox",
      width: 800,
      closable: false,
      defaults: {
        width: "100%",
      },
      items: [
        {
          xtype: "image",
          bodyStyle: { "background-color": "white" },
          src: "images/leofs-logo.png"
        },
        form
      ]
    }).show();
  });
}).call(this);
