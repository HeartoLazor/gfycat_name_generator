/**
//	Generate a random adjective + adjective + animal name based in gfycat format.
//	Supports custom animal placement and custom adjectives/animals.
//	Author: Hearto Lazor
//	License: MIT
**/
const GFY_CAT_ANIMALS = "http://assets.gfycat.com/animals"
const GFY_CAT_ADJETIVES = "http://assets.gfycat.com/adjectives"
const LOCAL_ANIMALS = "animals.txt"
const LOCAL_ADJECTIVES = "adjectives.txt"
const PROXY_CROSSORIGIN = "https://crossorigin.me/"
const PROXY_CORS_IO = "https://cors.io/?"
//Try to get the gfycat files using proxies to evade crossdomain, if all fails use a local copy
//WARNING: REMOVE THE GFYCAT URLS IN PRODUCTION, LEAVE THE LOCAL COPIES ONLY
var animal_url_list = [
	PROXY_CORS_IO + GFY_CAT_ANIMALS,
	PROXY_CROSSORIGIN + GFY_CAT_ANIMALS,
	LOCAL_ANIMALS
]
var adjective_url_list = [
	PROXY_CORS_IO + GFY_CAT_ADJETIVES,
	PROXY_CROSSORIGIN + GFY_CAT_ADJETIVES,
	LOCAL_ADJECTIVES
]

//bypass the $ inside another $ whining
var ajax_p = $.ajax
var animal_file = null
var adjective_file = null

$(document).ready(function() {
	var button = $('#generate_button')
	button.click(function() {
		generate_random_name()
	})
});

function ajax_animal_error(jqXHR, textStatus, errorThrown) {
	console.log("Error loading url: " + this.url)
	fill_next_animal_data()
}

function ajax_animal_success(file) {
	animal_file = file
	if(animal_file != null) {
		animal_file = animal_file.split('\n')
		fill_next_adjective_data()
	}
}

function ajax_adjective_error(jqXHR, textStatus, errorThrown) {
	console.log("Error loading url: " + this.url)
	fill_next_adjective_data()
}

function ajax_adjective_success(file) {
	// success
	adjective_file = file
	if(animal_file != null && adjective_file != null) {
		console.log("LOADED")
		adjective_file = adjective_file.split('\n')
		$('#generate_button').removeAttr("disabled");
		$('#generated_name').text("Press Generate!");
	}
}

var ajax_data = {
	type: 'GET',
	dataType: "text", 
	timeout: 5000,
}

function fill_next_animal_data() {
	if(animal_url_list.length > 0) {
		ajax_data.url = animal_url_list.shift()
		ajax_data.success = ajax_animal_success
		ajax_data.error = ajax_animal_error
		ajax_p(ajax_data)
	}
}

function fill_next_adjective_data() {
	if(adjective_url_list.length > 0) {
		ajax_data.url = adjective_url_list.shift()
		ajax_data.success = ajax_adjective_success
		ajax_data.error = ajax_adjective_error
		ajax_p(ajax_data)
	}
}

function generate_random_name() {
	if(animal_file != null && adjective_file != null) {
		var adjectives = get_adjectives()
		var animals = get_animals()
		var first_adjective = capitalize_first(adjectives[random_int(0, adjectives.length)]);
		var second_adjective = capitalize_first(adjectives[random_int(0, adjectives.length)]);
		var animal = capitalize_first(animals[random_int(0, animals.length)]);
		
		var animal_order = $('#animal_order').val()
		switch(animal_order) {
			case "0":
				$('#generated_name').text(animal + " " + first_adjective + " " + second_adjective);
				break;
			case "1":
				$('#generated_name').text(first_adjective + " " + animal + " " + second_adjective);
				break;
			case "2":
				$('#generated_name').text(first_adjective + " " + second_adjective + " " + animal);
				break;
			default:
				console.log("invalid animal order")
		}
	}
}

function get_adjectives() {
	var adjectives = text_to_array($('#custom_adjective_text').val())
	if(adjectives == null || adjectives.length == 0)
		adjectives = adjective_file
	return adjectives
}

function get_animals() {
	var animals = text_to_array($('#custom_animal_text').val())
	if(animals == null || animals.length == 0)
		animals = animal_file
	return animals
}

function text_to_array(text) {
	var result = null
	if(text != null && text.length > 0) {
		result = text.split(',')
		for (i = 0; i < result.length; i++)
			result[i] = result[i].trim()
	}
	return result
}

function capitalize_first(text) {
	if(text != null && text.length > 0) {
		var first = text[0].toUpperCase()
		var second = ""
		if(text.length > 1)
			second = text.substring(1)
		return first + second
	}
	return text
}
function random_int(from, to) {
	return Math.floor((Math.random() * to) + from)
}

fill_next_animal_data()

//animation
var acum = 0.0
var framerate = 1000 / 15
var interval_id = window.setInterval(() => {
	if(animal_file != null && adjective_file != null) {
		window.clearInterval(interval_id);
	} else {
		var label = $('#generated_name');
		acum += framerate
		var sec = Math.round(acum / 1000) % 4
		switch(sec) {
			case 0:
				label.text("Loading Files")
				break;
			case 1:
				label.text("Loading Files.")
				break;
			case 2:
				label.text("Loading Files..")
				break;
			case 3:
				label.text("Loading Files...")
				break;
		}
	}
}, framerate);