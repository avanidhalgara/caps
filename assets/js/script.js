/*

1. User enters website
    1a. user is prompted to allow location data
2. location data is used to retrieve list of area restaurants
    2a. user selects restaurant
3. user is presented with list of dishes for that resturant
4. user clicks on a dish and adds it to their dishlist
    4a. dish selected hits nutritionix api and returns calorie information

*/

// 1. user enters website:

// 1a. on page load (event listener?), prompt user for location data
// if no, alert user location data is necessary to use the app at this time
// else let user go back and say yes
// if yes, use getCurrentPosition() to populate lat and lon of USRM API URL
// variable that stores user position
// render "find restaurants near you" button that will render restaurant list

// 2. location data populates USRM API URL and hits the API for restaurants nearby
// using variable that stores user position, pass variable into url
// inside the API callback function, use a for loop to render restaurants to page
// 2a. user selects one of the nearby restaurants
// resturant ID is stored     tems For Restaurant



// 3.  when user clicking on restaurant it shows menu items from the USRM API url
// menu items populate page - each item will be in it's own dynamically generated
// use a for loop to render menu items to page 
// endpoint objecte converted to string if not string 


// 4. If user selects to add menu items the menu items are rendered onto the dishlist.html
// Menu item is called from object array and appended as a child to dishlist.html 

// local storage: get dish or initialize empty object
var storedDishes = JSON.parse(localStorage.getItem("Dish")) || [];


// on load, ask for user's location data
window.addEventListener("load", getLocation);

// get user's location data
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);

    } else {
        console.log('working')
        var modalDiv = $("<div>").addClass("open-moal show-modal").attr("id", 'modal1').text("Your browser does not support Geolocation data :(");
        $('body').append(modalDiv);
        modalDiv.toggle(".show-modal");
    }
}

// uses location data to populate our URL
function showPosition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var latlongUrl = "https://us-restaurant-menus.p.rapidapi.com/restaurants/search/geo?page=1&lon=" + lon + "&lat=" + lat + "&distance=5"

    $.ajax({
        "url": latlongUrl,
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "us-restaurant-menus.p.rapidapi.com",
            "x-rapidapi-key": "7e2b082138msh261301ec7c957a4p1da6fbjsn1aa9a17ef936"
        }
    }).then(function (response) {
        console.log(response)
        var restaurantList = response.result.data

        var restaurantListEl = $('<div>').addClass("container rest-list-div");
        for (let i = 0; i < restaurantList.length; i++) {
            var restaurantId = response.result.data[i].restaurant_id;
            
            var restaurantButtons = $("<button type='button' data-toggle='modal'>")
                .text(restaurantList[i].restaurant_name)
                .addClass("rest-button btn col btn-primary")
                .attr({"data-target": "#restaurantModal" + i});

            // modal variables
            var restaurantAddress = response.result.data[i].address.formatted
            var restaurantPhone = response.result.data[i].restaurant_phone
            var restaurantPriceRange = response.result.data[i].price_range
            // the restaurants i'm getting all seem to have no available price range so we can take this if statement out if it's displaying the same results for restaurants in Minneapolis
            if (restaurantPriceRange === "") {
                restaurantPriceRange="Unavailable"
            }
            var restaurantName = response.result.data[i].restaurant_name
            var modalDiv = $('<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="restaurantModalLabel" aria-hidden="true">')
                .attr("id", "restaurantModal" + i)
            var modalDialog = $('<div class="modal-dialog" role="document">')
            var modalContent = $('<div class="modal-content">')
            // modal header variables
            var modalHeader = $('<div class="modal-header">')
            var modalTitle = $('<h4 class="modal-title">')
                .text(restaurantName)

            var modalCloseButton = $('<button class="modal-close btn btn-secondary" type="button" data-dismiss="modal" aria-label="Close">')
                .add($('<span aria-hidden="true>'))
                .text("X")
            // modal body variablesco
            var modalBody = $('<div class="modal-body">')
            var modalRestaurantAddress = $('<p class="modal-restaurant-address">')
                .text(restaurantAddress)
            var modalRestaurantPhone = $('<p class="modal-restaurant-phone">')
                .text(restaurantPhone)
            var modalRestaurantPriceRange = $('<p class="modal-restaurant-price-range">')
                .text("Price range: " + restaurantPriceRange)
            // console.log(modalRestaurantInfo)
            // modal footer variables
            var modalFooter = $('<div class="modal modal-footer">')       
            var modalMenuButton = $('<button type="button" class="menu-button btn btn-primary modal-close" data-dismiss="modal">')
                .text("Show me the menu!")
                .attr({"value": restaurantId, "data-zomato": restaurantList[i].restaurant_name})


            $('#restaurant-list').append(restaurantListEl);
            restaurantListEl.append(restaurantButtons, modalDiv);
            modalDiv.append(modalDialog);
            modalDialog.append(modalContent);
            modalBody.append(modalRestaurantAddress, modalRestaurantPhone, modalRestaurantPriceRange);
            modalHeader.append(modalTitle, modalCloseButton);
            modalFooter.append(modalMenuButton);
            modalContent.append(modalHeader, modalBody, modalFooter);
        };
        $('.menu-button').on('click', showDishes)
    });
};

