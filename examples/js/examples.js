/*
** examples.js for Ext.ux.upload
**
** Made by Gary van Woerkens
** Contact <gary@chewam.com>
**
** Started on  Wed Jun  9 00:47:48 2010 Gary van Woerkens
** Last update Tue Jun 15 18:26:40 2010 Gary van Woerkens
*/

Ext.onReady(function() {

  Ext.QuickTips.init();

  /*******************************************************************
   * DATAVIEW ********************************************************
   * *****************************************************************/

  var uploader = new Ext.ux.upload.Uploader({
    url:"/dev/upload/examples/php/upload.phpx"
    ,swfUrl:"swf/swfupload.swf"
    ,allowedFileTypes:"*.*"
    ,maxFileSize:0
    ,maxFiles:10
    ,listeners:{
      beforeupload:function() {
	// Return false to cancel upload.
      }
    }
  });

  var container = new Ext.Panel({
    layout:"hbox"
    ,renderTo:"dataview"
    ,width:535
    ,height:30
    ,border:false
    ,layoutConfig:{
      padding:"0 0 5 0"
      ,align:'stretch'
    }
    ,defaults:{margins:'0 5 0 0'}
    ,items:[{
      text:"upload to dataview"
      ,xtype:"button"
      ,plugins:[uploader]
    }, {
      text:"Upload Menu"
      ,xtype:"button"
      ,menu:[{
	text:"upload to dataview"
	,plugins:[uploader]
      }]
    }]
  });

  var store = new Ext.data.JsonStore({
    url:"php/getfiles.php",
    root:"data",
    autoLoad:true,
    baseParams:{
      folder:"dataview"
      ,xaction:"read"
    },
    fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date', dateFormat:'timestamp'}]
  });

  var tpl = new Ext.XTemplate(
    '<tpl for=".">',
    '<div class="thumb-wrap" id="{name}">',
    '<div class="thumb"><img src="http://cdn.iconfinder.net/data/icons/Basic_set2_Png/64/document.png" title="{name}"></div>',
    '<span class="x-editable">{shortName}</span></div>',
    '</tpl>',
    '<div class="x-clear"></div>'
  );

  var panel = new Ext.Panel({
    cls:'images-view',
    frame:true,
    width:535,
    height:250,
    collapsible:true,
    layout:'fit',
    title:'Simple DataView',
    plugins:[uploader],
    collapseFirst:false,
    bodyStyle:"border:1px solid #99BBE8;",
    tools:[{
      id:"gear"
      ,scope:store
      ,qtip:"remove all files"
      ,handler:function() {this.load({params:{xaction:"removeall"}});}
    }, {
      id:"refresh"
      ,scope:store
      ,qtip:"refresh"
      ,handler:function() {this.load({params:{xaction:"read"}});}
    }],
    listeners: {
      queuecomplete:function(uploader, target, file) {
	this.items.items[0].getStore().load({params:{xaction:"read"}});
      }
    },
    items: new Ext.DataView({
      store: store,
      tpl: tpl,
      autoScroll:true,
      multiSelect: true,
      overClass:'x-view-over',
      itemSelector:'div.thumb-wrap',
      emptyText: 'No item to display',
      prepareData: function(data){
        data.shortName = Ext.util.Format.ellipsis(data.name, 15);
        data.sizeString = Ext.util.Format.fileSize(data.size);
        data.dateString = data.lastmod.format("m/d/Y g:i a");
        return data;
      }
    })
  });

  panel.render("dataview");

  /*******************************************************************
   * GRIDPANEL *******************************************************
   * *****************************************************************/

  var uploader2 = new Ext.ux.upload.Uploader({
    url:"/dev/upload/examples/php/upload2.php"
    ,swfUrl:"swf/swfupload.swf"
    ,allowedFileTypes:"*.png;*.jpg;*.gif"
    ,maxFileSize:1024
    ,maxFiles:3
  });

  var store2 = new Ext.data.JsonStore({
    url:"php/getfiles.php",
    root:"data",
    autoLoad:true,
    baseParams:{
      folder:"grid"
      ,xaction:"read"
    },
    fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date', dateFormat:'timestamp'}]
  });

  var panel2 = new Ext.Panel({
    title:'Simple GridPanel'
    ,renderTo:"gridpanel"
    ,frame:true
    ,width:535
    ,height:300
    ,collapsible:true
    ,layout:"fit"
    ,items:[{
      xtype:"grid"
      ,store:store2
      ,plugins:[uploader2]
      ,autoExpandColumn:"name"
      ,bodyStyle:"border:1px solid #99BBE8;"
      ,uploadLogPanelTarget:true
      ,columns:[
	{dataIndex:"name", header:"File name", id:"name"}
	,{dataIndex:"lastmod", header:"Last modification"}
      ]
      ,listeners: {
	uploadcomplete:function(uploader, target, file) {
	  this.getStore().load({params:{xaction:"read"}});
	}
      }
    }]
    ,collapseFirst:false
    ,tools:[{
      id:"gear"
      ,scope:store2
      ,qtip:"remove all files"
      ,handler:function() {this.load({params:{xaction:"removeall"}});}
    } ,{
      id:"refresh"
      ,scope:store2
      ,qtip:"refresh"
      ,handler:function() {this.load({params:{xaction:"read"}});}
    }]
    ,tbar:[{
      text:"upload to gridpanel"
      ,plugins:[uploader2]
    }, "-", {
      text:"Upload Menu"
      ,menu:[{
	text:"upload to gridpanel"
	,plugins:[uploader2]
      }]
    }]
  });

  /*******************************************************************
   * FORM ************************************************************
   * *****************************************************************/

  var uploader3 = new Ext.ux.upload.Uploader({
    url:"/dev/upload/examples/php/upload3.php"
    ,id:"uploader3"
    ,swfUrl:"swf/swfupload.swf"
    ,disableLogPanel:true
    ,allowedFileTypes:"*.jpg;*.png;*.gif"
    ,maxFileSize:1024
    ,maxFiles:1
    ,enableLogPanel:false
  });

  var photo = new Ext.Panel({
    region:"west"
    ,width:100
    ,padding:"5"
    ,plugins:[uploader3]
    ,bodyStyle:"border:1px solid #99BBE8"
    ,html:'<img height=71 width=88 src="http://cdn.iconfinder.net/data/icons/oxygen/64x64/mimetypes/unknown.png" />'
  });

  var store3 = new Ext.data.JsonStore({
    url:"php/getfiles.php",
    root:"data",
    autoLoad:true,
    baseParams:{
      folder:"form"
      ,xaction:"read"
    },
    fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date', dateFormat:'timestamp'}]
    ,listeners:{
      load:function(store, records) {
	if (records.length)
	  photo.update('<img height=71 width=88 src="uploads/form/'+records[0].get("name")+'?nocach='+Ext.id()+'" />');
      }
    }
  });

   var form = new Ext.form.FormPanel({
     title:"Simple Form"
     ,renderTo:"form"
     ,frame:true
     ,collapsible:true
     ,width:535
     ,height:210
     ,layout:"border"
     ,items:[photo, {
       layout:"form"
       ,region:"center"
       ,padding:"5"
       ,labelWidth:70
       ,items:[{
	 xtype:"compositefield"
	 ,anchor:"0"
	 ,fieldLabel:"Name"
	 ,items:[{
	   xtype:"textfield"
	   ,flex:1
	 }, {
	   xtype:"button"
	   ,text:"image"
	   ,plugins:[uploader3]
	   ,listeners:{
	     uploadcomplete:function() {
	       store3.load({params:{xaction:"read"}});
	     }
	   }
	 }]
       }, {
	 fieldLabel:"Email"
	 ,xtype:"textfield"
	 ,anchor:"0"
       }, {
	 fieldLabel:"Birth date"
	 ,xtype:"datefield"
	 ,anchor:"0"
       }]
     }, {
       region:"south"
       ,height:90
       ,layout:"form"
       ,labelAlign:"top"
       ,padding:"5"
       ,items:[{
	 xtype:"textarea"
	 ,fieldLabel:"Comments"
	 ,anchor:"0"
       }]
     }]
   });

  /*******************************************************************
   * BORDER LAYOUT ***************************************************
   * *****************************************************************/

  var uploader4 = new Ext.ux.upload.Uploader({
    url:"/dev/upload/examples/php/upload4.php"
    ,swfUrl:"swf/swfupload.swf"
    ,allowedFileTypes:"*.*"
    ,maxFileSize:0
    ,maxFiles:10
    ,listeners:{
      beforeupload:function() {
	// Return false to cancel upload.
      }
    }
  });

  new Ext.Panel({
    layout:"hbox"
    ,renderTo:"border"
    ,width:535
    ,height:30
    ,border:false
    ,layoutConfig:{
      padding:"0 0 5 0"
      ,align:'stretch'
    }
    ,defaults:{margins:'0 5 0 0'}
    ,items:[{
      text:"upload to border layout"
      ,xtype:"button"
      ,plugins:[uploader4]
    }]
  });

  var store4 = new Ext.data.JsonStore({
    url:"php/getfiles.php",
    root:"data",
    autoLoad:true,
    baseParams:{
      folder:"border"
      ,xaction:"read"
    },
    fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date', dateFormat:'timestamp'}]
  });

  var tpl4 = new Ext.XTemplate(
    '<tpl for=".">',
    '<div class="thumb-wrap" id="{name}">',
    '<div class="thumb"><img src="http://cdn.iconfinder.net/data/icons/Basic_set2_Png/64/document.png" title="{name}"></div>',
    '<span class="x-editable">{shortName}</span></div>',
    '</tpl>',
    '<div class="x-clear"></div>'
  );

  var dataview = new Ext.DataView({
    store:store4,
    tpl:tpl4,
    region:"center",
    autoScroll:true,
    multiSelect: true,
    overClass:'x-view-over',
    itemSelector:'div.thumb-wrap',
    emptyText: 'No item to display',
    style:"border:1px solid #99BBE8",
    prepareData: function(data){
      data.shortName = Ext.util.Format.ellipsis(data.name, 15);
      data.sizeString = Ext.util.Format.fileSize(data.size);
      data.dateString = data.lastmod.format("m/d/Y g:i a");
      return data;
    }
  });

  var eastPanel = new Ext.Panel({
    region:"east"
    ,split:true
    ,collapsed:true
    ,collapseMode:"mini"
    ,border:false
    ,layout:"fit"
    ,width:200
  });

  uploader4.setLogFrame(eastPanel);

  uploader4.on({
    beforeupload:function() {
      if (eastPanel.collapsed) {
	eastPanel.expand();
      }
    }
    ,queuecomplete:function() {
      eastPanel.collapse.defer(2000, eastPanel);
    }
  });

  new Ext.Panel({
    cls:'images-view',
    frame:true,
    width:535,
    height:250,
    renderTo:"border",
    collapsible:true,
    layout:'border',
    title:'Simple BorderLayout',
    plugins:[uploader4],
    collapseFirst:false,
    tools:[{
      id:"gear"
      ,scope:store4
      ,qtip:"remove all files"
      ,handler:function() {this.load({params:{xaction:"removeall"}});}
    }, {
      id:"refresh"
      ,scope:store4
      ,qtip:"refresh"
      ,handler:function() {this.load({params:{xaction:"read"}});}
    }],
    listeners: {
      uploadcomplete:function(uploader, target, file) {
	store4.load({params:{xaction:"read"}});
      }
    },
    items:[dataview, eastPanel]
  });

});