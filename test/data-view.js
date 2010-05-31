Ext.onReady(function(){
/*
  var browser = new Ext.ux.file.BrowsePlugin({
    dropElSelector: 'div[class^=x-panel-body]'
  });
*/

  var uploader = new Ext.ux.Uploader();

  new Ext.Button({
    text:"upload to dataview"
    ,plugins:[uploader]
  }).render("dataview");

  new Ext.Button({
    text:"Upload Menu"
    ,menu:[{
      text:"upload to dataview"
      ,plugins:[uploader]
      ,handler:function() {
	console.log("menu item handler", this, arguments);
      }
    }]
  }).render("dataview");

    var xd = Ext.data;

    var data = [
	{name:"gangster_zack.jpg",size:2115,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/gangster_zack.jpg"}
	,{name:"kids_hug.jpg",size:2477,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/kids_hug.jpg"}
	,{name:"sara_smile.jpg",size:2410,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/sara_smile.jpg"}
	,{name:"sara_pink.jpg",size:2154,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/sara_pink.jpg"}
	,{name:"zack_dress.jpg",size:2645,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/zack_dress.jpg"}
	,{name:"zacks_grill.jpg",size:2825,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/zacks_grill.jpg"}
	,{name:"kids_hug2.jpg",size:2476,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/kids_hug2.jpg"}
	,{name:"zack.jpg",size:2901,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/zack.jpg"}
	,{name:"sara_pumpkin.jpg",size:2588,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/sara_pumpkin.jpg"}
	,{name:"zack_hat.jpg",size:2323,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/zack_hat.jpg"}
	,{name:"up_to_something.jpg",size:2120,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/up_to_something.jpg"}
	,{name:"zack_sink.jpg",size:2303,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/zack_sink.jpg"}
	,{name:"dance_fever.jpg",size:2067,lastmod:1272391250000,url:"http://www.extjs.com/deploy/dev/examples/view/images/thumbs/dance_fever.jpg"}
    ];

    var store = new Ext.data.JsonStore({
	data:data,
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
        autoHeight:true,
        collapsible:true,
        layout:'fit',
        title:'Simple DataView (0 items selected)',

        items: new Ext.DataView({
            store: store,
            tpl: tpl,
            autoHeight:true,
            multiSelect: true,
            overClass:'x-view-over',
            itemSelector:'div.thumb-wrap',
            emptyText: 'No images to display',
	    uploadLogPanelTarget:true,
	    plugins:[uploader],
//	    plugins:[browser],

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