function showDishes() {
    // toggles Restaurant accordion to close and then Men accordion opens
    $("#collapseOne").toggle();
    $("#collapseThree").toggle();
    var q = $(this).attr("data-zomato");

    var urlId = $(this).val();
    console.log(urlId)
    var dishesUrl = "https://us-restaurant-menus.p.rapidapi.com/restaurant/" + urlId + "/menuitems?page=1"
    // console.log(dishesUrl)
    zomatoMenuUrl(q);

    $.ajax({
        url: dishesUrl,
        method: "GET",
        "headers": {
            "x-rapidapi-host": "us-restaurant-menus.p.rapidapi.com",
            "x-rapidapi-key": "7e2b082138msh261301ec7c957a4p1da6fbjsn1aa9a17ef936"
        }
    }).then(function (response) {
        console.log(response);

        var dishesList = response.result.data;
        // clears page to make way for menu items
        // $(".rest-button").remove();
        var dishesListEl = $("<div>").addClass("container menu-container");

        for (let i = 0; i < dishesList.length; i++) {
            var dishName = dishesList[i].menu_item_name;
            var restName = dishesList[i].restaurant_name;
            var dishButtons = $("<button>")
                .text(dishName)
                .addClass("row dish-button btn btn-primary btn-block")
                .attr({ "value": dishName, "data-name": restName })
                .click(applyDishButtonEventLisetner);

            $("#menu-section").append(dishesListEl);
            dishesListEl.append(dishButtons);
            
        };
    });


};

function zomatoMenuUrl(qname) {

    console.log("Q value: ", qname)
    var zomatoUrl = "https://developers.zomato.com/api/v2.1/search?entity_id=826&entity_type=city&q=" + qname;


    $.ajax({
        url: zomatoUrl,
        method: "GET",
        "headers": {
            "user-key": "fd3179f7aa74b386fbac5aec3f13b934"
        }

    }).then(function (response) {
        console.log(response);

        console.log(response.restaurants[0].restaurant.menu_url);

        // menu link div
        // var menuUrlDiv = $("<div>").addClass("container");
        // link to zomato menu url
        var menuUrlLink = $("<a>")
            .addClass("zomato-link row")
            .attr("href", response.restaurants[0].restaurant.menu_url)
            .text(qname + " " + "Menu via Zomato");
        // // appending menu url div to body
        $(".menu-container").prepend(menuUrlLink);
        // prepends link to top of dishes page
        // menuUrlDiv.append(menuUrlLink);
    });
};

function applyDishButtonEventLisetner() {

    var obj = {
        dish: $(this).val(),
        rest: $(this).attr("data-name")
    };
    
    console.log(storedDishes);
    storedDishes.push(obj);
    localStorage.setItem("Dish", JSON.stringify(storedDishes));
    renderLastDishListItem();
};

function renderLastDishListItem() {

    var lastItem = storedDishes.slice(-1)[0]
    console.log(lastItem)
    var dishListItem = $("<li>")
        .text(lastItem.rest + ": " + lastItem.dish)
        .addClass("dish-style");

        $("#dishlist").append(dishListItem);
};