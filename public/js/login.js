// ======================================================================
//
//  Leo Tamer
//
//  Copyright (c) 2012 Rakuten, Inc.
//
//  This file is provided to you under the Apache License,
//  Version 2.0 (the "License"); you may not use this file
//  except in compliance with the License.  You may obtain
//  a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing,
//  software distributed under the License is distributed on an
//  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
//  KIND, either express or implied.  See the License for the
//  specific language governing permissions and limitations
//  under the License.
//
// ======================================================================
(function() {
  Ext.onReady(function() {
    var sign_up, login_form, login;

    sign_up = function() {
      var sign_up_form = Ext.create("Ext.form.Panel", {
        url: "sign_up",
        defaultType: "textfield",
        defaults: {
          padding: "10",
          width: 300,
          allowBlank: false,
          validateOnBlur: false,
          validateOnChange: false,
        },
        items:[{
          fieldLabel: "User ID",
          name: "user_id",
          listeners: {
            render: function() {
              this.focus(false, 200);
            }
          }
        }, {
          fieldLabel: "Password",
          id: "sign_up_form_pass",
          name: "password",
          inputType: "password",
          validator: function(value) {
            var confirm_value = Ext.getCmp("sign_up_form_confirm_pass").getValue();
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
          text: "Sign Up",
          enableKeyEvents: true,
          handler: function() {
            sign_up_form.submit({
              method: "POST",
              success: function() {
                var form = login_form.getForm();
                form.setValues(sign_up_form.getValues());
                login_form_submit();
              },
              failure: function(form, action) {
                LeoTamer.Msg.alert("Sign Up Faild!", "reason: " + action.result.errors.reason);
              }
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

    login_form_submit = function() {
      login_form.getForm().submit({
        method: "POST",
        success: function() {
          window.location = "/"
        },
        failure: function(form, action) {
          LeoTamer.Msg.alert("Login Faild!", action.result.errors.reason);
          login_form.getForm().reset();
        }
      });
    };

    login_form = Ext.create("Ext.form.Panel", {
      url: "login",
      border: false,
      defaultType: "textfield",
      padding: "0 12 24",
      defaults: {
        padding: 5,
        labelWidth: 150,
        labelStyle: "font-size: x-large",
        allowBlank: false,
        validateOnBlur: false,
        validateOnChange: false,
      },
      items:[{
        fieldLabel:'User ID',
        name: 'user_id',
        listeners: {
          render: function() {
            this.focus(false, 200);
          }
        }
      },{
        fieldLabel: "Password",
        name: "password",
        inputType: "password",
        listeners: {
          specialkey: function(form, e) {
            if (e.getKey() == e.ENTER) {
              login_form_submit();
            }
          }
        }
      }],
      buttons: [{
        text: "Sign In",
        handler: login_form_submit
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
      resizable: false,
      items: [
        {
          xtype: "image",
          width: 500,
          height: 174,
          padding: "12 12 0",
          border: false,
          src: "images/logo_login.png"
        },
        login_form,
        {
          width: "100%",
          bodyStyle: {
            "text-align": "center",
            padding: "10px",
          },
          html: "Have an account? <a href='#'>Sign Up</a>",
          listeners: {
            render: function(component) {
              component.getEl().on('click', function(e) {
                sign_up();
              });
            }
          }
        }
      ]
    }).show();
  });
}).call(this);
