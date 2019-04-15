"use strict";
/*-----------------------------------------------------------------------------------------
												entity
-----------------------------------------------------------------------------------------*/
KBEngine.Avatar = KBEngine.Entity.extend(
{
	__init__ : function()
	{
		this._super();
    	KBEngine.DEBUG_MSG("Create Avatar " + this.id)
  	},
  		
	onEnterWorld : function()
	{		
		this._super();		
		KBEngine.DEBUG_MSG(this.className + '::onEnterWorld: ' + this.id); 
	},

	set_isAgent: function (old) {
		KBEngine.Event.fire("set_isAgent", this);
		cc.log("set isAgent " + old + " ---> " + this.isAgent);
	}
});


