(function() {
  Ext.onReady(function() {
    var sign_up, form, login;

    sign_up = function() {
      var sign_up_form = Ext.create("Ext.form.Panel", {
        url: "test",
        defaultType: "textfield",
        defaults: {
          padding: "10",
          width: 300,
          vtype: "alphanum",
          allowBlank: false
        },
        items:[{
          fieldLabel: "Username",
          name: "user_name"
        }, {
          fieldLabel: "Password",
          id: "sign_up_form_pass",
          name: "pass",
          inputType: "password",
          validator: function(value) {
            confirm_value = Ext.getCmp("sign_up_form_confirm_pass").getValue();
            return value === confirm_value;
          }
        }, {
          fieldLabel: "Password (Confirm)",
          id: "sign_up_form_confirm_pass",
          name: "confirm_pass",
          inputType: "password",
          validator: function() {
            return Ext.getCmp("sign_up_form_pass").validate();
          }
        }],
        buttons: [{
          text: "Sign UP",
          handler: function() {
            sign_up_form.submit({
              method: "GET"
            });
          }
        }]
      });

      Ext.create("Ext.window.Window", {
        title: "Sign Up",
        modal: true,
        items: sign_up_form
      }).show();
    };

    form = Ext.create("Ext.form.Panel", {
      url: "login",
      border: false,
      y: 100,
      defaultType: "textfield",
      defaults: {
        padding: "10",
        vtype: "alphanum",
        labelAlign: "right",
        allowBlank: false 
      },
      items:[{ 
        fieldLabel:'Username', 
        name: 'user_name',
      },{ 
        fieldLabel: "Password",
        name: "pass", 
        inputType: "password"
      }],
      buttons: [{
        text: "Login",
        handler: function() {
          form.getForm().submit({
            method: "POST",
            success: function() {
              window.location = "/"
            }
          });
        }
      },{
        text: "Sign UP",
        handler: sign_up
      }]
    });

    login = Ext.create("Ext.window.Window", {
      title: "login",
      id: "login",
      layout: "hbox",
      y: "20%",
      width: 600,
      draggable: false,
      closable: false,
      defaults: { flex: 2 },
      items: [
        {
          xtype: "image",
          border: false,
          maintainFlex: true,
          src: "images/leofs-logo-1.png"
        },
        {
          xtype: "panel",
          border: false,
          layout: "absolute",
          items: form
        }
      ]
    }).show();
  });
}).call(this);
