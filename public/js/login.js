(function() {
  Ext.onReady(function() {
    var sign_up, form, login;

    sign_up = function() {
      var sign_up_form = Ext.create("Ext.form.Panel", {
        url: "sign_up",
        defaultType: "textfield",
        defaults: {
          padding: "10",
          width: 300,
          vtype: "alphanum",
          allowBlank: false
        },
        items:[{
          fieldLabel: "User ID",
          name: "user_id"
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
      defaultType: "textfield",
      defaults: {
        padding: "10",
        vtype: "alphanum",
        labelWidth: 150,
        labelStyle: "font-size: x-large",
        allowBlank: false 
      },
      items:[{ 
        fieldLabel:'User ID',
        name: 'user_id',
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
      layout: {
        type: "vbox",
        align: "center"
      },
      y: "20%",
      width: 600,
      draggable: false,
      closable: false,
      items: [
        {
          xtype: "image",
          flex: 1,
          padding: "24 24 0",
          width: "80%",
          border: false,
          src: "images/leofs-logo-0.png"
        },
        {
          xtype: "panel",
          flex: 2,
          border: false,
          padding: "0 24 24",
          items: form
        }
      ]
    }).show();
  });
}).call(this);
