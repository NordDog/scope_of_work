/* 
*  function complexBatch
*  using Bitrix24 REST API
*  @param 	 mixed commands: Array or Object of REST methods
*  @param function callback: a Callback function for handling REST result; getting param: an object with result
*  @param  boolean	   sync: Sync or Async Batch calling
*  @param  boolean getCount: Boolean param for getting rows count
*  @return  object  results: An object with all results. Keys of object is (key + "_n"), where n = 0 ... infinity, step 1
*  usage:
*  BX24.complexBatch({
*	deals:['crm.deal.list',{select:["ID"]}],
*	leads:['crm.lead.list',{}]
*  });
*/

/* 
*  function syncBatch
*  using Bitrix24 REST API
*  @param   array commands: Array of objects of REST methods for BX24.callBatch calling
*  @param boolean	  sync: Sync or Async Batch calling
*/

if(window.BX24) {
	window.BX24.complexBatch = function(commands, callback, sync = true, getCount = true) {
		// Step 0: check params
		if(!(commands && typeof commands === "object")) {
			return undefined;
		} else {
			if(Array.isArray(commands) && !commands.length) return undefined;
		}
		// Step 1: transform @commands into array of objects like {key: method, ...}
		var commandsArray = [],
			count = 0,
			batch = {};
			
		if(Array.isArray(commands)) {
			commands.forEach(function(command){
				batch[count++] = command;
				if(count % 50 == 0) {
					commandsArray.push(batch);
					batch = {};
				}
			});
			if(count % 50 != 0) commandsArray.push(batch);
		} else {
			for(var key in commands) {
				batch[key] = commands[key];
				if(++count % 50 == 0) {
					commandsArray.push(batch);
					batch = {};
				}
			}
			if(count % 50 != 0) commandsArray.push(batch);
		}
		// Step 2: get rows count
		if(getCount) {
			BX24.syncBatch(commandsArray, true, function(res){
				var commandsArrayWithCount = [],
					commandsWithCount = {},
					completeCommands = {};
				count = 0;
				
				for(var key in res) {
					var i = 0;
					if(res[key].more()) {
						completeCommands[key + "_" + i++] = res[key];
						do {
							commandsWithCount[key + "_" + i] = [res[key].query.method, {...res[key].query.params,...{start:i*50}}];
							if(++count % 50 == 0) {
								commandsArrayWithCount.push(commandsWithCount);
								commandsWithCount = {};
							}
						} while(++i*50 < res[key].total())
					} else {
						completeCommands[key + "_" + i] = res[key];
					}
				}
				if(count % 50 != 0) commandsArrayWithCount.push(commandsWithCount);
				if(commandsArrayWithCount.length) BX24.syncBatch(commandsArrayWithCount, sync, callback, completeCommands);
				else if(callback && typeof callback === "function" && !BX24.isEmptyObject(completeCommands)) callback(completeCommands);
			});
		} else {
			BX24.syncBatch(commandsArray, sync, callback);
		}
	}

	window.BX24.syncBatch = function(commands, sync = false, callback, data = {}) {
		if(sync) {
			BX24.callBatch(commands[0], function(res){
				for(var command in commands[0]) {
					if(commands[0][command][1] && typeof commands[0][command][1] == "object") res[command].query.params = commands[0][command][1];
					else res[command].query.params = {};
				}
				data = { ...data, ...res };
				if(commands[1]) BX24.syncBatch(commands.slice(1), sync, callback, data);
				else if(callback && typeof callback === "function" && !BX24.isEmptyObject(data)) callback(data);
			});
		} else {
			commands.forEach(function(command) {
				BX24.callBatch(command, function(res) {
					if(callback && typeof callback === "function") callback(res);
				});
			});
			if(callback && typeof callback === "function" && !BX24.isEmptyObject(data)) callback(data);
		}
	}
	
	window.BX24.isEmptyObject = function(obj) {
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop)) return false;
		}
		return JSON.stringify(obj) === JSON.stringify({});
	}
}