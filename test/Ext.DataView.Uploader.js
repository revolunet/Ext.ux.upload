/*
** Ext.DataView.Uploader.js for Uploader
**
** Made by Gary van Woerkens
** Contact <gary@chewam.com>
**
** Started on  Wed May 26 17:45:41 2010 Gary van Woerkens
** Last update Mon May 31 21:53:51 2010 Gary van Woerkens
*/

Ext.ns('Ext.ux');

/***************************************************************************************
 ***************************************************************************************
 **** UPLOADER *************************************************************************
 ***************************************************************************************
 ***************************************************************************************/

Ext.ux.Uploader = function(cfg) {

  cfg = Ext.applyIf(cfg || {}, {
    allowedFileTypes:"*.*"
    ,uploadUrl:"/dev/upload/test/upload.php"
    ,maxFileSize:100000000000
    ,maxTotalSize:100000000000
    ,maxFiles:10
    ,buttonImageUrl:"/apps/whiteboard/static/img/button_upload.png" // needed for chrome
  });

  var triggers = ["button", "menuitem"];
  var dropZones = ["dataview"];

  this.init = function(cmp) {
    cmp.getUploader = getUploader.createDelegate(this);
    setUploadProcess.call(this, cmp);
  };

  var getUploader = function() {
    return this;
  };

  var setUploadProcess = function(cmp) {
    console.log('setUploadProcess', this, arguments);
    var xtype = cmp.getXType();
    if (isTrigger(xtype) !== false) {
      cmp.on({
	scope:cmp
	,afterrender:onTriggerRender
	,resize:onTriggerResize
      });
    } else if (isDropZone(xtype) !== false) {
      cmp.on({
	scope:this
	,render:onDropZoneRender
      });
    }
  };

  var isTrigger = function(xtype) {
    return triggers.indexOf(xtype) > -1;
  };

  var isDropZone = function(xtype) {
    return dropZones.indexOf(xtype) > -1;
  };

  /******************************************
   * DROP ZONE ******************************
   * ****************************************/

  var onDropZoneRender = function(cmp) {
    console.log('onDropZoneRender', this, arguments);
    var el = cmp.getEl();
    if (cmp.uploadLogPanelTarget === true)
      this.boundEl = el;
    el.on({
      scope:cmp
      ,dragover:function(e) {
	e.stopPropagation();
	e.preventDefault();
	// prevents drop in FF ;-(
	if (!Ext.isGecko) {
	  e.browserEvent.dataTransfer.dropEffect = 'copy';
	}
      }
      ,drop:function(e) {
	e.stopPropagation();
	e.preventDefault();
	var dt = e.browserEvent.dataTransfer;
	var files = dt.files;
	var target = Ext.get(e.target);
	if (files.length) {
	  cmp.getUploader().getLogPanel().show({
	    fileCount:files.length
	  });
	}
	startUpload.call(cmp, files);
      }
    });
  };

  var startUpload = function(files) {
    Ext.each(files, function(file, index) {
      this.getUploader().getLogPanel().add(Ext.apply(file, {id:Ext.id()}));
      var xhr = new XMLHttpRequest();
      console.log("CONN:", xhr.upload);
      xhr.upload.addEventListener("loadstart", uploadStart.createDelegate(this), false);
      xhr.upload.addEventListener("load", uploadLoad.createDelegate(this, [file], 0), false);
      xhr.upload.addEventListener("error", uploadError.createDelegate(this), false);
      xhr.upload.addEventListener("progress", uploadProgress.createDelegate(this, [file], 0), false);
      xhr.open("POST", cfg.uploadUrl , true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('X-File-Name', file.name);
      xhr.setRequestHeader('X-File-Size', file.size);
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhr.send(file);
    }, this);
  };

  /******************************************
   * HTML 5 UPLOAD HANDLERS *****************
   * ****************************************/

  var uploadStart = function() {
    console.log('uploadStart', this, arguments);
  };

  var uploadError = function(event) {
    console.log('error', this,  evt, (evt.toString()));
    //this.item.onError();
  };

  var uploadProgress = function(file, event) {
    console.log('uploadProgress', this, arguments);
    if (event.lengthComputable) {
      this.getUploader().getLogPanel().updateProgess(file, event.loaded/event.total);
      //this.item.updateFileProgress(event.loaded);
    }
  };

  var uploadLoad = function(file, event) {
    console.log('load', this, arguments);
    this.getUploader().getLogPanel().updateProgess(file, event.loaded/event.total);
    /*
     succes = false;
     try {
     succes = (this.item.xhr.status == 200) ;
     }
     catch (e) {
     succes = false;
     }
     if (succes) {
     this.item.onComplete();
     }
     else {
     this.item.onError();
     }
     */
  };

  /******************************************
   * TRIGGER ********************************
   * ****************************************/

  var onTriggerRender = function(cmp) {
    var el = Ext.DomHelper.append(cmp.getEl(), {id:"firstdiv", children:[{
      children:[{id:Ext.id()}]
    }]}, true);
    cmp.swfCtn = el.first();
    cmp.swfWrp = cmp.swfCtn.first();
    Ext.DomHelper.applyStyles(cmp.swfCtn, {
      position:"absolute"
      ,cursor:"pointer"
    });
    var config = getSwfConfig.call(cmp);
    cmp.swfUploader = new SWFUpload(config);
  };

  var getSwfConfig = function() {
    return {
      flash_url:"../swfupload.swf"
      ,movieName:"easy-swf-upload"
      ,upload_url:cfg.uploadUrl
      ,file_post_name:"Filedata"
      ,file_size_limit:cfg.maxFileSize
      ,file_types:cfg.allowedFileTypes
      ,file_upload_limit:cfg.maxFiles
      ,file_queue_limit:cfg.maxFiles
      ,button_window_mode:Ext.isChrome?'window':'transparent'
      ,debug:true
      ,post_params:{}
      ,scope:this
      ,button_placeholder_id:this.swfWrp.id
      ,file_dialog_start_handler:swfUploaderDialogOpen.createDelegate(this)
      ,swfupload_loaded_handler:swfUploaderLoaded.createDelegate(this)
      ,file_dialog_complete_handler:swfUploaderDialogComplete.createDelegate(this)
      ,file_queue_error_handler:swfUploaderFileQueueError.createDelegate(this)
      ,upload_progress_handler:swfUploaderFileUploadProgress.createDelegate(this)
      ,upload_start_handler:swfUploaderFileUploadStart.createDelegate(this)
      ,upload_error_handler:swfUploaderFileUploadError.createDelegate(this)
      ,upload_complete_handler:swfUploaderFileUploadComplete.createDelegate(this)
      ,queue_complete_handler:swfUploaderFileQueueComplete.createDelegate(this)
    };
  };

  var onTriggerResize = function() {
    var height = this.el.getHeight();
    var width = this.el.getWidth();
    this.swfCtn.setXY(this.el.getXY());
    this.swfCtn.setSize(width, height);
    if (this.swfUploader.isLoaded)  {
      if (Ext.isChrome && cfg.buttonImageUrl) {
        this.swfUploader.setButtonImageURL(cfg.buttonImageUrl);
      }
      this.swfUploader.setButtonDimensions(width, height);
    }
  };

  var startSwfUpload = function() {
    this.swfUploader.refreshCookies(true);
    this.swfUploader.startUpload();
  };

  /******************************************
   * SWFUPLOAD HANDLERS *********************
   * ****************************************/

  var swfUploaderDialogOpen = function() {
    console.log('swfUploaderDialogOpen', this, arguments);
  };

  var swfUploaderLoaded = function() {
    this.swfUploader.isLoaded = true;
    onTriggerResize.call(this);
  };

  var swfUploaderDialogComplete = function(numFilesSelected, numFilesQueued, numFilesInQueue) {
    this.uploadingFileCount = 0;
    if (numFilesQueued) {
      this.getUploader().getLogPanel().show({
	fileCount:numFilesQueued
	,scope:this
	,callback:startSwfUpload
      });
    }
  };

  var swfUploaderFileQueueError = function() {
    console.log("swfUploaderFileQueueError", this, arguments);
  };

  var swfUploaderFileUploadProgress = function(file, uploadedSize, totalSize) {
    console.log("swfUploaderFileUploadProgress", this, arguments);
    this.getUploader().getLogPanel().updateProgess(file, uploadedSize/totalSize);
  };

  var swfUploaderFileUploadStart = function(file) {
    console.log("swfUploaderFileUploadStart", this, arguments);
    this.getUploader().getLogPanel().add(file);
  };

  var swfUploaderFileUploadError = function() {
    console.log("swfUploaderFileUploadError", this, arguments);
    this.getUploader().getLogPanel().log("file upload error");
  };

  var swfUploaderFileUploadComplete = function() {
    console.log("swfUploaderFileUploadComplete", this, arguments);
  };

  var swfUploaderFileQueueComplete = function() {
    console.log("swfUploaderFileQueueComplete", this, arguments);
    this.getUploader().getLogPanel().log("all files uploaded successfully");
  };

};


Ext.extend(Ext.ux.Uploader, Ext.util.Observable, {

  boundEl:null

  ,getLogPanel:function() {
    console.log('getLogPanel', this, arguments);
    if (!this.logPanel)
      this.logPanel = new Ext.ux.uploadLogPanel({
	boundEl:this.boundEl
      });
    return this.logPanel;
  }

  ,uploadFile:function() {
    console.log("uploadFile", this, arguments);
  }

});

/***************************************************************************************
 ***************************************************************************************
 **** LOG PANEL ************************************************************************
 ***************************************************************************************
 ***************************************************************************************/

Ext.ns('Ext.ux');

Ext.ux.uploadLogPanel = function(config) {
  Ext.apply(this, config);
  this.panel = new Ext.Panel({
    border:false
    ,bbar:new Ext.ux.StatusBar()
    ,autoScroll:true
  });
  Ext.ux.file.Uploader.superclass.constructor.apply(this, arguments);
};

Ext.extend(Ext.ux.uploadLogPanel, Ext.util.Observable, {

  boundEl:null
  ,win:null
  ,progressQueue:[]

  ,getWindow:function() {
    console.log('getWindow', this, arguments);
    if (!this.win) {
      if (this.boundEl) {
	this.boundEl.mask();
	this.win = new Ext.Panel({
	  height:200
	  ,width:200
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
	  ,bodyStyle:"border:1px solid #99BBE8;"
	  ,listeners:{
	    scope:this
	    ,show:function(panel) {
	      console.log('show', this, arguments, panel);
	      panel.el.anchorTo(this.boundEl, "c-c");
	      panel.doLayout();
	    }
	  }
	}).render(this.boundEl);
      } else {
	this.win = new Ext.Window({
	  height:200
	  ,width:200
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
    config.callback = config.callback || Ext.emptyFn;
    var toolbar = this.getStatusBar(),
    callback = config.callback.createDelegate(config.scope);
    if (!this.win || this.win.hidden) {
      toolbar.on({afterlayout:callback});
      this.getWindow().show();
    } else callback();
    toolbar.setStatus({
      text:config.fileCount + " file(s) to upload"
    });
  }

  ,add:function(file) {
    var p = new Ext.ProgressBar({
      text:file.name
    });
    this.panel.add(p);
    this.panel.doLayout();
    this.progressQueue.push({
      id:file.id
      ,p:p
    });
  }

  ,log:function(msg) {
    this.getStatusBar().setStatus({
      text:msg
    });
  }

  ,getProgress:function(id) {
    var index = Ext.each(this.progressQueue, function(item, index) {
      return !(item.id === id);
    });
    return Ext.isDefined(index) ? this.progressQueue[index].p : false;
  }

  ,updateProgess:function(file, progress) {
    var toolbar = this.getStatusBar();
    var p = this.getProgress(file.id);
    p.updateProgress(progress);
  }

});

Ext.reg('uploadlogspanel', Ext.ux.uploadLogPanel);
