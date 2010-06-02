//
// Ext.ux.UploadManager.js
//
// See README.md
//

Ext.ux.UploadManager = Ext.extend(Ext.Panel, {
    useHtml5:true                                           // allow drag drop in this panel body
    ,html5Config:{
        dragOverColor:'cyan'
    }
    ,useSwfUpload:true                                      // allow SWFupload on dblclick
    ,swfUploadConfig:{
        showToolbarButton:true
    }
    ,maxFiles:10
    ,allowedFilesTypes:'*.swf; *.flv; *.avi; *.mp4; *.jpg; *.png; *.gif; *.pdf'
    ,maxTotalSize:100000
    ,maxFileSize:10000
    ,uploadUrl:'/upload'                // your server side script
    ,progressConfig: {
        height:20
        ,showSize:true
    }
    ,initComponent: function() {
        this.queue = {}
        this.queuePanel = new Ext.Panel({
            title:'queue'
            ,height:200
            ,items:[{border:false, html:'drop files heres'}]
        });
        this.items = [this.queuePanel]

        // returns a new button linked to this uploadPanel (flash button embedded)
        this.getSwfUploaderButton = function(config) {
            var base_conf = {
                    uploadUrl:this.uploadUrl
                    ,text:'upload'
                    ,maxFiles:this.maxFiles
                    ,allowedFilesTypes:this.allowedFilesTypes
                    ,maxFileSize:this.maxFileSize
                    ,listeners:{
                        'fileUploadStart':{
                            scope:this
                            ,fn:function(btn, file) {
                                this.addQueue({name:file.name, size:file.size}, file.id);
                            }
                        }
                        ,'fileUploadProgress':{
                            scope:this
                            ,fn:function(btn, file, bytesLoaded, bytesTotal) {
                                this.queue[file.id].updateFileProgress(bytesLoaded);
                            }
                        }
                        ,'fileUploadError':{
                            scope:this
                            ,fn:function(btn, file, bytesLoaded, bytesTotal) {
                                this.queue[file.id].onError();
                            }
                        }
                        ,'dialogComplete':{
                            scope:this
                            ,fn:function(btn, file) {
                               // console.log('dialogComplete', btn);
                               }

                        }
                        ,'fileUploadComplete':{
                            scope:this
                            ,fn:function(btn, file) {
                                  if (file.filestatus == SWFUpload.FILE_STATUS.COMPLETE) {
                                        this.queue[file.id].onComplete();
                                    }
                                    else {
                                        this.queue[file.id].onError();
                                    }
                            }
                        }

                    }
                };
            Ext.apply(base_conf, config);
            var b = new Ext.ux.SwfUploaderButton(base_conf);
            return b;
        }


         if (this.useSwfUpload && this.swfUploadConfig.showToolbarButton) {
                // add some tests buttons
                this.tbar = [
                    this.getSwfUploaderButton({text:'upload1'})
                    ,this.getSwfUploaderButton({text:'upload2'})
                     , {text:'upload',menu:{items:[
                        this.getSwfUploaderButton({text:'upload3'})
                     ]}}
                    ];
         }


       Ext.ux.UploadManager.superclass.initComponent.apply(this, arguments);

         if (this.useHtml5) {
            // enable html5 drop + upload for FF and chrome
            this.queuePanel.on(
                'render',
                function() {
                    console.log('render', this);
                    this.makeDroppable(this.queuePanel.body);
             }, this);
        }

    },
    // make a linked droppable zone from given el
    makeDroppable: function(el) {
         el.on('dragover', function(e) {
            var tgt = Ext.get(e.target);
            tgt.setStyle('background-color', this.html5Config.dragOverColor);
            e.stopPropagation();
            e.preventDefault();
            return;
        }, this);
        el.on('dragexit', function(e) {
            var tgt = Ext.get(e.target);
            tgt.setStyle('background-color', 'white');
            e.stopPropagation();
            e.preventDefault();
            return;
        }, this);
        el.on('drop', function(e) {
            var tgt = Ext.get(e.target);
            tgt.setStyle('background-color', 'white');
            this.html5_dropped(e.browserEvent);
            e.stopPropagation();
            e.preventDefault();
            return;
        }, this);
    },
    // private : html5 multipe files management
    html5_dropped: function(e) {
            var files = e.dataTransfer.files;
            if (!files) return;
            for(var i = 0, len = files.length; i < len; i++) {
                var file = files[i];
                var local_id = this.addQueue({name:file.fileName, size:file.fileSize});
                this.html5_uploadFile(file, local_id);
            }
    },
    // private : uploads a single html5 file
    html5_uploadFile:function(file, local_id) {
         local_queue_item = this.queue[local_id] ;
         local_queue_item.xhr = new XMLHttpRequest();
         local_queue_item.xhr.upload.item = local_queue_item  ;                     // dirty trick :/
         local_queue_item.xhr.upload.addEventListener("progress", function(event) {
            console.log('progress', event.loaded, this, this.item);
            if (event.lengthComputable) {
                this.item.updateFileProgress(event.loaded);
            }
        }, false);

        local_queue_item.xhr.upload.addEventListener("load", function(event) {
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


        }, false);

        local_queue_item.xhr.upload.addEventListener("error", function(evt) {
            console.log('error', this,  evt, (evt.toString()));
            this.item.onError();
        }, false);

        local_queue_item.xhr.open("POST", this.uploadUrl , true);
        local_queue_item.xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        local_queue_item.xhr.setRequestHeader('X-File-Name', local_queue_item.file.name);
        local_queue_item.xhr.setRequestHeader('X-File-Size', local_queue_item.file.size);
        //local_queue_item.xhr.setRequestHeader('User-Agent', 'XMLHttpRequest');
        local_queue_item.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        local_queue_item.xhr.send(file);
    }

    // add a given file 'from drop or flash' to the internal upload list
    // add a progressbar to the queuePanel
    ,addQueue: function(file, id) {
        console.log('addQueue', file);
        var int_id = id?id:this.queue.length;

        var p = new Ext.ProgressBar({
            border:true
            ,width:'100%'
            ,id:int_id
            ,file:file
            ,height:this.progressConfig.height
            ,cls:'left-align'
            ,status:'queued'
            ,started:new Date()
            ,loaded:0
            ,xhr:null
            ,showSize:this.progressConfig.showSize
            ,getSize: function() {
                return Math.round((parseInt(this.file.size)/1024*100000)/100000)+'K '
            }
            ,getLabel:function(showSize) {
                var lab = this.file.name;
                if (showSize) lab += ' (' + this.getSize() + ')';
                return lab
            }
            ,getRemainingtime:function() {
                if (this.status == 'complete') return 0;
                var now = new Date();
                var elapsed = now.getTime() - this.started.getTime();
                elapsed /= 1000;
                var perc = (this.loaded / this.file.size);
                var remaining = ((elapsed / perc ) - elapsed);
                if (isNaN(remaining)) remaining=1000;
                return parseInt(remaining);
            }
            ,onComplete:function() {
                console.log('onComplete', this);
                this.updateProgress(1,'Terminé: ' +this.getLabel(this.showSize), true);
                this.status='complete';
                this.loaded = this.file.size;
                this.fireEvent('onFileComplete', this);
            }
            ,onError:function() {
                this.status='error';
                this.loaded = 0;
                this.updateProgress(0, 'Erreur: '+this.getLabel(this.showSize), false);
                this.fireEvent('onFileError', this);
            }
            ,updateFileProgress:function(octets) {
                    this.loaded = parseInt(octets);
                    percentage = (this.loaded / this.file.size);
                    this.updateProgress(percentage, this.getLabel(this.showSize), true);
                    this.getRemainingtime();
            }
          });

         // get default label
         p.text = p.getLabel();

         // insert a top
         this.queuePanel.insert(0, p);

         //store internaly
         this.queue[int_id] = p;

         //refresh view
         this.queuePanel.doLayout();

         // return internal id
         return int_id;
    }
});


