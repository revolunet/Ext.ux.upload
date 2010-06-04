/*
** Ext.ux.Uploader.js for Ext.ux.Uploader
**
** Made by Gary van Woerkens
** Contact <gary@chewam.com>
**
** Started on  Wed May 26 17:45:41 2010 Gary van Woerkens
** Last update Fri Jun  4 16:34:17 2010 Gary van Woerkens
*/

Ext.ns('Ext.ux');

/**
 * @class Ext.ux.Uploader
 * @extends Ext.util.Observable
 * The AuthPanel is a simple panel used as a container for two components :<br/>
 * The application combobox to select available applications. <br/>
 * The AuthTab panels displaying application's meta-groups.<br/>
 * @author Gary van Woerkens
 * @version 1.0
 */

Ext.ux.Uploader = function(config) {

  Ext.apply(this, config);

  this.swfParams = config.swfParams || {};
  Ext.apply(this.swfParams, {
    url:this.url
    ,swfUrl:this.swfUrl
    ,allowedFileTypes:this.allowedFileTypes
    ,maxFileSize:this.maxFileSize
    ,maxFiles:this.maxFiles
    ,buttonImageUrl:"http://localhost/dev/upload/examples/img/button.png"
    ,itemImageUrl:"/var/www/dev/upload/examples/img/menuitem.png"
  });

  this.html5Params = config.html5Params || {};
  Ext.applyIf(this.html5Params, {
    url:this.url
    ,allowedFileTypes:this.allowedFileTypes
    ,maxFileSize:this.maxFileSize
    ,maxFiles:this.maxFiles
  });

  Ext.getBody().on({
    scope:this
    ,dragover:function(e) {
      e.stopPropagation();
      e.preventDefault();
      // prevents drop in FF ;-(
      if (!Ext.isGecko) {
	e.browserEvent.dataTransfer.dropEffect = 'copy';
      }
      this.fireEvent("windowover");
      return;
    }
    ,dragexit:function(e) {
      e.stopPropagation();
      e.preventDefault();
      this.fireEvent("windowexit");
      return;
    }
  });

  Ext.ux.Uploader.superclass.constructor.call(this);

};


