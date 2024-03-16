var domain_url = 'https://karlovasispiti.azurewebsites.net/';
var username;
var password;
var remember_user;
remember_user=false;

var user_session;
var userid;
var house_in_view;

var user_location_x;
var user_location_y;


const property = {
	id: 0,
	owner_id: 1,
	category: 2,
	x: 3,
	y: 4,
	title: 5,
	address: 6,
	details: 7,
	image: 8,
	thumbnail: 9,
	date: 10,
	email: 11,
	owner: 12,
	avg_rating: 13,
	user_rating: 14
}
const house_categories = {
	0:"Γκαρσονιέρα",
	1:"Δυάρι",
	2:"Τριάρι",
	3:"Μεζονέτα",
	4:"Άλλο"
}
var houses=[];
var map;
function fetchhouses(){
	var  data="username="+username+"&session="+user_session;
	$.ajax({
		url: domain_url+'fetch.php',
		data: data,
		type: 'post',
		async: 'true',
		beforeSend: function() {
			while(houses.length > 0)
				houses.pop();
			$.mobile.loading('show', {theme:"b", text:"Please wait...", textonly:true, textVisible: true}); // This will show ajax spinner
		},
		complete: function() {
			$.mobile.loading('hide');
			
		},
		success: function (result) {
			if(result.status) {
				houses = [];
				house_objects = result.houses;
				for(var i=0; i<house_objects.length; i++)
				{
					var house_object = [parseInt(house_objects[i].id),
								parseInt(house_objects[i].owner_id),
								parseInt(house_objects[i].category),
								parseFloat(house_objects[i].x),
								parseFloat(house_objects[i].y),
								house_objects[i].title,
								house_objects[i].address,
								house_objects[i].details,
								house_objects[i].imagefile,
								house_objects[i].thumbfile,
								
								house_objects[i].date,
								house_objects[i].email,
								house_objects[i].owner,
								parseFloat(house_objects[i].avg_rating),
								parseInt(house_objects[i].user_rating)];
					houses.push(house_object);
				}
				if(map)
				{
					for(var i=0; i<houses.length; i++){
						var houseIcon = L.Icon.extend({
							options: {
								iconUrl: 'images/Home-512.png',
								iconSize:     [50, 50],
								iconAnchor: [25, 25]
							}
						});
						var ic = new houseIcon();
						var placemark = new L.Marker(new L.LatLng(houses[i][property.x], houses[i][property.y]), {icon: ic}).bindPopup(getPopup(i));
						placemark.addTo(map);
					}
				}
			} else {
				alert(result.message);
				$.mobile.changePage("#login_screen");
				location.reload();
			}
		},
		error: function (xhr, status, error) {
			alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
			$.mobile.changePage("#login_screen");
			location.reload();
		}
	});
}


function house_details(i){
	house_in_view = i;
	$.mobile.changePage("#house_screen");
	
	
}

