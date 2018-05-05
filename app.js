///Foursquare Client ID, Client Secret , and url.
const VENUE_DETAIL_URL =  "https://api.foursquare.com/v2/venues/";
const VENUE_SEARCH_URL = "https://api.foursquare.com/v2/venues/search";
const CLIENT_ID =
 "F5351GDXA2MHDHXSVNL3IFSHCULZXYQHVEYTSA2WY3AQQIOO";
const CLIENT_SECRET=
"ZSTPQTWTMPUEMCL3QH1TTNIJU3EJBSD5MO5GM23X3FWS4AXO";

function getAPI (url, query, callback) {
    
    if (!query ){
        query = {};
   
    }
    query.client_id = CLIENT_ID;
    query.client_secret = CLIENT_SECRET; 
    query.v = "20180405";       
    return $.getJSON(url, query, callback);
    
}

function getVenueSearch(query,callbck){
    
    let url = VENUE_SEARCH_URL;
    getAPI(url,query,callback);
}

                                        

function getPhotosAPIResults( venue_id, callback ){
    const limit = 1; // we only ever care about 1 photo
    let url = VENUE_DETAIL_URL+venue_id+"/photos";
    const query = {
      limit: limit,
      VENUE_ID: venue_id
    };
    
    return getAPI(url,query, callback );
}

function addPhotoResultToVenue(venue, photo){
    
    const currentPhoto = {
        "prefix": "https://igx.4sqi.net/img/general/",
        "suffix":photo.suffix,
        "width": 200,
        "height": 200,      
    };
    //const someImageURL = photo.prefix+photo.width+"x"+photo.height+photo.suffix;
    const someImageURL = currentPhoto.prefix+currentPhoto.width+currentPhoto.height+currentPhoto.suffix;
 
    //console.log('generated photo URL:', someImageURL);
    altText = "no photo for ${venue.name}";
    if(photo){
        altText =`${venue.name}-photos`;    
    }
    // element with class photo is descendant the of element with class venue.
    $(`.venue[data-venue-id="${venue.id}"] .photo`)
    .attr("src", someImageURL)
    .attr("alt", "altText");
}

function renderResult(venue) {
   
    return (`
            <div class = "col-4">
                <div class = "restaurant-info">    
                    <div class="venue" data-venue-id="${venue.id}">
                        <div class = "wrapper">
                            <a href = "https://foursquare.com/v/${venue.name}/${venue.id}" target="_blank"><h4>${venue.name}</h4></a>
                        </div>
                        <a href = "https://foursquare.com/v/${venue.name}/${venue.id}" target="_blank"><img class="photo" src = "images/hourglass.gif" alt = "waiting for photo"></a>
                    </div>
                </div>
            <div>`
    );
    

   
}

function watchSubmit() {
    $(".form").submit(event => {
        event.preventDefault();
        const queryTarget = $(event.currentTarget).find(".search-restaurant");
        const searchTerm = queryTarget.val().trim();
        const query = {
            near: "Taiwan",
            query: searchTerm,
            categoryId: "4d4b7105d754a06374d81259",
        }
        // clear out the input
        queryTarget.val("");
        getAPI(VENUE_SEARCH_URL, query, function(data){
            //console.log(data);  
            
            
            if (data.response.venues.length == 0){
                
                noResults();
                
            }      
            const results = data.response.venues.map((venue, index) =>{
            let venue_id = venue.id;   
                
                getPhotosAPIResults( venue_id, function(photoData) {
                    
                    if( photoData.response.photos.count > 0 ){
                               
                        let photo = photoData.response.photos.items[0];
                    
                        addPhotoResultToVenue(venue, photo);
                     
                        // we have found a photo. find the venue already on the page and add the photo to it
                  
                    }
                    else if( photoData.response.photos.count == 0) {
                                  
                        let photo = $(`.venue[data-venue-id="${venue_id}"] .photo`)
                        .attr("src", "images/LogoMakr.png")
                        .attr("alt", "default-picture");
                    }
                });
                return renderResult(venue);
            });
        
            $("section.result >.row").html(results);       
            displayResults();
        });
    
    });

}

function noResults(){
   
    $(".no-result").removeAttr("hidden"); 
    $(".no-result").show(); 
    $(".no-result").html(`
        <div class = "row">
            <div class = "col-12">    
                <h1 class = "no-data">Sorry, no result. Try again.</h1>
            </div>
        </div>`
    );
    
    
}

function watchNewSearchButton(){
  $(".new-search-button-container button").click(function(event){
    // hide results, show new search, focus search box
    event.preventDefault();
    displaySearch();
    $('input[type="search"]').focus();
    $("footer").show();  
  });
}
// triggered on "search" button
function displayResults(){
     
    $(".new-search-button-container").show();    
    $("section.result").show();
    $("section.search").hide();
    $("footer").hide();
    $("body").addClass('result');
    $("body").removeClass('search');
}
// triggered on "search again"
function displaySearch(){
    $("div.no-result").hide();    
    $(".new-search-button-container").hide();    
    $("section.result").hide();
    $("section.search").show();
    $("body").removeClass("result");
    $("body").addClass("search");
}

$(watchNewSearchButton);
$(watchSubmit);