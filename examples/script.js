Ext.onReady(function(){

  var uploader = new Ext.ux.Uploader({
    url:"upload.php"
    ,swfUrl:"swfupload.swf"
    ,allowedFileTypes:"*.*"
    ,maxFileSize:1024
    ,maxFiles:2
  });

  new Ext.Button({
    text:"upload to dataview"
    ,plugins:[uploader]
  }).render("dataview");

  new Ext.Button({
    text:"Upload Menu"
    ,menu:[{
      text:"upload to dataview"
      ,plugins:[uploader]
    }]
  }).render("dataview");

    var store = new Ext.data.JsonStore({
      url:"getfiles.php",
      root:"data",
      autoLoad:true,
      fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date', dateFormat:'timestamp'}]
    });

    var tpl = new Ext.XTemplate(
      '<tpl for=".">',
      '<div class="thumb-wrap" id="{name}">',
      '<div class="thumb"><img src="{url}" title="{name}"></div>',
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
        title:'Simple DataView (0 items selected)',
	uploadLogPanelTarget:true,
	plugins:[uploader],
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

});