function getPopup(pi)
{
	var id=houses[pi][property.id];
	var category=houses[pi][property.category];
	var x=houses[pi][property.x];
	var y=houses[pi][property.y];
	var title=houses[pi][property.title];
	var address=houses[pi][property.address];
	var thumbnail=houses[pi][property.thumbnail];
	var details=houses[pi][property.details];
	var finalstring="<a onclick=\"house_details("+pi+");\"><div>"+
					"<h1>"+house_categories[category]+"</h1>"+
					"<h1>"+title+"</h1>";
					
					
	if(thumbnail)
		finalstring+="<img src=\""+domain_url+thumbnail+"\">";
	finalstring+="<h1>Διεύθυνση: "+address+"</h1><h1>Λεπτομέρειες:</h1><p>"+details+"</p>";
	finalstring+="</div></a>";
	return finalstring;
}
function createmap(){
	map = L.map('mapid');
	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
		attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
		tileSize: 512,
		maxZoom: 15,
		zoomOffset: -1,
		id: 'mapbox/dark-v10',
		accessToken: 'pk.eyJ1IjoiaWNzZDE1MTAxIiwiYSI6ImNqcDBpOGlhdjJ2c2gzcGxrZnpycXlkaGIifQ.xUGN-mwjGqF6DqB-48YEsQ'
	}).addTo(map);
	var customOptions =
    {
        'maxWidth': '500',
        'className' : 'custom'
    }
	map.on('locationfound', function (e) {
		var radius = e.accuracy / 2;
		radius=Math.min(radius, 800);
		radius=Math.max(radius, 200);
		var m = L.marker(e.latlng).addTo(map)
		m
		.bindPopup("<h1>You are standing here: (accuracy: "+radius+"m)</h1>").openPopup();
	 
		L.circle(e.latlng, radius).addTo(map);
	});
	
	map.invalidateSize();
	map.locate({
		setView: true,
		maxZoom: 18,
		enableHighAccuracy: true,
		maximumAge: 60000
	}); 
	fetchhouses();
}
$(document).ready(function () {
	if(localStorage.getItem('remember')=='true')
	{
		$("#rememberbox").click();
		$("#username").val(localStorage.getItem('username'));
		$("#password").val(localStorage.getItem('password'));
		remember_user=true;
	}
	$("#login_form").on('submit', function(){
		setUserValues();
		var data = "username="+username+"&password="+password;
		$.ajax({
			url: domain_url+'login.php',
			data: data,
			type: 'post',
			async: 'true',
			beforeSend: function() {$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true});},
			complete: function() { $.mobile.loading('hide'); },
			success: function (result) {
				if(result.status) {
					update_inventory();
					document.getElementById("username_header").innerHTML="Χρήστης: "+username;
					$.mobile.changePage("#main_screen");
					user_session=result.session;
					userid = result.id;
				} else {
					alert('Authentication failed: '+result.message);
					localStorage.setItem('remember', 'false');
					location.reload();
				}
			},
			error: function (xhr, status, error) {
				alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
				$.mobile.changePage("#login_screen");
				location.reload();
			}
		});
		return false;
	});
	$("#register_link").on('click', function() {
		$.mobile.changePage("#register_screen");
	});
	$("#register_form").on('submit', function(){
		var reg_username=$("#register_username").val();
		var reg_password=$("#register_password").val();
		var reg_password2=$("#register_password2").val();
		var reg_realname=$( "#register_realname").val();
		var reg_lastname=$( "#register_lastname").val();
		var reg_email=$( "#register_email").val();
		var data = "username="+reg_username+"&password="+reg_password+"&password2="+reg_password2+"&name="+reg_realname+"&lastname="+reg_lastname+"&email="+reg_email;
		$.ajax({
			url: domain_url+'register.php',
			data: data,
			type: 'post',
			async: 'true',
			beforeSend: function() {$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true});},
			complete: function() { $.mobile.loading('hide'); },
			success: function (result) {
				if(result.status) {
					alert('Registered successfuly!');
					$.mobile.changePage("#login_screen");
					localStorage.setItem('remember', 'false');
					location.reload();
				} else {
					alert(result.message);
				}
			},
			error: function (xhr, status, error) {
				alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
				$.mobile.changePage("#login_screen");
				location.reload();
			}
		});
		return false;
	});
	function logout() {
		var  data="username="+username+"&session="+user_session;
		$.ajax({
			url: domain_url+'logout.php',
			data: data,
			type: 'post',
			async: 'true',
			beforeSend: function() {
				// This callback function will trigger before data is sent
				$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true}); // This will show ajax spinner
			},
			complete: function() {
				// This callback function will trigger on data sent/received complete
				$.mobile.loading('hide'); // This will hide ajax spinner
				$.mobile.changePage("#login_screen");
				location.reload();
			},
			success: function (result) {
				if(result.status) {
					
				} else {
					alert(result.message);
				}
			},
			error: function (xhr, status, error) {
				alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
				$.mobile.changePage("#login_screen");
				location.reload();
			}
		});
	}
	$("#logout").on('click', logout);
	$("#report_form").on('submit', function(){
		var dat = new FormData(this);
		dat.append('x', user_location_x);
		dat.append('y', user_location_y);
		dat.append('session', user_session);
		dat.append('username', username);
		$.ajax({
			url: domain_url+'create.php',
			data: dat,
			type: 'post',
			contentType: false,
			processData: false,
			async: 'true',
			
			beforeSend: function() {$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true});},
			complete: function() { $.mobile.loading('hide'); },
			success: function (result) {
				if(result.status) {
					$("#preview").hide();
					document.getElementById("report_form").reset();
					$.mobile.changePage("#main_screen");
					fetchhouses();
				} else {
					$.mobile.changePage("#login_screen");
					location.reload();
				}
			},
			error: function (xhr, status, error) {
				alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
				$.mobile.changePage("#login_screen");
				location.reload();
			}
		});
		return false;
	});
	$("#preview").hide();
	document.getElementById("file").onchange = function () {
		var reader = new FileReader();

		reader.onload = function (e) {
			// get loaded data and render thumbnail.
			document.getElementById("preview").src = e.target.result;
			$("#preview").show();
		};

		// read the image file as a data URL.
		reader.readAsDataURL(this.files[0]);
	};
	user_location_x=user_location_y=0;
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(setPosition);
	} else { 
		location_label.innerHTML = "Geolocation is not supported by this browser.";
		user_location_x='0';
		user_location_y='0';
	}
	function setPosition(position) {
		user_location_x = position.coords.latitude; 
		user_location_y = position.coords.longitude;
		
	}
	function setUserValues() {
		if($("#rememberbox").prop('checked'))
			remember_user = true;
		else
			remember_user = false;
		username = $("#username").val();
		password = $("#password").val();
	}
	function update_inventory() {
		if(remember_user){
			localStorage.setItem('username', username);
			localStorage.setItem('password', password);
			localStorage.setItem('remember', 'true');
		}
		else
		{
			localStorage.setItem('username', '');
			localStorage.setItem('password', '');
			localStorage.setItem('remember', 'false');
		}
	}
	function rate(rating, house_id){
		var  data="username="+username+"&session="+user_session+"&rating="+rating+"&ad="+house_id;
		$.ajax({
			url: domain_url+'rate.php',
			data: data,
			type: 'post',
			async: 'true',
			beforeSend: function() {
				// This callback function will trigger before data is sent
				$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true}); // This will show ajax spinner
			},
			complete: function() {
				// This callback function will trigger on data sent/received complete
				$.mobile.loading('hide'); // This will hide ajax spinner
			},
			success: function (result) {
				if(result.status) {
					fetchhouses();
				} else {
					alert(result.message);
					$.mobile.changePage("#login_screen");
					location.reload();
				}
			},
			error: function (xhr, status, error) {
				alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
				$.mobile.changePage("#login_screen");
				location.reload();
			}
		});
	}
	function deletehouse(house_id){
		var  data="username="+username+"&session="+user_session+"&ad="+house_id;
		$.ajax({
			url: domain_url+'delete.php',
			data: data,
			type: 'post',
			async: 'true',
			beforeSend: function() {
				// This callback function will trigger before data is sent
				$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true}); // This will show ajax spinner
			},
			complete: function() {
				// This callback function will trigger on data sent/received complete
				$.mobile.loading('hide'); // This will hide ajax spinner
			},
			success: function (result) {
				if(result.status) {
					fetchhouses();
				} else {
					alert(result.message);
					$.mobile.changePage("#login_screen");
					location.reload();
				}
			},
			error: function (xhr, status, error) {
				alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
				$.mobile.changePage("#login_screen");
				location.reload();
			}
		});
	}
	function house_to_html(i) {
		var text = "<li class=\"pointlist\"><a onclick=\"house_details("+i+")\">";
		if(houses[i][property.thumbnail])
			text+="<img class=\"listthumb\" src=\""+domain_url+houses[i][property.thumbnail]+"\">";
		text+="<h2>"+houses[i][property.title]+"</h2>"+
						"<p>Κατηγορία: "+house_categories[houses[i][property.category]]+"</p>"+
						"<p>Διεύθυνση: "+houses[i][property.address]+"</p>"+
						"<p>Βαθμολογία: "+houses[i][property.avg_rating]+"</p>"+
						"<p>Λεπτομέρειες: "+houses[i][property.details]+"</p>"+
						"<p>Ιδιοκτήτης: "+houses[i][property.owner]+", "+houses[i][property.email]+"</p>"+
						"<p>Ημερομηνία: "+houses[i][property.date]+"</p>"+
						"</a></li>";
		return text;
	}
	function makelist(){
		$('#house_list').empty();
		for(var i=0; i<houses.length; i++)
			$('#house_list').append(house_to_html(i));
		$('#house_list').listview("refresh");
	}
	function makemylist(){
		$('#my_list').empty();
		for(var i=0; i<houses.length; i++){
			if(houses[i][property.owner_id]==userid){
				$('#my_list').append(house_to_html(i));
			}
		}
		$('#my_list').listview("refresh");
	}
	function view_house(){
		var i = house_in_view;
		if(i>=houses.length || !houses[i]){
			logout();
			return;
		}
		document.getElementById("house_title").innerHTML=houses[i][property.title];
		document.getElementById("house_details").innerHTML=houses[i][property.details];
		document.getElementById("house_address").innerHTML=houses[i][property.address];
		document.getElementById("house_category").innerHTML=house_categories[houses[i][property.category]];
		document.getElementById("house_date").innerHTML=houses[i][property.date];
		document.getElementById("house_rating").innerHTML="Γενική βαθμολογία: "+houses[i][property.avg_rating];
		document.getElementById("owner_email").innerHTML=houses[i][property.email];
		document.getElementById("house_owner").innerHTML=houses[i][property.owner];
		document.getElementById("user_rate").value=houses[i][property.user_rating];
		$("#user_rate").slider('refresh');
		if(houses[i][property.image])
		{
			document.getElementById("house_image").src=domain_url+houses[i][property.image];
			$("#house_image").show();
		}
		else
			$("#house_image").hide();
		if(houses[i][property.owner_id]==userid)
			$("#delete").show();
		else
			$("#delete").hide();
		$( "#user_rate").on('slidestop', function( event ) {
			var slider_value=$("#user_rate").slider().val();
			rate(slider_value, houses[i][property.id]);
		});
	}
	$("#main_screen").on('pageshow', fetchhouses);
	$("#map_screen").on('pageshow', createmap);
	$("#map_screen").on('pagehide', function(event){
		map.remove();
		map=null;
	});
	$("#list_screen").on('pageshow', makelist);
	$("#my_screen").on('pageshow', makemylist);
	$("#house_screen").on('pageshow', view_house);
	$( document ).bind( "mobileinit", function(){
		$.mobile.page.prototype.options.degradeInputs.date = true;
	});
	$("#delete").click(function (e) {
		deletehouse(houses[house_in_view][property.id]);
		fetchhouses();
		$.mobile.changePage("#main_screen");
	});
	$('.numbersOnly').keyup(function () { 
		this.value = this.value.replace(/[^0-9\.]/g,'');
	});
});

 

 
