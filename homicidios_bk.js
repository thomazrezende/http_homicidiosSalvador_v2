// JavaScript Document

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

var map; 
var map_canvas = document.getElementById("map-canvas");
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

var dur = 250;

var filtro_idade = null;
var idade_ini = null;
var idade_fim = null;

var filtro_sexo = null;
var filtro_bairro = null;
var filtro_bairro_ant = null;

// objetos  
var select_sexo; 

var limpar_local;
var limpar_data;
var limpar_sexo;
var limpar_idade;

var titulo_painel_bairros;
var titulo_painel_vitimas;

var bairro_mais;
var bairro_mais_ico;  
var lista_bairros_sc;
var lista_bairros; 

var vitimas_mais;
var vitimas_mais_ico;  
var lista_vitimas_sc;
var lista_vitimas; 

var dado1;
var dado2;
var dado3;
var dado4;
var dado5;

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
 
window.onload = function(){

	var script = document.createElement('script');
	script.type = 'text/javascript'; 
	script.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&callback=loadMap';
	document.body.appendChild(script);   

	titulo_painel_bairros = document.getElementById("titulo_painel_bairros");
	titulo_painel_vitimas = document.getElementById("titulo_painel_vitimas");

	select_sexo = document.getElementById("select_sexo");

	// limpar 
	limpar_bairro = document.getElementById("limpar_bairro"); 
	limpar_data = document.getElementById("limpar_data"); 
	limpar_sexo = document.getElementById("limpar_sexo"); 
	limpar_idade = document.getElementById("limpar_idade"); 
	
	limpar_bairro.onclick = function (){ limpar("bairro")};
	limpar_data.onclick = function (){ limpar("data")};
	limpar_sexo.onclick = function (){ limpar("sexo")};
	limpar_idade.onclick = function (){ limpar("idade")};
	
	//listas
	bairro_mais = document.getElementById("bairro_mais"); 
	bairro_mais_ico = document.getElementById("bairro_mais_ico");  
	
	lista_bairros_sc = document.getElementById("lista_bairros_sc");
	lista_bairros = document.getElementById("lista_bairros");
	lista_bairros.aberta = false;
	
	vitimas_mais = document.getElementById("vitimas_mais"); 
	vitimas_mais_ico = document.getElementById("vitimas_mais_ico");  
	
	lista_vitimas_sc = document.getElementById("lista_vitimas_sc");
	lista_vitimas = document.getElementById("lista_vitimas");
	lista_vitimas.aberta = false;  
	  
	// filtros 
	select_sexo.onchange = function(){ 
		if( this.value == "A" ){ 
			limpar("sexo"); 
		}else{ 
			filtrar("sexo", this.value);   
		}
	}  
	  
} 

