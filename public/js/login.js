(function() {
  Ext.onReady(function() {
    form = Ext.create("Ext.form.Panel", {
      width: "100%",
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
        name: 'user',
      },{ 
        fieldLabel: "Password",
        name: "pass", 
        inputType: "password",
      }],
      buttons: [{
        text: "login"
      }]
    });

    login = Ext.create("Ext.window.Window", {
      title: "login",
      layout: "vbox",
      width: 800,
      closable: false,
      items: [
        {
          xtype: "image",
          width: "100%",
          bodyStyle: { "background-color": "white" },
          src: "images/leofs-logo.png"
        },
        form
      ]
    }).show();
  });
}).call(this);
