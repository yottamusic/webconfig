	$(function(){
		var w = window.screen.width;
		var h =window.screen.height;
		if(w<h){
		var f = w/375 * 20;
		}else if(w>h){
		var f = 375/w * 20;
		}
		$('html').css('font-size',f);
	})