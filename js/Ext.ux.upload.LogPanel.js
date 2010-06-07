/*
** Ext.ux.upload.LogPanel.js for Ext.ux.upload
**
** Made by Gary van Woerkens
** Contact <gary@chewam.com>
**
** Started on  Fri Jun  4 19:01:47 2010 Gary van Woerkens
** Last update Mon Jun  7 04:55:21 2010 Gary van Woerkens
*/

Ext.ns('Ext.ux.upload');

/**
 * @class Ext.ux.upload.LogPanel
 * @extends Ext.util.Observable
 * The AuthPanel is a simple panel used as a container for two components :<br/>
 * The application combobox to select available applications. <br/>
 * The AuthTab panels displaying application's meta-groups.<br/>
 * @author Gary van Woerkens
 * @version 1.0
 */

Ext.ux.upload.LogPanel = function(config) {

  Ext.apply(this, config);

  this.panel = new Ext.Panel({
    border:false
    ,padding:"2"
    ,defaults:{style:"margin:0 0 2 0"}
    ,bodyStyle:"background-color:#DFE8F6"
    ,bbar:new Ext.ux.StatusBar({
      height:27
      ,style:"border:1px solid #99BBE8;"
      ,items:[{
	iconCls:"icon-eraser"
	,tooltip:"vider la liste des téléchargements"
	,scope:this
	,handler:this.cleanLogPanel
      }]
    })
    ,autoScroll:true
  });

  Ext.ux.upload.LogPanel.superclass.constructor.apply(this, arguments);

};

Ext.extend(Ext.ux.upload.LogPanel, Ext.util.Observable, {

  boundEl:null
  ,win:null
  ,queue:[]

  ,progressTpl:new Ext.Template(
    '<div ext:qtip="{msg}"'
    + 'class="x-progress-text-{type}"'
    + '>'
    + '{text}'
    + '</div>'
  )

  ,getWindow:function() {
    if (this.boundEl) this.boundEl.mask();
    if (!this.win) {
      if (this.boundEl) {
	this.win = new Ext.Panel({
	  height:140
	  ,width:350
	  ,frame:true
	  ,layout:"fit"
	  ,items:[this.panel]
	  ,floating:true
	  ,tools:[{
	    id:"close"
	    ,scope:this
	    ,handler:function(event, el, win){
	      win.hide();
	      this.boundEl.unmask();
	    }
	  }]
	  ,listeners:{
	    scope:this
	    ,show:function(panel) {
	      panel.el.anchorTo(this.boundEl, "c-c");
	      panel.doLayout();
	    }
	  }
	}).render(Ext.getBody());
      } else {
	this.win = new Ext.Window({
	  height:200
	  ,width:350
	  ,layout:"fit"
	  ,border:false
	  ,closeAction:"hide"
	  ,items:[this.panel]
	});
      }
    }
    return this.win;
  }

  ,cleanLogPanel:function() {
    this.panel.removeAll();
  }

  ,getStatusBar:function() {
    return this.panel.getBottomToolbar();
  }

  ,show:function(config) {
    if (!this.win || this.win.hidden)
      this.getWindow().show();
  }

  ,add:function(file) {
    var p = new Ext.ProgressBar({
      text:this.progressTpl.apply({type:"loading", text:file.name})
      ,isUploading:true
    });
    this.panel.add(p);
    this.panel.doLayout();
    this.queue.push({
      id:file.id
      ,p:p
    });
  }

  ,updateProgress:function(config) {
    var toolbar = this.getStatusBar(),
    p = this.getProgress(config.file.id);
    config.msg = config.msg || "";
    if (config.progress === 1 || config.type == "error") {
      config.type = config.type || "success";
      p.isUploading = false;
    }
    config.type = config.type || "loading";
    p.updateProgress(config.progress, this.progressTpl.apply({
      type:config.type
      ,text:config.file.name
      ,msg:config.msg
    }));
    var count = this.getUploadingCount();
    if (count) {
      count = this.queue.length - count + 1;
      var msg = "envoie " + (this.queue.length > 1 ? "des fichiers" : "du fichier");
      this.log("loading", msg+" ("+ count + "/" + this.queue.length+")");
    } else {
      count = this.queue.length - count;
      var msg = "envoie terminé ";
      this.log("info", msg+" ("+count + "/" + this.queue.length+")");
    }
  }

  ,getUploadingCount:function() {
    var count = 0;
    Ext.each(this.queue, function(item) {
      if (item.p.isUploading) count++;
    });
    return count;
  }

  ,log:function(type, msg) {
    this.show();
    this.getStatusBar().setStatus({
      text:msg
      ,iconCls:"x-status-"+type
    });
  }

  ,getProgress:function(id) {
    var index = Ext.each(this.queue, function(item, index) {
      return !(item.id === id);
    });
    return Ext.isDefined(index) ? this.queue[index].p : false;
  }


});

Ext.reg('uploadlogspanel', Ext.ux.upload.LogPanel);
