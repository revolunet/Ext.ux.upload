Ext.ux.UploadManager.js
====================

see demo.html

For the upload/flash to work, you need to host this on a http server !

**Features :**

 * html5 drag&drop (FF+Chrome)
 * [SWFupload][1] integration(IE/Chrome/FF)
 * simultaneous multiple file uploads
 * progressbars


**this panels hosts :**

 * queuePanel that display upload progress for n files
 * html5 droppable zone
 * SWFupload widget 

**todo :**

 * better integration
 * externalise panel+progressbars
 * dynamic setUploadUrl (pour fileBrowser)
 * swfupload click from menu : collapse menu on dialogComplete event
 * client side file and size limitation for drag&drop
 

**limitations :**

 * you cannot pass POST data while uploading :/
 * For Chrome+SWFupload, you need to create a sprite at the correct with the buttons states. this is due to the fact that the flash button must be ont top and visible for the click to work. Then set buttonImageUrl property to your SWFbutton. See provided sprites samples.


**server side infos :**

 * use raw post data for drag&drop files (eg: php input)
 * use standard request.FILES for SWFuploaded ones


**requirements**

 * [ExtJs][2] >= 3.1
 * Set correct ExtJs paths in demo.html


  [1]: www.swfupload.org/
  [2]: http://wwww.extjs.com