// slighty simplified
Ext.ux.SwfUploaderButton= Ext.extend(Ext.Button, {
  swfu: null
  ,uploadUrl:null
  ,buttonImageUrl:"/apps/whiteboard/static/img/button_upload.png"       // needed for chrome
  ,allowedFileTypes:"*.*"
  ,maxFileSize:10000
  ,maxFiles:10
  ,initComponent:function() {

    this.containerID = "swf-item-ctn"+this.id;
    this.buttonID = "swf-item-btn"+this.id;

    Ext.ux.SwfUploaderButton.superclass.initComponent.apply(this, arguments);

    this.on({
      scope:this
      ,afterrender:function() {
        this.swfu = this.getSwfConfig();
        var el = this.getEl();
        var ctnEl = el.insertHtml("beforeEnd", '<div><div '
          + 'id="' + this.containerID + '" '
          + 'style="'
          + 'position:absolute;'
          + 'cursor:pointer;'
          + '">'
          + '<div id="' + this.buttonID + '"></div>'
          + '</div></div>'
        );
        var swfCtn = Ext.get(this.containerID);
        this.swfu.button_placeholder_id = this.buttonID;
        this.swfu.scope = this;
        this.uploader = new SWFUpload(this.swfu);
      }
      ,resize:function() {
        var swfCtn = Ext.get(this.containerID);
        var height = this.el.getHeight();
        var width = this.el.getWidth();
        swfCtn.setXY(this.el.getXY());
        swfCtn.setSize(width, height);
        console.log('resize swf', width, height);
        if (this.uploader.isLoaded)  {
            if (Ext.isChrome && this.buttonImageUrl) {
                 this.uploader.setButtonImageURL(this.buttonImageUrl);
                  }
            this.uploader.setButtonDimensions(width, height);
        }
      }
    });

  }

  // SWFupload ready
  ,swfuploadLoaded:function() {
    this.uploader.isLoaded = true;
    this.fireEvent('resize');
  }
  // SWFupload file selection dialog opened
  ,dialogOpen:function() {
    console.log('dialogOpen');
    this.fireEvent("dialogOpen");
  }
  // SWFupload file selection closed
  ,dialogComplete:function(numFilesSelected, numFilesQueued, numFilesInQueue) {
    this.fireEvent("dialogComplete", this.uploader, numFilesSelected, numFilesQueued, numFilesInQueue);
    this.uploadingFileCount = 0;
    if (numFilesQueued) {
      this.totalFiles = numFilesQueued;
      this.uploader.refreshCookies(true);
      this.uploader.startUpload();
    }
  }
  // SWFupload queue complete
  ,fileQueueComplete:function(numFilesSelected, numFilesQueued) {
    this.fireEvent("fileQueueComplete", this.uploader);
  }
  // SWFupload file upload progress
  ,fileUploadProgress:function(file, bytesLoaded, bytesTotal) {
    this.fireEvent("fileUploadProgress", this, file, bytesLoaded, bytesTotal);
  }
 // SWFupload file upload start
  ,fileUploadStart:function(file) {
    this.fireEvent("fileUploadStart", this, file);
    this.uploadingFileCount++;
    return true;
  }
  // SWFupload file upload complete
  ,fileUploadComplete:function(file) {
    this.fireEvent("fileUploadComplete", this, file);
    return true;
  }
  // SWFupload file queue error
  ,fileQueueError:function(file, error, message) {
    this.fireEvent("fileQueueError", file, error, message);
  }
  // SWFupload file upload error
  ,fileUploadError:function(file, error, message) {
    if (!this.uploadError) {
      this.uploadError = true;
      this.fireEvent("fileUploadError", this, file, error, message);

    }
  }
    // the default SWFupload config
    ,getSwfConfig:function() {
        return {
          //flash_url:"/apps/swfuploader/static/swfupload.swf"
	  flash_url:"swfupload.swf"
          ,movieName:"easy-swf-upload"
          ,upload_url:this.uploadUrl
          ,file_post_name:"Filedata"
          ,file_size_limit:this.maxFileSize
          ,file_types:this.allowedFilesTypes
          ,file_upload_limit:this.maxFiles
          ,file_queue_limit:this.maxFiles
          ,button_window_mode:Ext.isChrome?'window':'transparent'
          ,debug:false
          ,post_params:{}
          ,button_placeholder_id:"swf-item"
          ,file_dialog_complete_handler:this.dialogComplete.createDelegate(this)
          ,file_queue_error_handler:this.fileQueueError.createDelegate(this)
          ,upload_progress_handler:this.fileUploadProgress.createDelegate(this)
          ,upload_error_handler:this.fileUploadError.createDelegate(this)
          ,upload_start_handler:this.fileUploadStart.createDelegate(this)
          ,upload_complete_handler:this.fileUploadComplete.createDelegate(this)
          ,queue_complete_handler:this.fileQueueComplete.createDelegate(this)
          ,swfupload_loaded_handler:this.swfuploadLoaded.createDelegate(this)
          ,file_dialog_start_handler:this.dialogOpen.createDelegate(this)
        };
      }
});




