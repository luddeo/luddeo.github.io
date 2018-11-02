/*global $, google*/
/*jslint browser: true, indent: 1 */

$(document).ready(function () {
 "use strict";
 // div variables
 var center_la = 61.978412,
  center_lo = 17.324381,
  mapOptions = {center: new google.maps.LatLng(center_la, center_lo),
   zoom: 12,
   mapTypeId: google.maps.MapTypeId.HYBRID},
  map = new google.maps.Map(document.getElementById("map"),
   mapOptions),
  markers = {},
  marker_categories;

 function xml_to_markers(xml) {
  var markers = [];
  $(xml).find("marker").each(function () {
   var lat = $(this).find("latitude").text(),
    long = $(this).find("longitude").text(),
    //icon_url = $(this).find("icon").text(),
    title = $(this).find("title").text(),
    info = $(this).find("info").text(),
    html = '<div class="map_marker"><h1>' + title + "</h1><p>" + info + '</p><div class="inlinks">',
    marker;

   $(this).find("in-links").find("link").each(function () {
    var url = $(this).find("url").text(),
     text = $(this).find("text").text();
    html += '<a href="' + url + '">' + text + '</a><br/>';
   });
   html += '</div><hr/><div class="outlinks">';
   $(this).find("out-links").find("link").each(function () {
    var url = $(this).find("url").text(),
     text = $(this).find("text").text();
    html += '<a href="' + url + '" target="_blank">' + text + '</a><br/>';
   });
   html += '</div></div>';


   marker = new google.maps.Marker({position: new google.maps.LatLng(lat, long),
    title: title//,icon: icon_url
	});

   google.maps.event.addListener(marker, 'click', function () {
    new google.maps.InfoWindow({content: html, maxWidth: 300}).open(map, marker);
   });
   marker.setMap(map);
   markers.push(marker);
  });
  return markers;
 }

 function load_markers_helper(local) {
  // needed so that local is not overwritten in the normal function. Now it is in this functions scope
  $.ajax({type: "GET",
   url: local.file,
   dataType: "xml",
   success: function (data) {markers[local.name] = xml_to_markers(data); }
   });

  $("div#options form").append('<input type="checkbox" name="markers" value="' + local.name +
   '" id="' + local.name + '">' + local.namn + '<br/>');
  $("input#" + local.name).prop('checked', true);
  $('input#' + local.name).change(function () {
   var index,
    set_map,
    id = $(this).attr('id'),
    local_markers = markers[id];

   set_map = ($(this).is(':checked') ? map : null);
   for (index = 0; index < local_markers.length; index += 1) {
    local_markers[index].setMap(set_map);
   }
  });
 }

 function load_markers(categories_list) {
  var index;
  $("div#options").html('<form action=""></form>');

  for (index = 0; index < categories_list.length; index += 1) {
   load_markers_helper(categories_list[index]);
  }
 }

 marker_categories = [{namn: 'Kultur', name: 'culture', file: 'data/culture.xml', info: "marker_icons/culture/info.png"},
  {namn: 'Mat', name: 'food', file: "data/food.xml", info: "marker_icons/food/info.png"},
  {namn: 'Natur', name: 'nature', file: "data/nature.xml", info: "marker_icons/nature/info.png"},
  {namn: 'Stränder', name: 'beach', file: "data/beach.xml", info: "marker_icons/beach/info.png"}];

 load_markers(marker_categories);

 // To fix the background s that it cover everything
 $('div#window-wrapper').css({
  height: $(document).height() + "px"
 });

 // To maxe the info window smaller than the window
 $('div#window').css({
  'max-height': (parseInt($(window).height(), 10) - 100) + "px"
 });

 $('div#window-wrapper').click(function () {
  $(this).hide();
 });

 $(document).keyup(function (event) {
  if (event.which === 27) { //  27 = escape
   $('div#window-wrapper').hide();
  }
 });

 $('div#window').click(function (event) {
  event.stopPropagation();
 });

 $("body").on("click", "div.inlinks a", function (event) {
  event.preventDefault();
  $("div#window").load($(this).attr("href") + " div#window-info", function () {
   $("div#window").prepend('<a href="" class="info-closer">stäng</a><br/>');
   $("a.info-closer").css({float: 'right'});
   $("a.info-closer").click(function (event) {
    event.preventDefault();
    $('div#window-wrapper').hide();
   });
  });
  $("div#window-wrapper").show();
 });
});
