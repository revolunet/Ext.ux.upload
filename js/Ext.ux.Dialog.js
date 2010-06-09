/*
** Ext.ux.Dialog.js for Ext.ux.Dialog
**
** Made by Gary van Woerkens
** Contact <gary@chewam.com>
**
** Started on  Wed Jun  9 01:47:49 2010 Gary van Woerkens
** Last update Wed Jun  9 01:48:34 2010 Gary van Woerkens
*/

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
