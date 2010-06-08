/*
** Ext.ux.upload.Html5Connector.js for Ext.ux.upload.Html5Connector
**
** Made by Gary van Woerkens
** Contact <gary@chewam.com>
**
** Started on  Fri Jun  4 19:02:46 2010 Gary van Woerkens
** Last update Wed Jun  9 00:47:18 2010 Gary van Woerkens
*/

Ext.ns('Ext.ux.upload');

/**
 * @class Ext.ux.upload.Html5Connector
 * @extends Ext.util.Observable
 * A simple class which handles native browser drag and grop events and upload files
 * with help of {@link Ext.Ajax#request Ajax request}.
 * @author Gary van Woerkens
 * @version 1.0
 */

/**
 * Create a new SWFUpload connector
 * @constructor
 * @param {Object} config The config object
 */
Ext.ux.upload.Html5Connector = function(config) {

  Ext.apply(this, config);

  this.addEvents(
    /**
     * @event dragstart Fires when a file is draged over the window's body.
     * @param {Ext.ux.upload.Html5Connector} this
     */
    "dragstart"
    /**
     * @event drastop Fires when a file is draged out the window's body.
     * @param {Ext.ux.upload.Html5Connector} this
     */
    ,"dragstop"
    /**
     * @event beforeupload Fires on files drop,
     * after check of {Ext.ux.upload.Html5Connector#maxFiles maxFiles}.
     * @param {Ext.ux.upload.Html5Connector} this
     * @param {Number} selectedFilesCount
     */
    ,"beforeupload"
    /**
     * @event init Fires on files drop.
     * TO DELETE ?
     * @param {Ext.ux.upload.Html5Connector} this
     */
    ,"init"
    /**
     * @event progress Fires when file upload progress
     * @param {Ext.ux.upload.Html5Connector} this
     * @param {Object} file
     * @param {Number} loaded The file loading percentage<br/>
     * It must a decimal value greater than 0 and less than 1
     */
    ,"progress"
        /**
     * @event error Fires on upload error.
     * @param {Ext.ux.upload.Html5Connector} this
     * @param {Object} file
     * @param {String} msg The error message
     */
    ,"error"
    /**
     * @event complete Fires when file upload is over
     * @param {Ext.ux.upload.Html5Connector} this
     * @param {Object} file
     */
    ,"complete"


  );

  Ext.ux.upload.Html5Connector.superclass.constructor.call(this);

  this.init();

};

