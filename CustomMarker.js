var CustomMarker=(function(L){
    var customMarker = L.Marker.extend({ 
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
            if(!element){
                return false;
            }
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
    return customMarker;
}(L));
