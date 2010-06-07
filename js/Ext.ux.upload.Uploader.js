/*
** Ext.ux.upload.Uploader.js for Ext.ux.uploader
**
** Made by Gary van Woerkens
** Contact <gary@chewam.com>
**
** Started on  Wed May 26 17:45:41 2010 Gary van Woerkens
** Last update Mon Jun  7 13:34:26 2010 Gary van Woerkens
*/

Ext.ns('Ext.ux.upload');

/**
 * @class Ext.ux.upload.Uploader
 * @extends Ext.util.Observable
 * Ext.ux.upload.Uploader is a class to upload files from the web interface to the server.<br/>
 * This class uses both swfupload and native browser upload system. Browser upload is triggered by native browser file drop event.<br/>
 * Any instance of this class can set to components plugins list to make this component an upload zone or a swfupload trigger as well.
 * <pre><code>
var uploader = new Ext.ux.upload.Uploader({
    url:"/var/www/my/upload/folder/"
});

var button = new Ext.Button({
   text:"swfupload trigger"
   ,plugins:[uploader]
});

button.render(Ext.getBody());

var panel = new Ext.Panel({
    title:"upload drop zone"
    ,width:300
    ,height:200
    ,plugins:[uploader]
});

panel.render(Ext.getBody());
 * </code></pre>
 * @author Gary van Woerkens
 * @version 1.0
 */

/**
 * Create a new Uploader
 * @constructor
 * @param {Object} config The config object
 */
Ext.ux.upload.Uploader = function(config) {

  Ext.apply(this, config);

  this.swfParams = config.swfParams || {};
  Ext.apply(this.swfParams, {
    url:this.url
    ,swfUrl:this.swfUrl
    ,allowedFileTypes:this.allowedFileTypes
    ,maxFileSize:this.maxFileSize
    ,maxFiles:this.maxFiles
//    ,buttonImageUrl:"http://localhost/dev/upload/examples/img/button.png"
//    ,itemImageUrl:"/var/www/dev/upload/examples/img/menuitem.png"
  });

  this.html5Params = config.html5Params || {};
  Ext.applyIf(this.html5Params, {
    url:this.url
    ,allowedFileTypes:this.allowedFileTypes
    ,maxFileSize:this.maxFileSize
    ,maxFiles:this.maxFiles
  });

  Ext.ux.upload.Uploader.superclass.constructor.call(this);

};


