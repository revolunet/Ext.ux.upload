/*
** Ext.DataView.Uploader.js for Uploader
**
** Made by Gary van Woerkens
** Contact <gary@chewam.com>
**
** Started on  Wed May 26 17:45:41 2010 Gary van Woerkens
** Last update Fri May 28 20:46:42 2010 Gary van Woerkens
*/

Ext.ns('Ext.ux');

Ext.ux.Uploader = function(cfg) {

  cfg = Ext.applyIf(cfg || {}, {
    allowedFileTypes:"*.*"
    ,uploadUrl:"/dev/upload/test/upload.php"
    ,maxFileSize:10000
    ,maxFiles:10
    ,buttonImageUrl:"/apps/whiteboard/static/img/button_upload.png" // needed for chrome
  });

  var triggers = ["button", "menuitem"];
  var dropZones = ["dataview"];

  this.init = function(cmp) {
    cmp.getUploader = getUploader.createDelegate(this);
    setUploadProcess(cmp);
    console.log("Init", this, arguments, cfg);
  };

  var getUploader = function() {
    return this;
  };

  var setUploadProcess = function(cmp) {
    var xtype = cmp.getXType();
    if (isTrigger(xtype) !== false) {
      cmp.on({
	scope:cmp
	,afterrender:onTriggerRender
	,resize:onTriggerResize
      });
    } else if (isDropZone(xtype) !== false) {
      cmp.on({
	scope:cmp
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
    var el = cmp.getEl();
    el.on('dragover', function(e) {
      e.stopPropagation();
      e.preventDefault();
      // prevents drop in FF ;-(
      if (! Ext.isGecko) {
        e.browserEvent.dataTransfer.dropEffect = 'copy';
      }
    }, this);

    el.on('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();
      var dt = e.browserEvent.dataTransfer;
      var files = dt.files;
      var target = Ext.get(e.target);
      console.log("onDrop", files);
      //this.onInputFileChange(null, null, null, files);
    }, this);

  };

  /******************************************
   * TRIGGER ********************************
   * ****************************************/

  var onTriggerRender = function(cmp) {
    var el = Ext.DomHelper.append(cmp.getEl(), {id:"firstdiv", children:[{
      children:[{id:Ext.id()}]
    }]}, true);
    cmp.swfCtn = el.first(),
    cmp.swfWrp = cmp.swfCtn.first();
    Ext.DomHelper.applyStyles(cmp.swfCtn, {
      position:"absolute"
      ,cursor:"pointer"
    });
    var config = getSwfConfig.call(cmp);
    console.log("onTriggerRender", this, arguments, config);
    cmp.swfUploader = new SWFUpload(config);
  };

  var getSwfConfig = function() {
    console.log("getSwfConfig", this, arguments);
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
      ,debug:false
      ,post_params:{}
      ,scope:this
      ,button_placeholder_id:this.swfWrp.id
      ,swfupload_loaded_handler:swfUploaderLoaded.createDelegate(this)
      ,file_dialog_complete_handler:swfUploaderDialogComplete.createDelegate(this)
      ,file_queue_error_handler:swfUploaderFileQueueError.createDelegate(this)
      ,upload_progress_handler:swfUploaderFileUploadProgress.createDelegate(this)
      ,upload_start_handler:swfUploaderFileUploadStart.createDelegate(this)
      ,upload_error_handler:swfUploaderFileUploadError.createDelegate(this)
      ,upload_complete_handler:swfUploaderFileUploadComplete.createDelegate(this)
      ,queue_complete_handler:swfUploaderFileQueueComplete.createDelegate(this)
      /*
      ,file_dialog_start_handler:this.dialogOpen.createDelegate(this)
       */
    };
  };

  var onTriggerResize = function() {
    console.log("onTriggerResize", this, arguments);
    var height = this.el.getHeight();
    var width = this.el.getWidth();
    this.swfCtn.setXY(this.el.getXY());
    this.swfCtn.setSize(width, height);
    console.log('resize swf', width, height, this.swfUploader.isLoaded);
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

  var swfUploaderLoaded = function() {
    console.log("swfuploadLoaded", this, arguments);
    this.swfUploader.isLoaded = true;
    onTriggerResize.call(this);
  };

  var swfUploaderDialogComplete = function(numFilesSelected, numFilesQueued, numFilesInQueue) {
    console.log("swfUploaderDialogComplete", this, arguments);
    //this.fireEvent("dialogComplete", this.uploader, numFilesSelected, numFilesQueued, numFilesInQueue);
    this.uploadingFileCount = 0;
    if (numFilesQueued) {
      //this.totalFiles = numFilesQueued;
      //showUploadWindow.call(this, numFilesQueued);
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
//    this.getUploader().getLogPanel().error("file upload error");
  };

  var swfUploaderFileQueueComplete = function() {
    console.log("swfUploaderFileQueueComplete", this, arguments);
    this.getUploader().getLogPanel().log("all files uploaded successfully");
//    this.getUploader().getLogPanel().error("file upload error");
  };

/*
  var showUploadWindow = function(fileCount) {
    console.log("showUploadWindow", this, arguments);
    this.getUploader().getLogPanel().show({
      fileCount:fileCount
      ,scope:this.getUploader()
      ,callback:this.uploadFile
    });
  };
*/
};

/***************************************************************************************
 ***************************************************************************************
 **** UPLOADER *************************************************************************
 ***************************************************************************************
 ***************************************************************************************/

Ext.extend(Ext.ux.Uploader, Ext.util.Observable, {

  getLogPanel:function() {
    if (!this.logPanel)
      this.logPanel = new Ext.ux.uploadLogPanel();
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

  var id = Ext.id();
  console.log("create status bar", id);
  this.panel = new Ext.Panel({
    bbar:new Ext.ux.StatusBar({id:id})
  });

  Ext.ux.file.Uploader.superclass.constructor.apply(this, arguments);
};

Ext.extend(Ext.ux.uploadLogPanel, Ext.util.Observable, {

  boundEl:null
  ,progressQueue:[]

  ,getWindow:function() {
    var win = null;
    if (this.boundEl) {
      win = new Ext.Panel({
	height:200
	,width:200
	,layout:"fit"
	,border:false
	,items:[this.panel]
      });
    } else {
      win = new Ext.Window({
	height:200
	,width:200
	,layout:"fit"
	,border:false
	,closeAction:"hide"
	,items:[this.panel]
      });
    }
    return win;
  }

  ,getStatusBar:function() {
    return this.panel.getBottomToolbar();
  }

  ,show:function(config) {
    console.log("show", this, arguments, this.panel.getBottomToolbar());
    var toolbar = this.getStatusBar();
    toolbar.setStatus({
      text:config.fileCount + " file(s) to upload"
    });
    this.getStatusBar().on("afterlayout", config.callback.createDelegate(config.scope));
    this.getWindow().show();
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
