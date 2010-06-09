Ext.ux.upload
====================

see docs folder for ExtJs style documentation

For the upload/flash to work, you need to host this on a http server !

**Features :**

 * html5 drag&drop (FF+Chrome)
 * [SWFupload][1] integration(IE/Chrome/FF)
 * simultaneous multiple file uploads
 * progressbars
 

**limitations :**

 * you cannot pass POST data while uploading :/



**server side infos :**

 * use raw post data for drag&drop files (eg: php input)
 * use standard request.FILES for SWFuploaded ones


**requirements**

 * [ExtJs][2] >= 3.2.1



  [1]: www.swfupload.org/
  [2]: http://wwww.extjs.com