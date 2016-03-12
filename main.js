(function(L,JSONP){
    var paging=document.getElementById('paging');
    var resultsSection=document.getElementById('results-section');
    var theForm=document.getElementById('theForm');
    var btnNext=document.getElementById('btnNext');
    var btnPrevious=document.getElementById('btnPrevious');
    var data,map,markers;
    
    initMap();
    
    theForm.addEventListener('submit',onSubmit);
    theForm.addEventListener('reset',onReset);
    btnPrevious.addEventListener('click',previousResults);    
    btnNext.addEventListener('click',nextResults);
    
    function initMap(){
        map = L.map('map',{center:new L.latLng(38.41055825094609,-93.33984375),zoom:4,home:true}).setView([38.37611542403604, -93.3837890625], 4);
        L.tileLayer('http://api.tiles.mapbox.com/v4/examples.map-zr0njcqy/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoicnlhbm1ib3NsZXkiLCJhIjoiMkJqazZLbyJ9.nPS-SAuaRamw9TdSxsm3BA', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18
        }).addTo(map);
        map.options.center=map.getCenter();
        
        markers = new L.MarkerClusterGroup();
        map.addLayer(markers);
    }
    
    function doSearch(options,callback) {
        JSONP.get('http://api.indeed.com/ads/apisearch',{
            publisher:'7389100658200406',
            q:options.what,
            l:options.where,
            start:options.start || '',
            v:'2',
            format:'json',
            latlong:1
        }, callback);
    }
    
    function onSubmit(e) {
        e.preventDefault();
        
        doSearch({
            what:e.target[0].value,
            where:e.target[1].value
        },function(response){
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
            btnNext.style.display=data.end < data.totalResults ? 'inline-block' : 'none';
            btnPrevious.style.display=data.pageNumber > 0 ? 'inline-block' : 'none';
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
        btnNext.style.display='none';
        btnPrevious.style.display='none';
    }
    
    function onReset(e){
        e.preventDefault();
        var formInputs=document.querySelectorAll('form input');
        for(var i=0,formInput;formInput=formInputs[i];i++){
            formInput.value='';
        }
        clearResults();
        resultsSection.style.display='none';
    }
    
    function previousResults() {
        if (data.pageNumber > 0) {
            var start=data.pageNumber===1 ? '' : (data.pageNumber - 1) * 10;
            var options={
                what: data.query,
                where: data.location,
                start: start
            };
            doSearch(options,function(response){
                data=response;
                displayResults();
            });
        }
    }
    
    function nextResults() {
        if (data.end < data.totalResults) {
            var options={
                what: data.query,
                where: data.location,
                start: data.end
            };
            doSearch(options,function(response){
                data=response;
                displayResults();
            });
        }
    }
}(L,JSONP));