Ext.extend(Ext.ux.upload.Uploader, Ext.util.Observable, {

  boundEl:null
  /**
   * @cfg String url
   */
  ,url:""
  /**
   * @cfg String swfUrl
   */
  ,swfUrl:""
  /**
   * @cfg Number maxFiles
   */
  ,maxFiles:5
  /**
   * @cfg Number maxFileSize
   */
  ,maxFileSize:1024 // KB
  /**
   * @cfg String allowedFileTypes
   */
  ,allowedFileTypes:"*.*"
  /**
   * @cfg Object allowedTypesReg
   */
  ,allowedTypesReg:null
  /**
   * @cfg Object swfParams
   */
  ,swfParams:null
  /**
   * @cfg String swfButtonImageUrl
   */
  ,swfButtonImageUrl:""
  /**
   * @cfg String swfItemImageUrl
   */
  ,swfItemImageUrl:""
  /**
   * @cfg Object html5Params
   */
  ,html5Params:null
  /**
   * @cfg Boolean disableLogPanel
   */
  ,disableLogPanel:false

  ,init:function(cmp) {

    var triggers = ["button", "menuitem"];

    var dropZones = [
      "dataview", "panel"
      ,"imagebrowser", "toolbartabpanel"
      ,"grid"
    ];

    var getUploader = function() {
      return this;
    };

    var isTrigger = function(xtype) {
      return triggers.indexOf(xtype) > -1;
    };

    var isDropZone = function(xtype) {
      return dropZones.indexOf(xtype) > -1;
    };

    cmp.getUploader = getUploader.createDelegate(this);

    cmp.relayEvents(this, ["fileupload", "beforeupload", "dragstart", "dragstop"]);

    var xtype = cmp.getXType();
    if (isTrigger(xtype) !== false) {
      cmp.on({
	scope:this
	,afterrender:this.setTrigger
      });
    } else if (isDropZone(xtype) !== false) {
      cmp.on({
	scope:this
	,render:this.setDropZone
      });
    }

  }

  /**
   * Initializes an upload drop zone for a component<br/>
   * The component has to be in the dropzone list (dataview).
   * @param {Ext.Component} cmp The component to bind the dropzone to.
   */
  ,setDropZone:function(cmp) {

    if (cmp.uploadLogPanelTarget === true)
      this.boundEl = cmp.getEl();

    var el = cmp.getXType() == "grid" ? cmp.view.scroller : cmp.body;

    var config = {
      el:el
      ,listeners:{
	scope:this
	,beforeupload:this.onBeforeUpload
	,start:this.onUploadStart
	,progress:this.onUploadProgress
	,error:this.onUploadError
      }
    };
    Ext.apply(config, this.html5Params);
    cmp.conn = new Ext.ux.upload.Html5Connector(config);
  }

  /**
   * Initializes a swfupload button over a component.<br/>
   * The component has to be in the trigger list (button, menu item).
   * @param {Ext.Component} cmp The component to bind the trigger to.
   */
  ,setTrigger:function(cmp) {
    console.log(cmp.getEl());
    var config, body,
    btn = cmp.getEl().child("td.x-btn-mc") || cmp.getEl(),
    el = btn.insertHtml("beforeEnd",
      '<div id="'+Ext.id()+'">'
      + '<div id="'+Ext.id()+'" style="position:absolute;cursor:pointer;">'
      + '<div id="'+Ext.id()+'"></div>'
      + '</div>'
      + '</div>'
    , true);
    //el = Ext.isChrome ? el : el.first();
    el = el.first();
    body = el.first();
    console.log(el, body, el.id, body.id);
    config = {
      el:el
      ,body:body
      ,listeners:{
	scope:this
	,load:this.resizeTrigger.createDelegate(cmp)
	,beforeupload:this.onBeforeUpload
	,start:this.onUploadStart
	,progress:this.onUploadProgress
	,complete:this.onUploadComplete
	,error:this.onUploadError
      }
    };
    Ext.apply(config, this.swfParams);
    cmp.conn = new Ext.ux.upload.SwfConnector(config);
    cmp.on("resize", this.resizeTrigger);
  }

  /**
   * Handles the trigger resize event to place the swfupload button over it.<br/>
   * Scope is on trigger component.
   */
  ,resizeTrigger:function() {
    if (this.rendered) {
      var height = this.el.getHeight(),
      width = this.el.getWidth();
      el = this.conn.el;
      el.setXY(this.el.getXY());
      el.setSize(width, height);
      if (this.conn.loaded)
	this.conn.swf.setButtonDimensions(width, height);
    }
  }

  /**
   * Returns the panel to log upload events.
   */
  ,getLogPanel:function() {
    if (!this.logPanel)
      this.logPanel = new Ext.ux.upload.LogPanel({
	boundEl:this.boundEl
      });
    return this.logPanel;
  }

  /**
   * Set the url where files have to be uploaded
   * @param {String} url
   */
  ,setUploadUrl:function(url) {
    this.url = url;
    this.swfParams.url = url;
    this.html5Params.url = url;
  }

  // HANDLERS
  ,onBeforeUpload:function(conn, fileCount) {
    console.log('onBeforeUpload', this, arguments);
    this.getLogPanel().show({fileCount:fileCount});
  }

  ,onUploadStart:function(conn, file) {
    console.log('onUploadStart', this, arguments);
    this.getLogPanel().add(file);
  }

  ,onUploadProgress:function(conn, file, uploaded) {
    console.log('onUploadProgress', this, arguments);
    this.getLogPanel().updateProgress({file:file, progress:uploaded});
  }

  ,onUploadComplete:function(conn, file) {
    console.log('onUploadComplete', this, arguments);
    this.getLogPanel().updateProgress({file:file, progress:1});
  }

  ,onUploadError:function(conn, file, msg) {
    console.log('onUploadError', this, arguments);
    this.getLogPanel().add(file);
    this.getLogPanel().updateProgress({
      file:file
      ,progress:0
      ,type:"error"
      ,msg:msg
    });
  }

});
