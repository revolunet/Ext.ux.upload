/*
** Ext.ux.upload.LogPanel.js for Ext.ux.upload
**
** Made by Gary van Woerkens
** Contact <gary@chewam.com>
**
** Started on  Fri Jun  4 19:01:47 2010 Gary van Woerkens
** Last update Wed Jun  9 00:48:25 2010 Gary van Woerkens
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
Ext.ux.upload.LogPanel = Ext.extend(Ext.Panel, {

  boundEl:null
  ,win:null

  ,progressTpl:new Ext.Template(
    '<div ext:qtip="{msg}"'
    + 'class="x-progress-text-{type}"'
    + '>'
    + '{text}'
    + '</div>'
  )

  ,border:false
  ,padding:"2"
  ,defaults:{style:"margin:0 0 2 0"}
  ,bodyStyle:"background-color:#DFE8F6"
  ,autoScroll:true

  ,initComponent:function() {

    this.queue = [];

    this.bbar = new Ext.ux.StatusBar({
      height:27
      ,style:"border:1px solid #99BBE8;"
      ,items:[{
	iconCls:"icon-eraser"
	,tooltip:"vider la liste des téléchargements"
	,scope:this
	,handler:this.cleanLogPanel
      }]
    });

    Ext.ux.upload.LogPanel.superclass.initComponent.call(this);

    this.on({
      afterrender:function() {
	Ext.apply(this.ownerCt, {
	  addProgress:this.addProgress.createDelegate(this)
	  ,updateProgress:this.updateProgress.createDelegate(this)
	  ,setStatus:this.setStatus.createDelegate(this)
	});
      }
    });

  }

  ,cleanLogPanel:function() {
    this.removeAll();
  }

  ,getStatusBar:function() {
    return this.getBottomToolbar();
  }

  ,addProgress:function(file) {
    if (this.getProgress(file.id) === false) {
      var p = new Ext.ProgressBar({
	text:this.progressTpl.apply({type:"loading", text:file.name})
	,isUploading:true
      });
      this.insert(0, p);
      this.doLayout();
      this.queue.push({
	id:file.id
	,p:p
      });
    }
  }

  ,updateProgress:function(config) {
    var toolbar = this.getStatusBar(),
    p = this.getProgress(config.file.id);
    p.updateProgress(config.progress, this.progressTpl.apply({
      type:config.type
      ,text:config.file.name
      ,msg:config.msg
    }));
    if (config.type === "loading") {
      count = this.queue.length - this.getUploadingCount() + 1,
      msg = "envoi " + (this.queue.length > 1 ? "des fichiers" : "du fichier");
    } else if (config.type === "success" || config.type === "error") {
      config.type = "info";
      p.isUploading = false;
      var count = this.queue.length - this.getUploadingCount(),
      msg = "envoi terminé ";
    }
    this.setStatus(config.type, msg+" ("+count + "/" + this.queue.length+")");
  }

  ,setStatus:function(type, msg) {
    this.getStatusBar().setStatus({
      text:msg
      ,iconCls:"x-status-"+type
    });
  }

  ,getUploadingCount:function() {
    var count = 0;
    Ext.each(this.queue, function(item) {
      if (item.p.isUploading) count++;
    });
    return count;
  }

  ,getProgress:function(id) {
    var index = Ext.each(this.queue, function(item, index) {
      return !(item.id === id);
    });
    return Ext.isDefined(index) ? this.queue[index].p : false;
  }

});

Ext.reg('uploadlogspanel', Ext.ux.upload.LogPanel);













Ext.ns('Ext.ux');

Ext.ux.DialogX = Ext.extend(Ext.Panel, {

  height:140
  ,width:350
  ,frame:true
  ,layout:"fit"
  ,floating:true
  ,dialogEl:null
  ,hidden:true

  ,initComponent:function() {

    this.tools = [{
      id:"close"
      ,scope:this
      ,handler:function(event, el, win){
	this.close();
      }
    }];

    Ext.ux.DialogX.superclass.initComponent.call(this);

    this.on({
      scope:this
      ,show:function() {
	this.dialogEl.mask();
	this.getEl().anchorTo(this.dialogEl, "c-c");
	this.doLayout();
      }
    });

  }

  ,close:function() {
    this.hide();
    this.dialogEl.unmask();
  }

});

Ext.reg('dialogpanel', Ext.ux.DialogX);