Ext.extend(Ext.ux.upload.Html5Connector, Ext.util.Observable, {

  /**
   * @cfg String url
   * The URL where files will be uploaded.
   */
  url:""
  /**
   * @cfg Number maxFiles
   * Maximum number of files to upload in a row.
   */
  ,maxFiles:5
  /**
   * @cfg Number maxFileSize
   * Maximum size of a file to upload.
   */
  ,maxFileSize:1024 // KB
  /**
   * @cfg String allowedFileTypes
   * all types of file that can be uploaded
   * (e.g., "*.png;*.jpg;*.gif").<br/>
   * To allow all types of file to be uploaded use "*.*".
   */
  ,allowedFileTypes:"*.*"
  /**
   * @cfg Boolean enableHighlight
   * True to enable highlight of drop zone on Component over.
   */
  ,enableHighlight:true
  /**
   * @cfg Boolean enableGlobalHighlight
   * True to enable highlight drop zone on window over.
   */
  ,enableGlobalHighlight:true

  /**
   * The {@link Ext.Element} which handles drag and drop events.
   * @type {Ext.Element}
   * @property el
   */

  // private
  ,init:function() {
    this.setGlobalHighlight();
    this.el.on({
      scope:this
      ,dragover:function(e) {
	e.stopPropagation();
	e.preventDefault();
	if (!Ext.isGecko) { // prevents drop in FF ;-(
	  e.browserEvent.dataTransfer.dropEffect = 'copy';
	}
	if (this.enableHighlight)
	  this.el.addClass("x-uploader-dragover");
	return;
      }
      ,dragleave:function(e) {
	e.stopPropagation();
	e.preventDefault();
	if (this.enableHighlight)
	  this.el.removeClass("x-uploader-dragover");
	return;
      }
      ,drop:this.onFilesDrop
    });
  }

  // private
  ,setGlobalHighlight:function() {
    if (this.enableGlobalHighlight) {
      Ext.getBody().on({
	scope:this
	,dragover:function(e) {
	  e.stopPropagation();
	  e.preventDefault();
	  if (!Ext.isGecko) { // prevents drop in FF ;-(
	    e.browserEvent.dataTransfer.dropEffect = 'copy';
	  }
	  this.el.addClass("x-uploader-dragover");
	  return;
	}
	,dragleave:function(e) {
	  e.stopPropagation();
	  e.preventDefault();
	  this.el.removeClass("x-uploader-dragover");
	  return;
	}
      });
    }
  }

  // private
  ,onFilesDrop:function(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.browserEvent.dataTransfer.files;
    if (
      files && files.length &&
      this.fireEvent("beforeupload", this, files.length) !== false
    ) {
      this.uploadFiles(files);
    }
  }

  /**
   * Checks number of files to upload ({@link Ext.ux.upload.Html5Connector#maxFiles maxFiles})
   * and loop on each file to upload.
   * @param {Array} files Array of file objects.
   */
  ,uploadFiles:function(files) {
    var tooManyFiles = files.length > this.maxFiles;
    if (tooManyFiles && this.maxFiles)
      this.onUploadError(null, "trop de fichiers envoyés simultanément (max:"+this.maxFiles+")");
    else Ext.each(files, this.uploadFile, this);
  }

  /**
   * Checks allowed file types and file size before upload it whit help
   * of {@link Ext.Ajax#request Ajax request}.
   * @param {Object} file The file to upload.
   */
  ,uploadFile:function(file) {
    file.id = Ext.id();
    if (!this.isAllowedFileType(file.name))
      this.onUploadError(file, "type de fichier incorrect");
    else if (!this.isAllowedFileSize(file.size))
      this.onUploadError(file, "taille limite atteinte (max:"+this.maxFileSize+" KB)");
    else {
      var xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("loadstart", this.onUploadStart.createDelegate(this, [file], 0), false);
      xhr.onreadystatechange = this.onUploadLoad.createDelegate(this, [file, xhr], 0);
      xhr.upload.addEventListener("error", this.onUploadError.createDelegate(this, [file], 0), false);
      xhr.upload.addEventListener("progress", this.onUploadProgress.createDelegate(this, [file], 0), false);
      xhr.open("POST", this.url , true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('X-File-Name', file.name);
      xhr.setRequestHeader('X-File-Size', file.size);
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhr.send(file);
    }
  }

  /**
   * Returns true if file size is smaller than {@link Ext.ux.upload.Html5Connector#maxFiles maxFiles}.
   * @param {Number} size The file size.
   * @return {Boolean}
   */
  ,isAllowedFileSize:function(size) {
    return !this.maxFileSize || ((size / 1000) / this.maxFileSize) <= 1;
  }

  /**
   * Returns true if file type is allowed as
   * specified in {@link Ext.ux.upload.Html5Connector#allowedFileTypes allowedFileTypes}.
   * @param {String} name The file name.
   * @return {Boolean}
   */
  ,isAllowedFileType:function(name) {
    var allowedTypes = this.getAllowedTypesReg(this.allowedFileTypes);
    return allowedTypes ? allowedTypes.test(name) : true;
  }

  /**
   * Returns the RegExp based on {@link Ext.ux.upload.Html5Connector#allowedFileTypes allowedFileTypes}
   * to test the file extension.
   * @param {String} types The allowed file types definition.
   * @return {Object} RegExp
   */
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

  ,onUploadStart:function(file, e) {
    this.fireEvent("start", this, file);
  }

  ,onUploadProgress:function(file, e) {
    this.fireEvent("progress", this, file, e.loaded/e.total);
  }

  ,onUploadLoad:function(file, request, e) {
    if (request.readyState === 4) {
      if (request.status === 500)
	this.fireEvent("error", this, file, "erreur serveur");
      else if (request.status === 404)
	this.fireEvent("error", this, file, "serveur injoignable");
      else if (request.status === 200) {
	this.fireEvent("complete", this, file, e.loaded/e.total);
      }
    }
  }

  ,onUploadError:function(file, msg) {
    this.fireEvent("error", this, file, msg);
  }

});