function loadMap() {  
	
	centro_ini = new google.maps.LatLng(-12.85, -38.45); 
	centro_at = new google.maps.LatLng(-12.85, -38.45); 
		
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
	
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions); 
	
	google.maps.event.addListener(map, 'dragstart', function() { 
		// function onDrag
	});
	
	google.maps.event.addListener(map, 'dragend', function() {  
		centro_at = map.getCenter();
		console.log(centro_at)
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
	
	//////////////////// listas
	
	//bairros
	
	function abrir_lista_bairros(){ 
		if(lista_bairros.aberta){
			lista_bairros.aberta = false;	
			bairro_mais_ico.src = "layout/icone_mais.png";
			lista_bairros.style.borderRight = "18px #fafafa solid";
			$(lista_bairros_sc).animate( { height:"0%" }, 250, "easeInOutQuart", function(){ $(lista_bairros_sc).hide() });
		}else{
			lista_bairros.aberta = true;	
			bairro_mais_ico.src = "layout/icone_menos.png";
			$(lista_bairros_sc).show();
			lista_bairros.style.borderRight = "18px #fafafa solid";
			$(lista_bairros_sc).animate( { height:"87.5%" },250,"easeInOutQuart", function (){ lista_bairros.style.borderRight = ""; });
		} 
	}
	
	bairro_mais.onclick = abrir_lista_bairros;
	titulo_painel_bairros.onclick = abrir_lista_bairros;
	
	// vitimas
	
	function abrir_lista_vitimas(){ 
		if(lista_vitimas.aberta){
			lista_vitimas.aberta = false;	
			vitimas_mais_ico.src = "layout/icone_mais.png";
			$(lista_vitimas_sc).animate( { height:"0%" }, 250, "easeInOutQuart", function(){ $(lista_vitimas_sc).hide() });
		}else{
			lista_vitimas.aberta = true;	
			vitimas_mais_ico.src = "layout/icone_menos.png";
			$(lista_vitimas_sc).show();
			$(lista_vitimas).hide();
			$(lista_vitimas_sc).animate( { height:"87.5%" },250,"easeInOutQuart", function (){ $(lista_vitimas).show();  });
		} 
	}
	
	vitimas_mais.onclick = abrir_lista_vitimas;
	titulo_painel_vitimas.onclick = abrir_lista_vitimas;
	
	//////////////////// bairros  
	
	var bubble;
	var bairro;
	var itm_lista;
	
	var bairro_ico = {
		url:'layout/bairro_ico.png',
		anchor: new google.maps.Point(2,2)
	}
	
	for(i=0; i<bairros.length; i++){
	
		bairro = new google.maps.Marker ({
			position:new google.maps.LatLng( bairros[i].lat, bairros[i].lng ),
			map:map,
			icon:bairro_ico,
			optimized: false,
			zIndex:9 
		});   
	
		bubble = new google.maps.Marker({
			position:new google.maps.LatLng( bairros[i].lat, bairros[i].lng ),
			map:map,
			icon: circulo(max_bubble,0,branco,.3),
			optimized: true,
			zIndex:10
		});
		
		bubble.pos = new google.maps.LatLng( bairros[i].lat, bairros[i].lng );
		bairro.pos = new google.maps.LatLng( bairros[i].lat, bairros[i].lng ); 
		
		bubble.ID = i;
		bubble.nome = bairros[i].nome; 
		bairro.ID = i;
		
		google.maps.event.addListener( bubble,'click',function() {   
			if(filtro_bairro != this.ID){
				filtrar("bairro",this.ID);
			}else{
				limpar("bairro");
			}  
		}); 
		
		google.maps.event.addListener( bairro,'click',function() {
			if(filtro_bairro != this.ID){
				filtrar("bairro",this.ID);
			}else{
				limpar("bairro");
			} 
		}); 
		
		// lista 
		itm = document.createElement("div");
		itm.ID = i;
		itm.className = "itm";
		
		dado1 = document.createElement("div");
		dado1.innerHTML =  bairros[i].nome;
		dado1.className = "dado1";
		
		dado2 = document.createElement("div");
		dado2.className = "itm_barra";
		dado2.style.width = "0%";
		itm.barra = dado2;
		
		dado4 = document.createElement("div");
		dado4.className = "itm_barra_path"; 
		
		dado3 = document.createElement("div");
		dado3.className = "itm_valor_lb dadof";
		itm.valor_lb = dado3;
		
		itm.appendChild(dado1);
		itm.appendChild(dado4);
		itm.appendChild(dado2);
		itm.appendChild(dado3);
		lista_bairros.appendChild(itm);
		
		///cria ref associativa
		bairros["bairro"+i] = bairros[i];
		bairros[i].bubble = bubble;
		bairros[i].itm = itm;
		bairros[i].valor = 0;
				
		itm.onclick = function(){
			
			if(filtro_bairro != this.ID){
				filtrar("bairro",this.ID);
			}else{
				limpar("bairro");
			}  
				
		}
		  
	} 
	
	
	//////// testes
	
	/*
	var teste_arr = [
	 { n:1, nome:"n0"},
	 { n:7, nome:"n1"},
	 { n:7, nome:"n2"},
	 { n:8, nome:"n3"},
	 { n:2, nome:"n4"},
	 { n:6, nome:"n5"}];
	
	teste_arr["n0"] = teste_arr[0];
	teste_arr["n1"] = teste_arr[1];
	teste_arr["n2"] = teste_arr[2];
	teste_arr["n3"] = teste_arr[3];
	teste_arr["n4"] = teste_arr[4];
	teste_arr["n5"] = teste_arr[5];
	
	titulo.onclick = function(){
		console.log(teste_arr); 
		ordenar(teste_arr,"n","nome"); 
		console.log(teste_arr);
		console.log(teste_arr["n5"]); //6
		console.log(teste_arr[5]);  //8
		teste_arr["n3"]["nome"] = "thomaz";
		console.log(teste_arr[5]); 
		
	}
	*/  
		
	/////////////////// chamar xml  
	var myRequest;
	var vitima;
	
	if(window.XMLHttpRequest){ 
		myRequest = new XMLHttpRequest();
	}else if(window.ActiveXObject){ 
		myRequest = new ActiveXObject("Microsoft.XMLHTTP");
	} 
	
	myRequest.onreadystatechange = function(){  
		if(this.readyState === 4){  
			vitimas = xml2arr ( this.responseXML, "vitima", ["id","nome","idade","sexo","local","bairro","dia","mes","ano"] );
			
			TOTAL = vitimas.length; 
			
			//monta datas
			for(i=0; i<TOTAL; i++){ 
				vitima = vitimas[i];
				vitima.data = new Date(vitima.ano, vitima.mes-1, vitima.dia); 
				
				itm = document.createElement("div");
				itm.className = "itm";
				itm.ID = vitima.id;
				
				var dado1 = document.createElement("div");
				var dado2 = document.createElement("div");
				var dado3 = document.createElement("div");
				var dado4 = document.createElement("div");
				var dado5 = document.createElement("div");
				
				dado1.innerHTML = vitima.nome;
				dado2.innerHTML = vitima.sexo;
				
				dado3.innerHTML = vitima.idade;
				if( vitima.idade != "–"){
					dado3.innerHTML +=" anos";
					if( !idade_ini || Number(vitima.idade) < idade_ini) idade_ini = Number(vitima.idade);
					if( !idade_fim || Number(vitima.idade) > idade_fim) idade_fim = Number(vitima.idade);  
				}
					
				dado4.innerHTML = one2nine(vitima.dia) + "/" + one2nine(vitima.mes) + "/" + vitima.ano;
				dado5.innerHTML = bairros[vitima.bairro].nome;
				
				dado1.className = "dado1";
				dado2.className = "dado2";
				dado3.className = "dado3";
				dado4.className = "dado4";
				dado5.className = "dado5";
				
				itm.appendChild(dado1);
				itm.appendChild(dado2);
				itm.appendChild(dado3);
				itm.appendChild(dado4);
				itm.appendChild(dado5);
			
				vitima.itm = itm;
				lista_vitimas.appendChild(itm);
				
			}
			
			/////////////////// charts
			
			//  data chart 
			
			chart_data = d3.select('#chart_data')
				.append('g')
				.attr('fill',vermelho);
				 
			for(i=0; i<9; i++){
				
				svgw += barw + bard;
				
				chart_data
					.attr('width',svgw)
				.append('rect')
					.attr('id', meses[i] + '2014')
					.attr('width', barw )
					.attr('height', 0 )
					.attr('y', svgh )
					.attr('x', (i-1)*(barw + bard)) 
			} 
			
			chart_data				
				.attr('transform', 'translate('+ ( 250 - Math.round(svgw/2)) +' 0)')
				.append('text')
					.text( 2014 )
					.attr('font-size','10px')
					.attr('transform', 'translate(0 ' + svgh + ')')
					.attr('fill',preto); 
				 
	
			//  idade chart
			  
			chart_idade = d3.select('#chart_idade')
				.append('g')
				.attr('fill',vermelho);
			
			svgw = 0;
				 
			for(i=idade_ini; i<=idade_fim; i++){  
				
				svgw += barw + bard;
				
				chart_idade
					.attr( 'width', svgw )
					.append( 'rect' )
					.attr( 'id', 'idade' + i )
					.attr( 'width', barw )
					.attr( 'height', 0 )
					.attr( 'y', svgh )
					.attr( 'x', i*( barw + bard ))  
					
				if(i%10 == 0){ 
					chart_idade.append('text')
						.text(i)
						.attr('font-size','10px')
						.attr('text-anchor','middle')
						.attr('transform', 'translate(' + i*(barw + bard) + ' ' + svgh + ')')
						.attr('fill',preto); 
				} 
				
				chart_idade
					.attr('transform', 'translate('+ ( 250 - Math.round(svgw/2)) +' 0)')
					
			}
			
			// sexo chart   
						
			g_F = d3.select('#g_F')
				.attr('fill', cor_f)
				.attr('transform', 'translate(250 80)');	 
		
			g_M = d3.select('#g_M')
				.attr('fill', cor_m)
				.attr('transform', 'translate(250 80)');
				
			g_F.append('path')
					.attr('id','pie_F')
					.attr('stroke',"#fff")
					.attr('stroke-width',2) 
					.attr('class','slice')
			
			g_M.append('path')
					.attr('id','pie_M')
					.attr('stroke',"#fff")
					.attr('stroke-width',2) 
					.attr('class','slice')
			
			g_F.append('text')
				.text('8%')
				.attr('id','pct_F') 
				.attr('font-size','36px')
				.attr('font-weight','700')
				.attr('text-anchor','end')
				.attr('transform', 'translate(-130 0)') 
				
			g_M.append('text')
				.text('92%')
				.attr('id','pct_M') 
				.attr('font-size','36px')
				.attr('font-weight','700')
				.attr('transform', 'translate(130 0)') 
				
			g_F.append('text')
				.text('209 MULHERES')
				.attr('id','num_F')  
				.attr('font-size','12px')
				.attr('font-weight','400')
				.attr('text-anchor','end')
				.attr('transform', 'translate(-130 -40)') 
				
			g_M.append('text')
				.text('1329 HOMENS')
				.attr('id','num_M') 
				.attr('font-size','12px')
				.attr('font-weight','400')
				.attr('transform', 'translate(130 -40)') 
			
			///////////////////  iniciar
			
			gerar_graficos(); 
		}
	}   
	
	var rand = Math.random() * 1000;
	myRequest.open("GET", "dados.xml?rand="+rand, true);
	myRequest.send(null); 

} 

///////////// funcoes ///////////////// 

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

	function ponteiro_att(xml, ID, att){  
		if( xml[ID] ){
			return xml[ID].getAttribute(att); 
		}
	}   
	
	function xml2arr(_xml, obj_lb, atts){ // converte xml em arr assoc com objetos
		//atts: array com identificadores das variaveis
				
		//converter xml em array associativo
		var arr = [];
		var id;
		var obj;
		var xml = _xml.getElementsByTagName(obj_lb); 
		
		//montar objetos e inserir no array
		for(var i=0; i<xml.length; i++){ 
				
			obj = {};
			id = ponteiro_att(xml,i,"id");
			
			for(var a=0; a<atts.length; a++){  
				obj[atts[a]] = ponteiro_att(xml,i,atts[a]);
			} 
			 
			//para que ambos funcionem (associativo e index):
			// inserir o obj duas vezes:  
			arr.push(obj);  // 1o com push (soma index); 
			arr[obj_lb + id] = obj; // 2o com string (não soma index); 
		}
		
		return arr; 
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
	
	function limpar(ref){
	
		switch(ref){
		
			case "bairro": 
				filtro_bairro_ant = null;
				filtro_bairro = null;
				$(limpar_bairro).hide();				
				map.panTo(centro_ini); 
				map.setZoom(min_zoom); 
			break;
			
			case "sexo":
				filtro_sexo = null;
				d3.select("#g_F").attr("fill", cor_f);
				d3.select("#g_M").attr("fill", cor_m); 
				$(limpar_sexo).hide();
				select_sexo.value = "A";
			break;
			
		}
		
		gerar_graficos();
		
	}
	
	function gerar_graficos(){ 
		
		for(i=0; i<bairros.length; i++){
			bairros[i].valor = 0;
		}
		
		total = 0;
		
		var d_ini = new Date(data_ini[2], data_ini[1]-1, data_ini[0]);
		var d_fim = new Date(data_fim[2], data_fim[1]-1, data_fim[0]);  
		
		d_idade = [];
		d_data = {};
		d_sexo = [0,0];
		
		// soma vitimas
		for(i=0; i<TOTAL; i++){
			
			vitima = vitimas[i];
			$(vitima.itm).hide();
			vitima.idade = Number(vitima.idade);
			
			if( vitima.data >= d_ini && vitima.data <= d_fim ){
			if( !filtro_idade || vitima.idade >= idade_ini && vitima.idade <= idade_fim ){   
			if(	!filtro_sexo || vitima.sexo == filtro_sexo ){ 
				
				// bairro independente do filtro
				bairros[ "bairro" + vitima.bairro ].valor++;
				total++;
			
			if( filtro_bairro == null || ( filtro_bairro != null && vitima.bairro == filtro_bairro ) ){ 
				
				//idade
				if(d_idade[vitima.idade] == null) d_idade[vitima.idade] = 1;
				else d_idade[vitima.idade]++;
								
				//sexo
				if( vitima.sexo == "F") d_sexo[0] ++;
				if( vitima.sexo == "M") d_sexo[1] ++;
				
				//data
				if( d_data[ meses[vitima.mes] + vitima.ano ] == null ) d_data[ meses[vitima.mes] + vitima.ano ] = 1;
				else d_data[ meses[vitima.mes] + vitima.ano ]++; 
			 
				$(vitima.itm).show(); 
				
			}}}}
		} 
		
		var escala_max;
		
		if(!filtro_bairro){
			escala_max = 300;
			
			esc1_idade.innerHTML = '– 300';
			esc2_idade.innerHTML = '– 150';
			
			esc1_data.innerHTML = '– 300';
			esc2_data.innerHTML = '– 150';
			
		}else{
			escala_max = 40;
			
			esc1_idade.innerHTML = '– 40';
			esc2_idade.innerHTML = '– 20';
			
			esc1_data.innerHTML = '– 40';
			esc2_data.innerHTML = '– 20';
		}
		 
		//alimenta chart idade
		for(i=0; i<idade_fim; i++){  
			if(d_idade[i]){
				
				/*
				if(filtro_bairro){
					d3.select("#idade"+i) 
					.attr('y', svgh - d_idade[i]*10 - 15 )
					.attr('height', d_idade[i]*10)
				}else{*/
						
					var h_idade = svgh/escala_max*d_idade[i];
					
					d3.select("#idade"+i)
						.attr('y', svgh - h_idade - 15 )
						.attr('height', h_idade )
				//}
				
				
			} else {
				d3.select("#idade"+i) 
					.attr('y', svgh - 15 )
					.attr('height', 0)
			}
		}
		
		//alimenta chart data
		for(a=0; a<anos.length; a++){  
			for(i=1; i<=meses.length; i++){
				
				var vitimas_data = d_data[ meses[i] + anos[a] ];
				 /* nesse exemplo: 300 vitimas = 100% da altura do grafico*/
				var h_data = svgh/escala_max*vitimas_data;
				
				if( vitimas_data ){
					d3.select( "#" + meses[i] + anos[a] )
						.attr('y', svgh - h_data - 15 )
						.attr('height', h_data )
				}else{
					d3.select( "#" + meses[i] + anos[a] )
						.attr('y', svgh - 15 )
						.attr('height', 0)
				}
			} 
		} 
		
		//alimenta chart sexo 
		
		if(d_sexo[0] > 0 || d_sexo[1] > 0){
			d3.selectAll('.slice').data( pie(d_sexo) )
			.attr('d', arc) 
		}  
		
		d3.select('#pct_F').text( pct_sexo( 0 ));
		d3.select('#pct_M').text( pct_sexo( 1 )); 
		
		d3.select('#num_F').text( pessoas('f', d_sexo[0]) );
		d3.select('#num_M').text( pessoas('m', d_sexo[1]) );
		
		//ordenar
		ordenar( bairros, "valor", "nome" );
		 
		//bairros
		for(i=0; i<bairros.length; i++){  
		
			bubble = bairros[i].bubble; 
			itm = bairros[i].itm; 
			val = bairros[i].valor;  
			
			if( filtro_bairro == bairros[i].ID ){
				
				titulo_painel_bairros.innerHTML = bairros["bairro"+filtro_bairro].nome;	
				titulo_painel_vitimas.innerHTML = val + " V&Iacute;TIMAS";	  
				
				bubble.setIcon( circulo( max_bubble, val*max_bubble/max_val, vermelho, .3 )); 
				itm.style.color = vermelho;
				itm.barra.style.background = vermelho;
				itm.valor_lb.style.color = vermelho;  
				
			}else{
				
				if( filtro_bairro != null ){ 
					bubble.setIcon( circulo(max_bubble, val*max_bubble/max_val, branco, .3) );
					itm.style.color = cinza;
					itm.barra.style.background = cinza;
					itm.valor_lb.style.color = cinza;  
				}else{
					bubble.setIcon( circulo( max_bubble, val*max_bubble/max_val, vermelho, .3 )); 
					itm.style.color = "";
					itm.barra.style.background = vermelho;
					itm.valor_lb.style.color = vermelho;
				}
			}   
			
			// valores lista bairros
			itm.valor_lb.innerHTML = val; 
			itm.valor_lb.innerHTML += " &nbsp;[" + decimal(val/total* 100,2,",") + "%]"; 
			itm.barra.style.width = val/TOTAL * 90 + "%";
			
			//coloca na ordem 
			lista_bairros.appendChild(itm);
			
		} 
		
		// zoom 
		if( filtro_bairro != null ){ 
			zoom_bubble( bairros["bairro" + filtro_bairro].bubble );  
		}else{  
			titulo_painel_bairros.innerHTML = "TODAS AS LOCALIDADES";	 
			titulo_painel_vitimas.innerHTML = total + " V&Iacute;TIMAS"; 
		}  
	
	
	
	} 
	  
	
	
	//////////////// dados /////////////////// 
 
bairros = [
{ nome:"ABAETÉ", ID:0, lat:-12.945112, lng:-38.357254},
{ nome:"ACUPE DE BROTAS", ID:1, lat:-12.994033, lng:-38.49419},
{ nome:"AEROPORTO", ID:2, lat:-12.911098, lng:-38.331241},
{ nome:"ÁGUAS CLARAS", ID:3, lat:-12.889934, lng:-38.442838},
{ nome:"ÁGUAS DE MENINOS", ID:4, lat:-12.897862, lng:-38.428056},
{ nome:"ALTO DA TEREZINHA", ID:5, lat:-12.884567, lng:-38.477764},
{ nome:"ALTO DO CABRITO", ID:6, lat:-12.909068, lng:-38.476003},
{ nome:"ALTO DO COQUEIRINHO/KM 17", ID:7, lat:-12.918848, lng:-38.363032},
{ nome:"ALTO DO PERU", ID:8, lat:-12.937885, lng:-38.488934},
{ nome:"AQUIDABÃ", ID:9, lat:-12.968173, lng:-38.50396},
{ nome:"ARENOSO", ID:10, lat:-12.948013, lng:-38.444242},
{ nome:"AVENIDA ACM", ID:11, lat:-12.959236, lng:-38.450891},
{ nome:"AVENIDA GAL COSTA", ID:12, lat:-12.928481, lng:-38.439679},
{ nome:"AVENIDA LUIS EDUARDO MAGALHÃES", ID:13, lat:-12.960243, lng:-38.461059},
{ nome:"BAIRRO DA PAZ", ID:14, lat:-12.92896, lng:-38.377967},
{ nome:"BAIXA DE QUINTAS", ID:15, lat:-12.96297, lng:-38.492503},
{ nome:"BAIXA DO FISCAL", ID:16, lat:-12.939346, lng:-38.494912},
{ nome:"BAIXA DOS SAPATEIROS", ID:17, lat:-12.968891, lng:-38.504073},
{ nome:"BARBALHO", ID:18, lat:-12.966025, lng:-38.501417},
{ nome:"BARRA", ID:19, lat:-13.00846, lng:-38.52401},
{ nome:"BARREIRAS", ID:20, lat:-12.941676, lng:-38.458875},
{ nome:"BARRIS", ID:21, lat:-12.985615, lng:-38.51521},
{ nome:"BARROQUINHA", ID:22, lat:-12.977043, lng:-38.51324},
{ nome:"BARROS REIS", ID:23, lat:-12.9555, lng:-38.475629},
{ nome:"BOA VISTA DE BROTAS", ID:24, lat:-12.982653, lng:-38.499864},
{ nome:"BOA VISTA DO LOBATO", ID:25, lat:-12.909144, lng:-38.472326},
{ nome:"BOCA DA MATA", ID:26, lat:-12.88136, lng:-38.408349},
{ nome:"BOCA DO RIO", ID:27, lat:-12.977738, lng:-38.429119},
{ nome:"BOIADEIRO", ID:28, lat:-12.890021, lng:-38.431378},
{ nome:"BOM JUÁ", ID:29, lat:-12.941154, lng:-38.472104},
{ nome:"BONFIM", ID:30, lat:-12.925188, lng:-38.507328},
{ nome:"BONOCO", ID:31, lat:-12.980096, lng:-38.48619},
{ nome:"BR 324", ID:32, lat:-12.934984, lng:-38.476476},
{ nome:"BROTAS", ID:33, lat:-12.985761, lng:-38.499816},
{ nome:"CABULA", ID:34, lat:-12.958058, lng:-38.469838},
{ nome:"CAIXA D´ÁGUA", ID:35, lat:-12.958781, lng:-38.492795},
{ nome:"CAJAZEIRAS", ID:36, lat:-12.89936, lng:-38.407927},
{ nome:"CALABETÃO", ID:37, lat:-12.929889, lng:-38.468053},
{ nome:"CALÇADA", ID:38, lat:-12.94486, lng:-38.500103},
{ nome:"CAMAÇARI", ID:39, lat:-12.697178, lng:-38.333198},
{ nome:"CAMINHO DAS ÁRVORES", ID:40, lat:-12.977854, lng:-38.460552},
{ nome:"CAMINHO DE AREIA", ID:41, lat:-12.924059, lng:-38.507217},
{ nome:"CAMPINAS DE BROTAS", ID:42, lat:-12.982335, lng:-38.477132},
{ nome:"CAMPINAS DE PIRAJÁ", ID:43, lat:-12.916752, lng:-38.468266},
{ nome:"CANABRAVA", ID:44, lat:-12.924559, lng:-38.420217},
{ nome:"CANDEAL", ID:45, lat:-12.992122, lng:-38.48251},
{ nome:"CANDEIAS", ID:46, lat:-12.672012, lng:-38.547504},
{ nome:"CASSANGE", ID:47, lat:-12.902481, lng:-38.372613},
{ nome:"CASTELO BRANCO", ID:48, lat:-12.902289, lng:-38.428646},
{ nome:"CENTRO", ID:49, lat:-12.97604, lng:-38.513233},
{ nome:"CIDADE NOVA", ID:50, lat:-12.964492, lng:-38.486306},
{ nome:"COMÉRCIO", ID:51, lat:-12.972266, lng:-38.509956},
{ nome:"COSME DE FARIAS", ID:52, lat:-12.98005, lng:-38.489614},
{ nome:"COSTA AZUL", ID:53, lat:-12.994551, lng:-38.44479},
{ nome:"COUTOS", ID:54, lat:-12.855739, lng:-38.464477},
{ nome:"CURUZU", ID:55, lat:-12.943095, lng:-38.486306},
{ nome:"DIAS D'ÁVILA", ID:56, lat:-12.619196, lng:-38.292995},
{ nome:"DOIS LEÕES", ID:57, lat:-12.965689, lng:-38.462168},
{ nome:"DOM AVELAR", ID:58, lat:-12.900755, lng:-38.448905},
{ nome:"DORON", ID:59, lat:-12.963092, lng:-38.438477},
{ nome:"ENGENHO VELHO DA FEDERAÇÃO", ID:60, lat:-13.003439, lng:-38.499787},
{ nome:"ENGENHO VELHO DE BROTAS", ID:61, lat:-12.988372, lng:-38.497532},
{ nome:"ESTAÇÃO PIRAJÁ", ID:62, lat:-12.922606, lng:-38.468941},
{ nome:"ESTRADA DAS BARREIRAS", ID:63, lat:-12.947487, lng:-38.454546},
{ nome:"ESTRADA DO CIA", ID:64, lat:-12.856467, lng:-38.362693},
{ nome:"ESTRADA DO COCO", ID:65, lat:-12.878513, lng:-38.31072},
{ nome:"ESTRADA VELHA DO AEROPORTO", ID:66, lat:-12.916511, lng:-38.430439},
{ nome:"ESTRADA VELHA DO CABRITO", ID:67, lat:-12.917135, lng:-38.461502},
{ nome:"FAZENDA GRANDE DO RETIRO", ID:68, lat:-12.943291, lng:-38.476825},
{ nome:"FAZENDA GRANDE I", ID:69, lat:-12.890189, lng:-38.40115},
{ nome:"FAZENDA GRANDE II", ID:70, lat:-12.912608, lng:-38.406972},
{ nome:"FAZENDA GRANDE III", ID:71, lat:-12.901158, lng:-38.394539},
{ nome:"FAZENDA GRANDE IV", ID:72, lat:-12.905193, lng:-38.388109},
{ nome:"FEDERAÇÃO", ID:73, lat:-12.993802, lng:-38.5077},
{ nome:"GARCIA", ID:74, lat:-12.990828, lng:-38.512583},
{ nome:"HORTO FLORESTAL", ID:75, lat:-13.001605, lng:-38.488277},
{ nome:"IAPI", ID:76, lat:-12.956351, lng:-38.478421},
{ nome:"IGUATEMI", ID:77, lat:-12.851773, lng:-38.45929},
{ nome:"ILHA AMARELA", ID:78, lat:-12.890708, lng:-38.473164},
{ nome:"IMBUI", ID:79, lat:-12.96892, lng:-38.439281},
{ nome:"ITACARANHA", ID:80, lat:-12.888891, lng:-38.483678},
{ nome:"ITAPARICA", ID:81, lat:-12.893653, lng:-38.680304},
{ nome:"ITAPUÃ", ID:82, lat:-12.946715, lng:-38.374547},
{ nome:"JAQUEIRA DO CARNEIRO", ID:83, lat:-12.947943, lng:-38.473719},
{ nome:"JARDIM CAJAZEIRAS", ID:84, lat:-12.91619, lng:-38.449502},
{ nome:"JARDIM CRUZEIRO", ID:85, lat:-12.92776, lng:-38.501922},
{ nome:"JARDIM DAS MARGARIDAS", ID:86, lat:-12.901622, lng:-38.354768},
{ nome:"JARDIM NOVA ESPERANÇA", ID:87, lat:-12.912135, lng:-38.417939},
{ nome:"JARDIM SANTO INÁCIO", ID:88, lat:-12.920521, lng:-38.463493},
{ nome:"LAPINHA", ID:89, lat:-12.897351, lng:-38.461302},
{ nome:"LARGO DO TAMARINEIRO", ID:90, lat:-12.959, lng:-38.488925},
{ nome:"LARGO DO TANQUE", ID:91, lat:-12.939841, lng:-38.490265},
{ nome:"LAURO DE FREITAS", ID:92, lat:-12.882058, lng:-38.31482},
{ nome:"LIBERDADE", ID:93, lat:-12.949607, lng:-38.496526},
{ nome:"LOBATO", ID:94, lat:-12.917552, lng:-38.479995},
{ nome:"LUIZ ANSELMO", ID:95, lat:-12.975901, lng:-38.485649},
{ nome:"MADRE DE DEUS", ID:96, lat:-12.74128, lng:-38.621188},
{ nome:"MARECHAL RONDON", ID:97, lat:-12.910747, lng:-38.467197},
{ nome:"MASSARANDUBA", ID:98, lat:-12.926302, lng:-38.497475},
{ nome:"MATA DE SAO JOAO", ID:99, lat:-12.531131, lng:-38.301248},
{ nome:"MATA ESCURA", ID:100, lat:-12.934932, lng:-38.461626},
{ nome:"MONTE SERRAT", ID:101, lat:-12.927132, lng:-38.51324},
{ nome:"MUSSURUNGA", ID:102, lat:-12.916982, lng:-38.365063},
{ nome:"NARANDIBA", ID:103, lat:-12.955084, lng:-38.449112},
{ nome:"NAZARÉ", ID:104, lat:-12.976952, lng:-38.502818},
{ nome:"NOVA BRASILIA", ID:105, lat:-12.91762, lng:-38.411315},
{ nome:"NOVA SUSSUARANA", ID:106, lat:-12.952322, lng:-38.467022},
{ nome:"OGUNJÁ", ID:107, lat:-12.986013, lng:-38.49782},
{ nome:"PALESTINA", ID:108, lat:-12.864585, lng:-38.417939},
{ nome:"PARALELA", ID:109, lat:-12.957254, lng:-38.42965},
{ nome:"PARIPE", ID:110, lat:-12.825031, lng:-38.471802},
{ nome:"PARQUE SÃO BARTOLOMEU", ID:111, lat:-12.896002, lng:-38.469807},
{ nome:"PAU DA LIMA", ID:112, lat:-12.923778, lng:-38.446872},
{ nome:"PAU MIÚDO", ID:113, lat:-12.960645, lng:-38.477741},
{ nome:"PELOURINHO", ID:114, lat:-12.972209, lng:-38.508435},
{ nome:"PERIPERI", ID:115, lat:-12.866874, lng:-38.477261},
{ nome:"PERNAMBUÉS", ID:116, lat:-12.971174, lng:-38.460292},
{ nome:"PERO VAZ", ID:117, lat:-12.952148, lng:-38.488934},
{ nome:"PIATÃ", ID:118, lat:-12.948226, lng:-38.384025},
{ nome:"PIRAJÁ", ID:119, lat:-12.903494, lng:-38.456766},
{ nome:"PITUAÇU", ID:120, lat:-12.968432, lng:-38.41129},
{ nome:"PITUBA", ID:121, lat:-13.002544, lng:-38.456692},
{ nome:"PLATAFORMA", ID:122, lat:-12.893971, lng:-38.48353},
{ nome:"POJUCA", ID:123, lat:-12.427629, lng:-38.327933},
{ nome:"PORTO SECO PIRAJÁ", ID:124, lat:-12.910058, lng:-38.458853},
{ nome:"PRAIA GRANDE", ID:125, lat:-12.873623, lng:-38.475793},
{ nome:"RETIRO", ID:126, lat:-12.951306, lng:-38.476},
{ nome:"RIBEIRA", ID:127, lat:-12.919426, lng:-38.499446},
{ nome:"RIO SENA", ID:128, lat:-12.879904, lng:-38.478699},
{ nome:"RIO VERMELHO", ID:129, lat:-13.009468, lng:-38.493854},
{ nome:"RODOVIÁRIA", ID:130, lat:-12.976032, lng:-38.466622},
{ nome:"ROMA", ID:131, lat:-12.93348, lng:-38.504044},
{ nome:"SABOEIRO", ID:132, lat:-12.959711, lng:-38.444612},
{ nome:"SAN MARTIN", ID:133, lat:-12.924949, lng:-38.442066},
{ nome:"SANTA LUZIA DO LOBATO", ID:134, lat:-12.936005, lng:-38.490826},
{ nome:"SANTA MÔNICA", ID:135, lat:-12.948306, lng:-38.483678},
{ nome:"SANTO ANTÔNIO ALÉM DO CARMO", ID:136, lat:-12.9635, lng:-38.504056},
{ nome:"SÃO CAETANO", ID:137, lat:-12.930959, lng:-38.473831},
{ nome:"SÃO CRISTOVÃO", ID:138, lat:-12.910763, lng:-38.348362},
{ nome:"SAO FRANCISCO DO CONDE", ID:139, lat:-12.618791, lng:-38.678954},
{ nome:"SÃO GONÇALO DO RETIRO", ID:140, lat:-12.954441, lng:-38.464189},
{ nome:"SÃO JOÃO DO CABRITO", ID:141, lat:-12.905173, lng:-38.478614},
{ nome:"SÃO MARCOS", ID:142, lat:-12.928061, lng:-38.433717},
{ nome:"SÃO RAFAEL", ID:143, lat:-12.928219, lng:-38.430307},
{ nome:"SÃO SEBASTIÃO DO PASSÉ", ID:144, lat:-12.512709, lng:-38.490864},
{ nome:"SARAMANDAIA", ID:145, lat:-12.875583, lng:-38.471552},
{ nome:"SAUDE", ID:146, lat:-12.972472, lng:-38.505358},
{ nome:"SETE DE ABRIL", ID:147, lat:-12.916946, lng:-38.434998},
{ nome:"SETE PORTAS", ID:148, lat:-12.969894, lng:-38.49936},
{ nome:"SIEIRO", ID:149, lat:-12.951865, lng:-38.497575},
{ nome:"SIMOES FILHO", ID:150, lat:-12.787034, lng:-38.403295},
{ nome:"STELLA MARIS", ID:151, lat:-12.939594, lng:-38.341599},
{ nome:"SUSSUARANA", ID:152, lat:-12.934464, lng:-38.439668},
{ nome:"TANCREDO NEVES", ID:153, lat:-12.943831, lng:-38.449621},
{ nome:"TROBOGY", ID:154, lat:-12.934524, lng:-38.403754},
{ nome:"URUGUAI", ID:155, lat:-12.936903, lng:-38.494372},
{ nome:"VALÉRIA", ID:156, lat:-12.861519, lng:-38.433578},
{ nome:"VASCO DA GAMA", ID:157, lat:-12.992182, lng:-38.501498},
{ nome:"VERA CRUZ", ID:158, lat:-12.957293, lng:-38.615648},
{ nome:"VIA REGIONAL", ID:159, lat:-12.900262, lng:-38.432844},
{ nome:"VILA CANÁRIA", ID:160, lat:-12.910434, lng:-38.446562},
{ nome:"VILA LAURA", ID:161, lat:-12.970444, lng:-38.489662}];

 
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