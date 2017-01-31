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
        map = L.map('map').setView([0, 0], 2);

        L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: ['a','b','c']
        }).addTo( map );
        
        markers = new L.MarkerClusterGroup();
        map.addLayer(markers);
    }
    
    function doSearch(options,callback) {
        JSONP.get('http://api.indeed.com/ads/apisearch',{
            publisher:'7389100658200406',
            q:options.what,
            l:options.where,
            co: options.country,
            start:options.start || '',
            v:'2',
            format:'json',
            latlong:1
        }, callback);
    }
    
    function onSubmit(e) {
        e.preventDefault();
        
        doSearch({
            what: e.target[0].value,
            where: e.target[1].value,
            country: e.target[2].value
        },function(response){
            data=response;
            data.country=e.target[2].value;
            displayResults()
        });
    }
    
    function displayResults() {
        clearResults();
        
        data.results.forEach(function(result){  
            if (result.latitude && result.longitude) {
                var marker = new L.marker([result.latitude,result.longitude]);
                var content='<a href="' + result.url + '" target="_blank">' + result.jobtitle +
                    '</a><br/><span>' + result.company + '</span><br/><span>' + result.formattedLocationFull + '<span>';
                marker.bindPopup(content,{showOnMouseOver: true});
                markers.addLayer(marker);
            }
        });
        
        if (data.results.length) {
            var bounds=markers.getBounds();
            if(bounds.isValid()){
                map.fitBounds(bounds);
            }
        
            resultsSection.style.display='block';
            paging.innerHTML='Jobs ' + data.start + ' to ' + data.end + ' of ' + data.totalResults;
            btnNext.style.display=data.end < data.totalResults ? 'inline-block' : 'none';
            btnPrevious.style.display=data.pageNumber > 0 ? 'inline-block' : 'none';
        } else {
            paging.innerHTML='No results';
        }
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
                country: data.country,
                start: start
            };
            doSearch(options,function(response){
                data=response;
                data.country=options.country;
                displayResults();
            });
        }
    }
    
    function nextResults() {
        if (data.end < data.totalResults) {
            var options={
                what: data.query,
                where: data.location,
                country: data.country,
                start: data.end
            };
            doSearch(options,function(response){
                data=response;
                data.country=options.country;
                displayResults();
            });
        }
    }
}(L,JSONP));

