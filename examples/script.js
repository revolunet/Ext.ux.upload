Ext.onReady(function(){

  /*******************************************************************
   * DATAVIEW ********************************************************
   * *****************************************************************/

  var uploader = new Ext.ux.Uploader({
    url:"upload.php"
    ,id:"uploader1"
    ,swfUrl:"swfupload.swf"
//    ,allowedFileTypes:"*.png;*.jpg;*.jpeg;*.gif;*.pdf;*.flv;*.mp4;*.swf"
    ,allowedFileTypes:"*.*"
    ,maxFileSize:1024
    ,maxFiles:2
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
    url:"getfiles.php",
    root:"data",
    autoLoad:true,
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
    id:'images-view',
    frame:true,
    width:535,
    height:250,
    collapsible:true,
    layout:'fit',
    title:'Simple DataView',
    uploadLogPanelTarget:true,
    plugins:[uploader],
    collapseFirst:false,
    bodyStyle:"border:1px solid #99BBE8;",
    tools:[{
      id:"refresh"
      ,scope:store
      ,handler:function() {this.reload();}
    }],
    listeners: {
      fileupload:function(uploader, target, file) {
	this.items.items[0].getStore().reload();
      }
    },
    items: new Ext.DataView({
      store: store,
      tpl: tpl,
      autoScroll:true,
      multiSelect: true,
      overClass:'x-view-over',
      itemSelector:'div.thumb-wrap',
      emptyText: 'No images to display',
      prepareData: function(data){
        data.shortName = Ext.util.Format.ellipsis(data.name, 15);
        data.sizeString = Ext.util.Format.fileSize(data.size);
        data.dateString = data.lastmod.format("m/d/Y g:i a");
        return data;
      },
      listeners: {
        selectionchange: {
          fn: function(dv,nodes){
            var l = nodes.length;
            var s = l != 1 ? 's' : '';
            panel.setTitle('Simple DataView ('+l+' item'+s+' selected)');
          }
        }
      }
    })
  });

  panel.render("dataview");

  /*******************************************************************
   * GRIDPANEL *******************************************************
   * *****************************************************************/

  var uploader2 = new Ext.ux.Uploader({
    url:"upload2.php"
    ,id:"uploader2"
    ,swfUrl:"swfupload.swf"
    ,allowedFileTypes:"*.*"
    ,maxFileSize:1024
    ,maxFiles:2
  });

  var store2 = new Ext.data.JsonStore({
    url:"getfiles2.php",
    root:"data",
    autoLoad:true,
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
      ,uploadLogPanelTarget:true
      ,plugins:[uploader2]
      ,autoExpandColumn:"name"
      ,bodyStyle:"border:1px solid #99BBE8;"
      ,columns:[
	{dataIndex:"name", header:"File name", id:"name"}
	,{dataIndex:"lastmod", header:"Last modification"}
      ]
      ,listeners: {
	fileupload:function(uploader, target, file) {
	  this.getStore().reload();
	}
      }
    }]
    ,collapseFirst:false
    ,tools:[{
      id:"refresh"
      ,scope:store2
      ,handler:function() {this.reload();}
    }]
    ,tbar:[{
      text:"upload to dataview"
      ,plugins:[uploader2]
    }, {
      text:"Upload Menu"
      ,menu:[{
	text:"upload to dataview"
	,plugins:[uploader2]
      }]
    }]
  });

});