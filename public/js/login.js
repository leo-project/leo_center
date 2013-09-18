//======================================================================
//
// LeoFS
//
// Copyright (c) 2012-2013 Rakuten, Inc.
//
// This file is provided to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file
// except in compliance with the License.  You may obtain
// a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
//
//======================================================================
(function() {
  Ext.onReady(function() {
    // Clear Cookies
    Ext.util.Cookies.clear("user_id");
    Ext.util.Cookies.clear("admin");

    var sign_up = function() {
      var sign_up_form_submit = function() {
        sign_up_form.submit({
          method: "POST",
          success: function() {
            var form = login_form.getForm();
            form.setValues(sign_up_form.getValues());
            login_form_submit();
          },
          failure: function(form, action) {
            LeoCenter.Msg.alert("Sign Up Faild!", "reason: " + action.result.errors.reason);
          }
        });
      };

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
              this.focus(false, 500); // deferred: 500ms
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
          },
          listeners: {
            specialkey: function(form, e) {
              if (e.getKey() === e.ENTER) sign_up_form_submit();
            }
          }
        }],
        buttons: [{
          id: "sign_up_submit_button",
          text: "Sign Up",
          enableKeyEvents: true,
          handler: sign_up_form_submit
        }]
      });

      Ext.create("Ext.window.Window", {
        title: "Sign Up",
        modal: true,
        items: sign_up_form
      }).show();
    };

    var login_form_submit = function() {
      login_form.getForm().submit({
        method: "POST",
        success: function() {
          window.location = "/"
        },
        failure: function(form, action) {
          LeoCenter.Msg.alert("Login Faild!", action.result.errors.reason);
          login_form.getForm().findField("password").reset();
        }
      });
    };

    var login_form = Ext.create("Ext.form.Panel", {
      url: "login",
      border: false,
      defaultType: "textfield",
      padding: "0 12 24",
      defaults: {
        padding: 5,
        labelWidth: 85,
        allowBlank: false,
        validateOnBlur: false,
        validateOnChange: false,
      },
      items:[{
        fieldLabel: "User ID",
        id: "user_id",
        name: "user_id",
        listeners: {
          render: function() {
            this.focus(false, 200);
          }
        }
      },{
        fieldLabel: "Password",
        id: "password",
        name: "password",
        inputType: "password",
        listeners: {
          specialkey: function(form, e) {
            if (e.getKey() === e.ENTER) login_form_submit();
          }
        }
      }],
      buttons: [{
        text: "Sign In",
        handler: login_form_submit
      }]
    });

    var login = Ext.create("Ext.window.Window", {
      title: "LeoCenter - Login",
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
          height: 117,
          padding: "12 12 0",
          border: false,
          src: "images/logo_login.png"
        },
        login_form

        // @TODO - Sign Up
        // {
        //   width: "100%",
        //   id: "link_to_sign_up",
        //   html: "Have an account? <a href='#' style=\"text-decoration:none\">Sign Up</a>",
        //   listeners: {
        //     render: function(component) {
        //       component.getEl().on('click', function(e) {
        //         sign_up();
        //       });
        //     }
        //   }
        // }
      ]
    }).show();
  });
}).call(this);
