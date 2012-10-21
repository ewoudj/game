var helpers = {
	rotate : function(point, center, angle) {
		// convert angle to radians
		angle = angle * Math.PI / 180.0;
		// get coordinates relative to center
		var dx = (point.x - center.x);
		var dy = point.y - center.y;
		// calculate angle and distance
		var a = Math.atan2(dy, dx);
		var dist = Math.sqrt(dx * dx + dy * dy);
		// calculate new angle
		var a2 = a + angle;
		// calculate new coordinates
		var dx2 = Math.cos(a2) * dist;
		var dy2 = Math.sin(a2) * dist;
		// return coordinates relative to top left corner
		// return { x: Math.ceil(dx2 + center.x), y: Math.ceil(dy2 + center.y) };
		return { x: (dx2 * 1.4) + center.x, y: dy2 + center.y };
	},
	
	distance : function(pointA, pointB){
		return Math.sqrt(Math.pow(pointA.x - pointB.x, 2 ) + Math.pow(pointA.y - pointB.y, 2));
	},
	
	ceilPoint : function(point){
		return {
			x: Math.ceil(point.x),
			y: Math.ceil(point.y)
		};
	},
	
	apply : function(source, target){
		if(source && target){
			for(var s in source){
				target[s] = source[s];
			}
		}
		return target;
	},
	
	rectInRect :function(offsetA, rectA, offsetB, rectB){
		if(offsetA && rectA && offsetB && rectB){
			var tl = {x: rectA.x + offsetA.x, y: rectA.y + offsetA.y};
			var tr = {x: rectA.x + rectA.w + offsetA.x, y: rectA.y + offsetA.y};
			var bl = {x: rectA.x + offsetA.x, y: rectA.y + rectA.h + offsetA.y};
			var br = {x: rectA.x + rectA.w + offsetA.x, y: rectA.y + rectA.h + offsetA.y};
			return (
				helpers.pointInRect(tl ,offsetB, rectB) ||
				helpers.pointInRect(tr ,offsetB, rectB) ||
				helpers.pointInRect(bl ,offsetB, rectB) ||
				helpers.pointInRect(br ,offsetB, rectB)
			);
		}
		return false;
	},
	
	pointInRect : function(point, offset, rect){
		return (point.x >= (rect.x + offset.x) && point.x <= (rect.x + offset.x + rect.w) &&
				point.y >= (rect.y + offset.y) && point.y <= (rect.y + offset.y + rect.h));
	}
};

if(typeof(exports) !== 'undefined'){
	exports.helpers = helpers;
}