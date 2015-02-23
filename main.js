var map = L.map('map',{center:new L.latLng(38.41055825094609,-93.33984375),zoom:4,home:true}).setView([38.37611542403604, -93.3837890625], 4);
L.tileLayer('http://api.tiles.mapbox.com/v4/examples.map-zr0njcqy/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoicnlhbm1ib3NsZXkiLCJhIjoiMkJqazZLbyJ9.nPS-SAuaRamw9TdSxsm3BA', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
}).addTo(map);
map.options.center=map.getCenter();

var markers = new L.FeatureGroup();
map.addLayer(markers);

var paging=document.getElementById('paging');
var resultsSection=document.getElementById('results-section');
var data;

var CustomMarker = L.Marker.extend({ 
    bindPopup: function(htmlContent, options) {                                    
        if (options && options.showOnMouseOver) {                            
            // call the super method
            L.Marker.prototype.bindPopup.apply(this, [htmlContent, options]);
            
            // unbind the click event
            this.off("click", this.openPopup, this);
            
            // bind to mouse over
            this.on("mouseover", function(e) {                        
                // get the element that the mouse hovered onto
                var target = e.originalEvent.fromElement || e.originalEvent.relatedTarget;
                var parent = this._getParent(target, "leaflet-popup");
                // check to see if the element is a popup, and if it is this marker's popup
                if (parent == this._popup._container){
                    return true;
                }                        
                // show the popup
                this.openPopup();                        
            }, this);
                    
            // and mouse out
            this.on("mouseout", function(e) {                        
                // get the element that the mouse hovered onto
                var target = e.originalEvent.toElement || e.originalEvent.relatedTarget;                        
                // check to see if the element is a popup
                if (this._getParent(target, "leaflet-popup")) {
                    L.DomEvent.on(this._popup._container, "mouseout", this._popupMouseOut, this);
                    return true;
                }                        
                // hide the popup
                this.closePopup();                        
            }, this);                        
        }                    
    },
 
    _popupMouseOut: function(e) {            
        // detach the event
        L.DomEvent.off(this._popup, "mouseout", this._popupMouseOut, this);
        // get the element that the mouse hovered onto
        var target = e.toElement || e.relatedTarget;            
        // check to see if the element is a popup
        if (this._getParent(target, "leaflet-popup")){
            return true;
        }            
        // check to see if the marker was hovered back onto
        if (target == this._icon){
            return true;
        }            
        // hide the popup
        this.closePopup();                
    },
        
    _getParent: function(element, className) {                
        var parent = element.parentNode;            
        while (parent != null) {                    
            if (parent.className && L.DomUtil.hasClass(parent, className)){
                return parent;
            }                
            parent = parent.parentNode;                    
        }            
        return false;                
    }     
});

function doSearch(what,where,start) {
    var dfd=new $.Deferred(); 
    $.ajax({
        url: 'http://api.indeed.com/ads/apisearch',
        jsonp: "callback",
        dataType: "jsonp",
        data: {
            publisher:'7389100658200406',
            q:what,
            l:where,
            start:start || '',
            v:'2',
            format:'json',
            latlong:1
        },
        success: function( response ) {
            dfd.resolve(response);
        }
    });
    return dfd;
}

function onSubmit(e) {
    e.preventDefault();
    
    var what=e.target[0].value;
    var where=e.target[1].value;
    doSearch(what,where).done(function(response){
        data=response;
        displayResults()
    });
}

function displayResults() {
    clearResults();
    
    data.results.forEach(function(result){  
        if (result.latitude && result.longitude) {
            var marker = new CustomMarker([result.latitude,result.longitude]);
            var content='<a href="' + result.url + '" target="_blank">' + result.jobtitle +
                '</a><br/><span>' + result.company + '</span><br/><span>' + result.formattedLocationFull + '<span>';
            marker.bindPopup(content,{showOnMouseOver: true});
            markers.addLayer(marker);
        }
    });
    
    if (data.results.length) {
        map.fitBounds(markers.getBounds());
    
        resultsSection.style.display='block';
        paging.innerHTML='Jobs ' + data.start + ' to ' + data.end + ' of ' + data.totalResults;
        data.end < data.totalResults ? $('#btnNext').show() : $('#btnNext').hide();
        data.pageNumber > 0 ? $('#btnPrevious').show() : $('#btnPrevious').hide();
    }        
}

function getParent(element, className) {		
    var parent = element.parentNode;        
    while (parent != null) {                
        if (parent.className && L.DomUtil.hasClass(parent, className))
            return parent;            
        parent = parent.parentNode;                
    }        
    return false;            
}

function clearResults() {
    markers.clearLayers();
    paging.innerHTML='';
    resultsSection.style.display='block';
}

function onReset(e){
    e.preventDefault();
    $('form input').attr('value','');
    clearResults();
    resultsSection.style.display='none';
}

var theForm= $('#theForm');
theForm.on('submit',onSubmit);
theForm.on('reset',onReset);
$('#btnPrevious').on('click',function(){
    if (data.pageNumber > 0) {
        var start=data.pageNumber===1 ? '' : (data.pageNumber - 1) * 10;
        doSearch(data.query,data.location,start).done(function(response){
            data=response;
            displayResults();
        });
    }
});
$('#btnNext').on('click',function(){
    if (data.end < data.totalResults) {
        doSearch(data.query,data.location,data.end).done(function(response){
            data=response;
            displayResults();
        });
    }
});