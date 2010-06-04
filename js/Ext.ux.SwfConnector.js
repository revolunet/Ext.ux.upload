/*
** Ext.ux.SwfConnector.js for Ext.ux.SwfConnector in /home/gary/www/dev/upload
**
** Made by Gary van Woerkens
** Contact   <gary@chewam.com>
**
** Started on  Fri Jun  4 19:03:44 2010 Gary van Woerkens
** Last update Fri Jun  4 19:14:43 2010 Gary van Woerkens
*/

Ext.ns('Ext.ux');

/**
 * @class Ext.ux.SwfConnector
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