Ext.extend(Ext.ux.Uploader, Ext.util.Observable, {

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
    cmp.relayEvents(this, ["fileupload", "beforeupload", "windowover", "windowexit"]);
    var xtype = cmp.getXType();
    if (isTrigger(xtype) !== false) {
      cmp.on({
	scope:this
	,resize:this.resizeTrigger
	,afterrender:this.setTrigger.createDelegate(this)
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

    cmp.on({
      scope:cmp
      ,windowover:function(e) {
	this.body.addClass("x-uploader-dragover");
      }
      ,windowexit:function(e) {
	this.body.removeClass("x-uploader-dragover");
      }
    });

    cmp.body.on({
      scope:this
      ,dragover:function(e) {
	e.stopPropagation();
	e.preventDefault();
	// prevents drop in FF ;-(
	if (!Ext.isGecko) {
	  e.browserEvent.dataTransfer.dropEffect = 'copy';
	}
	return;
      }
      ,dragexit:function(e) {
	e.stopPropagation();
	e.preventDefault();
	return;
      }
      ,drop:this.onHtml5FilesDrop.createDelegate(this, [cmp], true)
    });
  }

  /**
   * Handles the trigger resize event to place the swfupload mask over it.<br/>
   * Scope is on trigger component.
   */
  ,resizeTrigger:function() {
    if (this.rendered) {
      var height = this.el.getHeight(),
      width = this.el.getWidth();
      el = this.uploadConfig.el,
      conn = this.uploadConfig.conn;
      el.setXY(this.el.getXY());
      el.setSize(width, height);
      if (conn.isLoaded)  {
	if (Ext.isChrome && conn.settings.buttonImageUrl) {
	  var img, xtype = this.getXType();
	  if (xtype === "button") img = conn.settings.buttonImageUrl;
	  else if (xtype === "menuitem") img = conn.settings.itemImageUrl;
	  //conn.setButtonImageURL(img);
	}
	conn.setButtonDimensions(width, height);
      }
    }
  }

  /**
   * Initializes a swfupload button over a component.<br/>
   * The component has to be in the trigger list (button, menu item).
   * @param {Ext.Component} cmp The component to bind the trigger to.
   */
  ,setTrigger:function(cmp) {
    var el = cmp.getEl().insertHtml("beforeEnd", '<div><div '
      + 'style="'
      + 'position:absolute;'
      + 'cursor:pointer;'
      + '">'
      + '<div '
      + '></div>'
      + '</div></div>'
    , true);
    cmp.uploadConfig = {};
    cmp.uploadConfig.el = Ext.isChrome ? el : el.first();
    cmp.uploadConfig.body = Ext.isChrome ? el.first() : cmp.uploadConfig.el.first();
    cmp.uploadConfig.conn = this.getSwfConnector(cmp);
  }

  /**
   * Returns a new swpupload instance to bind a trigger component to.
   * @return {Object} SWFUpload instance of SWFUpload
   */
  ,getSwfConnector:function(cmp) {
    var config = {
      flash_url:this.swfParams.swfUrl
      ,buttonImageUrl:this.swfParams.buttonImageUrl
      ,itemImageUrl:this.swfParams.itemImageUrl
      ,movieName:"easy-swf-upload"
      ,upload_url:this.swfParams.url
      ,file_post_name:"Filedata"
      ,file_size_limit:this.swfParams.maxFileSize
      ,file_types:this.swfParams.allowedFileTypes
      ,file_queue_limit:this.swfParams.maxFiles
      ,button_window_mode:'transparent'
      ,debug:false
      ,post_params:{}
      ,button_placeholder_id:cmp.uploadConfig.body.id
      ,file_dialog_start_handler:this.swfUploaderDialogOpen.createDelegate(this, [cmp], true)
      ,swfupload_loaded_handler:this.swfUploaderLoaded.createDelegate(this, [cmp], true)
      ,file_dialog_complete_handler:this.swfUploaderDialogComplete.createDelegate(this, [cmp], true)
      ,file_queue_error_handler:this.swfUploaderFileQueueError.createDelegate(this, [cmp], true)
      ,upload_progress_handler:this.swfUploaderFileUploadProgress.createDelegate(this, [cmp], true)
      ,upload_start_handler:this.swfUploaderFileUploadStart.createDelegate(this, [cmp], true)
      ,upload_error_handler:this.swfUploaderFileUploadError.createDelegate(this, [cmp], true)
      ,upload_complete_handler:this.swfUploaderFileUploadComplete.createDelegate(this, [cmp], true)
    };
    return new SWFUpload(config);
  }

  /**
   * Returns a new html5 upload instance to bind a dropzone to.
   * @return {Object} Ext.ux.Html5Connector
   */
  ,getHtml5Connector:function() {
    return new Ext.ux.Html5Connector();
  }

  ,startHtml5Upload:function(files, cmp) {
    var tooManyFiles = files.length > this.html5Params.maxFiles;
    if (tooManyFiles && this.html5Params.maxFiles)
      this.swfUploaderFileQueueError(null, -100, this.html5Params.maxFiles, cmp);
    else {
      Ext.each(files, function(file, index) {
	file.id = Ext.id();
	var isTooBig = ((file.size / 1000) / this.html5Params.maxFileSize) > 1;
	var allowedTypes = this.getAllowedTypesReg(this.html5Params.allowedFileTypes);
	var isAllowedType = allowedTypes ? allowedTypes.test(file.name) : true;
	if (!isAllowedType)
	  this.swfUploaderFileQueueError(file, -130, "", cmp);
	else if (isTooBig && this.html5Params.maxFileSize)
	  this.swfUploaderFileQueueError(file, -110, "", cmp);
	else {
	  this.getLogPanel().add(Ext.apply(file, {id:Ext.id()}));
	  var xhr = new XMLHttpRequest();
	  xhr.upload.addEventListener("loadstart", this.uploadStart.createDelegate(this, [file, cmp], 0), false);
	  xhr.upload.addEventListener("load", this.uploadLoad.createDelegate(this, [file, cmp], 0), false);
	  xhr.upload.addEventListener("error", this.uploadError.createDelegate(this, [file, cmp], 0), false);
	  xhr.upload.addEventListener("progress", this.uploadProgress.createDelegate(this, [file], 0), false);
	  xhr.open("POST", this.html5Params.url , true);
	  xhr.setRequestHeader('Content-Type', 'application/octet-stream');
	  xhr.setRequestHeader('X-File-Name', file.name);
	  xhr.setRequestHeader('X-File-Size', file.size);
	  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	  xhr.send(file);
	}
      }, this);
    }
  }

  /**
   * Returns the panel to log upload events.
   */
  ,getLogPanel:function() {
    if (!this.logPanel)
      this.logPanel = new Ext.ux.uploadLogPanel({
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
  ,swfUploaderDialogComplete:function(numFilesSelected, numFilesQueued, cmp) {
    this.uploadingFileCount = 0;
    if (numFilesQueued && this.fireEvent("beforeupload", this, cmp) !== false) {
      var msg = numFilesQueued + " " + (numFilesQueued>1 ? "files" : "file") + " to upload";
      var conn = cmp.uploadConfig.conn;
      conn.refreshCookies(true);
      conn.setUploadURL(this.swfParams.url);
      conn.startUpload();
    }
  }

  ,onHtml5FilesDrop:function(e, selector, options, cmp) {
    e.stopPropagation();
    e.preventDefault();
    var dt = e.browserEvent.dataTransfer;
    var files = dt.files;
    var target = Ext.get(e.target);
    if (files.length && this.fireEvent("beforeupload", this, cmp) !== false) {
      this.getLogPanel().show({
	fileCount:files.length
      });
      this.startHtml5Upload(files, cmp);
    }
  }

  ,swfUploaderDialogOpen:function(cmp) {
    this.getLogPanel().show({fileCount:0});
  }

  ,swfUploaderFileUploadStart:function(file) {
    this.getLogPanel().add(file);
  }

  ,uploadStart:function() {

  }

  ,swfUploaderFileUploadProgress:function(file, uploadedSize, totalSize) {
    this.getLogPanel().updateProgress(file, uploadedSize/totalSize);
  }
  ,uploadProgress:function(file, event) {
    if (event.lengthComputable) {
      this.getLogPanel().updateProgress(file, event.loaded/event.total);
    }
  }

  ,swfUploaderFileUploadComplete:function(file, cmp) {
    this.getLogPanel().updateProgress(file, 1);
    this.fireEvent("fileupload", this, cmp, file);
  }
  ,uploadLoad:function(file, cmp, event) {
    this.getLogPanel().updateProgress(file, event.loaded/event.total);
    this.fireEvent("fileupload", this, cmp, file);
  }

  ,swfUploaderFileQueueError:function(file, errorCode, errorMsg, cmp) {
    if (errorCode === -100) errorMsg = "nombre de fichiers maximum atteint (max:"+errorMsg+")";
    else if (errorCode === -110) errorMsg = "taille de fichier maximum atteinte (max:"+this.maxFileSize+" KB)";
    else if (errorCode === -130) errorMsg = "le type de fichier n'est pas valide";
    if (file) {
      this.getLogPanel().add(file);
      this.getLogPanel().updateProgress(file, 0, "error");
    }
    this.getLogPanel().log("error", errorMsg);
  }
  ,uploadError:function(file, cmp, event) {
    this.getLogPanel().log("error", "queue error");
    if (file) this.getLogPanel().add(file, "error");
  }

  ,swfUploaderFileUploadError:function() {

  }

  ,swfUploaderLoaded:function(cmp) {
    cmp.uploadConfig.conn.isLoaded = true;
    this.resizeTrigger.call(cmp);
  }

  ,getAllowedTypesReg:function(types) {
    var t = [];
    if (types === "*.*") return false;
    types = types.split(";");
    Ext.each(types, function(type) {
      t.push(type.split(".")[1]);
    });
    var reg = "^.*\.("+t.join("|")+")$";
    return new RegExp(reg, "g");
  }

});















/**
 * @class uploadLogPanel
 * @extends Ext.util.Observable
 * The AuthPanel is a simple panel used as a container for two components :<br/>
 * The application combobox to select available applications. <br/>
 * The AuthTab panels displaying application's meta-groups.<br/>
 * @author Gary van Woerkens
 * @version 1.0
 */

Ext.ux.uploadLogPanel = function(config) {

  Ext.apply(this, config);

  this.panel = new Ext.Panel({
    border:false
    ,padding:"2"
    ,defaults:{style:"margin:0 0 2 0"}
    ,bbar:new Ext.ux.StatusBar({
      height:22
      ,style:"border:1px solid #99BBE8;"
    })
    ,autoScroll:true
  });

  Ext.ux.uploadLogPanel.superclass.constructor.apply(this, arguments);

};

Ext.extend(Ext.ux.uploadLogPanel, Ext.util.Observable, {

  boundEl:null
  ,win:null
  ,queue:[]

  ,progressTpl:new Ext.Template('<div class="x-progress-text-{type}">{text}</div>')

  ,getWindow:function() {
    if (this.boundEl) this.boundEl.mask();
    if (!this.win) {
      if (this.boundEl) {
	this.win = new Ext.Panel({
	  height:200
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
	  ,border:true
	  ,closeAction:"hide"
	  ,items:[this.panel]
	});
      }
    }
    return this.win;
  }

  ,getStatusBar:function() {
    return this.panel.getBottomToolbar();
  }

  ,show:function(config) {
    var scope = config.scope || null,
    callback = config.callback || Ext.emptyFn,
    toolbar = this.getStatusBar();
    callback = scope ? callback.createDelegate(scope) : callback;
    if (!this.win || this.win.hidden) {
      toolbar.on({afterrender:callback});
      this.getWindow().show();
    } else {
      callback();
    }
    var msg = config.fileCount + " " + (config.fileCount>1 ? "files" : "file") + " to upload";
    this.log("info", msg);
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

  ,log:function(type, msg) {
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

  ,updateProgress:function(file, progress, type) {
    var toolbar = this.getStatusBar(),
    p = this.getProgress(file.id);
    if (progress === 1 || type == "error") {
      type = type || "success";
      p.isUploading = false;
    }
    type = type || "loading";
    p.updateProgress(progress, this.progressTpl.apply({type:type, text:file.name}));
    var count = this.getUploadingCount();
    if (count) {
      count = this.queue.length - count;
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

});

Ext.reg('uploadlogspanel', Ext.ux.uploadLogPanel);






Ext.ns('Ext.ux');
/**
 * @class SwfConnector
 * @extends Ext.util.Observable
 * The AuthPanel is a simple panel used as a container for two components :<br/>
 * The application combobox to select available applications. <br/>
 * The AuthTab panels displaying application's meta-groups.<br/>
 * @author Gary van Woerkens
 * @version 1.0
 */
Ext.ux.SwfConnector = function(config) {
    //var config = getSwfConfig.call(cmp);
    //cmp.swfUploader = new SWFUpload(config);
};

Ext.extend(Ext.ux.SwfConnector, Ext.util.Observable, {

  initComponent:function() {

    Ext.ux.SwfConnector.superclass.initComponent.call(this);

  }

});


Ext.ns('Ext.ux');
/**
 * @class Html5Connector
 * @extends Ext.util.Observable
 * The AuthPanel is a simple panel used as a container for two components :<br/>
 * The application combobox to select available applications. <br/>
 * The AuthTab panels displaying application's meta-groups.<br/>
 * @author Gary van Woerkens
 * @version 1.0
 */
Ext.ux.Html5Connector = function(config) {

};

Ext.extend(Ext.ux.Html5Connector, Ext.util.Observable, {

  initComponent:function() {

    Ext.ux.Html5Connector.superclass.initComponent.call(this);

  }

});