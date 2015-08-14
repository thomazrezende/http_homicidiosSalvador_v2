// JavaScript Document
window.onload = function(){  
	
	///////////////////////////////////////////////////////////////////////////////////////// VARS
	
	var centro_ini;
	var centro_at;
	var zoom_at;
	var i;
	var a; 
	var val;

	var branco = "#fff";	
	var preto = "#333";	
	var vermelho = "#c12b2b";
	var cinza = "#ccc"; 

	var cor_f = "#d23c3c";
	var cor_m = "#a52c2c";

	var vitimas;
	var max_val = 100; // valor maximo de vitimas para os graficos
	var max_bubble = 50; // valor maximo de raio para a bubble 

	var min_zoom = 11;
	var max_zoom = 16;
	var zoom_at; 

	var total; // total filtrado
	var TOTAL; // total absoluto

	var itm;
	   
	var data_ini = [1,1,2014];
	var data_fim = [31,12,2014];

	var anos = [2014];
	var meses = [null,'JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']; 
 
	var dur = 350, // default duration for animations
		in_out = "easeInOutQuart",
		_out = "easeOutQuart",
		in_ = "easeInQuart"; 
	
	var drop_fechado;
	var drop_h;

	var filtro_idade = null;
	var idade_ini = null;
	var idade_fim = null;

	var filtro_sexo = null;
	var filtro_bairro = null;
	var filtro_bairro_ant = null; 
	
	var map;
	var map_ok = false;
	
	// charts
	var chart_data;
	var chart_idade;
	var chart_sexo;   

	var d_idade = [];
	var d_data = {};
	var d_sexo = [0,0];

	var svgh = 120;
	var svgw = 0;
	var barw = 4;
	var bard = 1; 

	var g_M;
	var g_F;

	var pi = Math.PI;

	var pie = d3.layout.pie()
		.value( function(d){
			return d;
		}).startAngle(90 * (pi/180))
		  .endAngle(-90 * (pi/180));

	var arc = d3.svg.arc()
		.outerRadius(65)
		.innerRadius(40)
	
	
	///////////////////////////////////////////////////////////////////////////////////////// OBJETOS
	
	function get(id){ return document.getElementById(id)}
	function reg(id){ window[id] = get(id) }
	
	reg('campo_topo_esq');
	reg('topo');
	
	reg('logo');
	reg('drop_logo');
	logo.drop = drop_logo;
	drop_logo.aberto = false;
	logo.tipo = 'lista';
	
	reg('topo_local');
	reg('drop_local');
	topo_local.drop = drop_local;
	topo_local.aberto = false; 
	topo_local.tipo = 'lista';
	
	reg('topo_sexo_f');
	reg('topo_sexo_m');
	
	reg('campo_topo_dir');
	
	reg('topo_data');
	reg('drop_data');
	topo_data.drop = drop_data;
	topo_data.aberto = false;
	topo_data.tipo = 'range';
	
	reg('topo_idade'); 
	reg('drop_idade'); 
	topo_idade.drop = drop_idade;
	topo_idade.aberto = false; 
	topo_idade.tipo = 'range';
	
	topo.lista = [logo, topo_local, topo_data, topo_idade];  
	
	reg('telas');
	reg('tela1');
	reg('tela2');
	reg('tela3');
	reg('tela4');
	telas.lista = [null,tela1,tela2,tela3,tela4];
	
	reg('lista');
	reg('ico_lista');
	
	reg('map_canvas');
	reg('zoom_in');
	reg('zoom_out'); 
	
	reg('bt_vitimas'); 
	reg('logo_jmm');  
	
	
	/////////////////////////////////////////////////////////////////////////////////////////  FUNCOES 
 	 
	  
	// mobile //
	
	var mobile;
	var bt_event;
	var zoom_control;

	var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
		BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
		iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
		Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
		Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
		any: function() {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};

	if( isMobile.any() ){
		mobile = true; 
		zoom_control = false;
		bt_event = 'touchstart';
	}else{ 
		mobile = false; 
		zoom_control = true;
		bt_event = 'click';
	} 

	console.log( "MOBILE: " + mobile ); 
	
	// window funcs 
	
	function map_size(){ 
		google.maps.event.trigger( map, 'resize' ); 
		map.setZoom( map.getZoom() - 1 );
		map.setZoom( map.getZoom() + 1 );
	}  
	
	function resize(){    

		win_w = $( window ).width();
		win_h = $( window ).height();

		med_w = win_w/2;
		med_h = win_h/2;

		tela_h = win_h - 140;   
		$(telas).css({ height:tela_h })
		$(lista_vitimas).css({ height:tela_h - 30 })
		$('.vitima').css({ width:win_w });
		
		$(campo_topo_esq).css({ width:win_w/2 - 70 })
		$(campo_topo_dir).css({ width:win_w/2 - 70 })
		
		drop_fechado = -win_h + 280;
		drop_h = win_h - 210;   
		
		$('.bt_topo').each(function(){ 
			if( this.tipo == 'lista' ){
				$(this.drop).css({width:win_w/2 - 70, height: drop_h}); 
				if(!this.aberto){
					$(this.drop).css({ top: drop_fechado });
				}
			}else{
				$(this.drop).css({width:win_w/2 - 70}); 
				if(!this.aberto){
					$(this.drop).css({ top: 0 });
				}
			} 
		});
		
		if(map_ok) map_size(); 
	}
	
	resize();

	window.onresize = resize;

	
	// bts funcs
	
	for(i in topo.lista){
		$(topo.lista[i].drop).css({top:drop_fechado});
		$(topo.lista[i]).on(bt_event, function(){ 
			reset_drops(this);
			alternar_drop(this); 
		});
	}
	
	function alternar_drop(d){ 
		if(d.aberto){
			d.aberto = false;
			if(d.tipo=='lista') $(d.drop).animate({top:drop_fechado}, dur, in_out);
			else  $(d.drop).animate({top:0}, dur, in_out);
			$(d).removeClass('aberto');
		}else{
			d.aberto = true; 
			if(d.tipo=='lista') $(d.drop).animate({top:70}, dur, in_out);
			else $(d.drop).animate({top:70}, dur, in_out);  
			$(d).addClass('aberto'); 
		} 
	} 
	
	function reset_drops(ignore){ 
		for(i in topo.lista){ 
			if(topo.lista[i] != ignore && topo.lista[i].aberto) alternar_drop(topo.lista[i]) 
		}  
	}
	
	$(lista).on('mouseenter', function(){
		reset_drops(null);
	});
	
	$(telas).on('mouseenter', function(){
		reset_drops(null);
	});
	
	function one2nine(n){ 
		if(Number(n) < 10){
			return "0"+n;	
		}else{
			return n;	
		}
	}

	function decimal(num,casas,sep){ // sep define o tipo de separação . ou ,
		var nCasas = 1;
		for(var n=1;n<=casas;n++) {
			nCasas *= 10;
		}
		var valor = Math.round(num*nCasas)/nCasas;
		return decimalSep(valor,sep);
	}

	function decimalSep(num,sep){ 
		var numSt = num.toString();
		var indice = numSt.indexOf(".");
		if(indice != -1){
			var nDecimal = numSt.slice(indice+1,numSt.length);
			if(nDecimal == 0){
				numSt.slice(0, indice);
			}else{
				return numSt.slice(0, indice)+sep+numSt.slice(indice+1,numSt.length);
			}
		}else{
			return num;
		}
	} 

	function circulo(maximo, area, cor, opc){ 
		var raio_area = Math.sqrt(area/Math.PI);
		var raio_max = Math.sqrt(maximo/Math.PI); 
		var raio_fim = max_bubble * raio_area / raio_max;

		var circ = {
			path: google.maps.SymbolPath.CIRCLE,
			fillColor: cor,
			fillOpacity: opc,
			scale: raio_fim,
			strokeWeight: 0,
		} 
		return circ;			
	}    

	function pct_sexo(i){  
		var pct =  d_sexo[i] / ( d_sexo[0] + d_sexo[1] )*100; 
		if(isNaN(pct)) pct = 0;
		return decimal( pct ,1,"," ) + '%';
	}

	function pessoas( sexo, num ){ 
		if(sexo == "m"){
			if( num == 1) return num + ' HOMEM';
			else return num + ' HOMENS';	
		}else{
			if( num == 1) return num + ' MULHER';
			else return num + ' MULHERES';
		} 
	} 

	function ordenar(alvo,criterio1,criterio2){    
		alvo.sort(function (a, b) {
			if (a[criterio1] < b[criterio1])
			  return 1;
			if (a[criterio1] > b[criterio1])
			  return -1;
			if(a[criterio1] == b[criterio1]){ 
				if(criterio2 != null){
					if (a[criterio2] > b[criterio2])
					  return 1;
					if (a[criterio2] < b[criterio2])
				  return -1;
				}
				return 0;
			} 
		}); 
	} 

	function zoom_bubble(alvo){ 
		map.panTo(alvo.pos); 
		map.setZoom(13); 
	} 

	function filtrar(ref,val){

		switch(ref){

			case "bairro": 
				filtro_bairro_ant = filtro_bairro;
				filtro_bairro = val;
				$(limpar_bairro).show(); 
			break;	 

			case "sexo": 
				filtro_sexo = val; 
				$(limpar_sexo).show(); 

				if(val == "M"){ 
					d3.select("#g_F").attr("fill", cinza);
					d3.select("#g_M").attr("fill", vermelho); 
				}else{
					d3.select("#g_F").attr("fill", vermelho);
					d3.select("#g_M").attr("fill", cinza); 
				}

			break;	 

		} 

		gerar_graficos(); 

	}  
	
	///////////////////////////////////////////////////////////////////////////////////////// LOADDATA
	
	
	var bt_tela; 
	
	function loadData(){
	
		for(i=1; i<=4; i++){ 
			
			console.log(i)
			bt_tela = get( 'bt_tela' + i );
			console.log(bt_tela)
			bt_tela.ID = i;
			
			$(bt_tela).on( bt_event, function(){  
				for( i=1; i<telas.lista.length; i++ ){
					if(i <= this.ID) $(telas.lista[i]).animate({top:0}, dur, in_out);
					else $(telas.lista[i]).animate({top:tela_h + 70}, dur, in_out);
					
					bt_tela = get( 'bt_tela' + i );
					if(i != this.ID) $(bt_tela).removeClass('select'); 
				 	else  $(bt_tela).addClass('select'); 
				}  
			});
			
		}
		
		loadMap(); 
		
		$(bt_vitimas).on( bt_event, function(){   
			if(lista.aberto){ 
				lista.aberto = false;
				$(lista).animate({top:'100%'}, dur, in_out); 
				ico_lista.src = 'layout/ico_mais.png';
			}else{ 
				lista.aberto = true;
				$(lista).animate({top:140}, dur, in_out); 
				ico_lista.src = 'layout/ico_fechar.png';
			}  
		});
		
		
	}	// fim loadData 
	
	
	///////////////////////////////////////////////////////////////////////////////////////// LOADMAP
	
	function loadMap(){
	
		centro_ini = new google.maps.LatLng( -12.85, -38.45 ); 
		centro_at = new google.maps.LatLng( -12.85, -38.45 ); 

		var mapOptions = {
			center: centro_at,
			zoom: 11,
			mapTypeId: google.maps.MapTypeId.MAP,
			panControl:false,
			mapTypeControl:false,
			streetViewControl:false,
			scaleControl: true, 
			overviewMapControl:false,
			rotateControl:false, 
			zoomControl:false, 
			scaleControlOptions: {
				position: google.maps.ControlPosition.BOTTOM_LEFT
			}
		};  
		
		map = new google.maps.Map( map_canvas, mapOptions ); 

		google.maps.event.addListener( map, 'dragstart', function() { 
			// function onDrag
		});

		google.maps.event.addListener( map, 'dragend', function() {  
			centro_at = map.getCenter();
			//console.log(centro_at)
		});
		
		google.maps.event.addListener(map,'zoom_changed', function ()  {  
			zoom_at = map.getZoom(); 
			$( "#zoom_slider" ).slider( { value: zoom_at } );

			if(zoom_at > max_zoom) {
				map.setZoom(max_zoom);
				zoom_at = map.getZoom(); 
			}

			if(zoom_at < min_zoom) {
				map.setZoom(min_zoom);
				zoom_at = map.getZoom(); 
			}   
		}); 
		
		map_ok = true 
		
		///////////////// zoom 

		zoom_at = map.getZoom(); 

		$( "#zoom_slider" ).slider({ 
			 orientation: "vertical",
			  value:11,
			  min: min_zoom,
			  max: max_zoom,
			  step: 1, 
			  slide: function( event, ui ) {
				  map.setZoom(ui.value);
			  }
		});

		zoom_in.onclick = function(){
			if(zoom_at < max_zoom){
				map.setZoom(zoom_at+1);	
			}				
		} 

		zoom_out.onclick = function(){
			if(zoom_at > min_zoom){
				map.setZoom(zoom_at-1);
			}
		} 

		//////////////////// styles	

		map.setOptions({styles: styles});   
		
		
		resize();
		
	} // fim loadMap

	
	// map styles

	var styles = [
	  {
		"featureType": "water",
		"stylers": [
		  { "color": "#31414b" }
		]
	  },{
		"featureType": "landscape",
		"stylers": [
		  { "color": "#333333" }
		]
	  },{
		"featureType": "poi",
		"stylers": [
		  { "color": "#333333" }
		]
	  },{
		"featureType": "road",
		"elementType": "geometry",
		"stylers": [
		  { "visibility": "simplified" },
		  { "color": "#444444" }
		]
	  },{
		"elementType": "labels",
		"stylers": [
		  { "visibility": "simplified" },
		  { "color": "#999999" }
		]
	  },{	
		"elementType": "labels.icon",
		"stylers": [
		  { "visibility": "off" }
		]
	  },{
		"featureType": "transit",
		"stylers": [
		  { "visibility": "off" }
		]
	  }
	]
	
	//iniciar
	loadData();
	 
} // fim window.onload
