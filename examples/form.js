Ext.onReady(function() {

  new Ext.Button({
    text:"upload to form"
  }).render("form");

  new Ext.Button({
    text:"Upload Menu"
    ,menu:[{
      text:"upload to form"
    }]
  }).render("form");

  var simple = new Ext.FormPanel({
    labelWidth: 75, // label settings here cascade unless overridden
    url:'save-form.php',
    frame:true,
    title: 'Simple Form',
    bodyStyle:'padding:5px 5px 0',
    width: 350,
    defaults: {width: 230},
    defaultType: 'textfield',

    items: [{
      fieldLabel: 'First Name',
      name: 'first',
      allowBlank:false
    },{
      fieldLabel: 'Last Name',
      name: 'last'
    },{
      fieldLabel: 'Company',
      name: 'company'
    }, {
      fieldLabel: 'Email',
      name: 'email',
      vtype:'email'
    }, {
      fieldLabel: 'Time',
      name: 'time',
      xtype:"textarea"
    }],

    buttons: [{
      text: 'Save'
    },{
      text: 'Cancel'
    }]
  });

  simple.render("form");

});
