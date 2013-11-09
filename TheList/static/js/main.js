/* Checks if user is logged in */
var isLoggedIn = function(){
	$.getJSON("/current-user").done(function(response){
		if (!response['value']){
			return false;
    } else if (!response['value']['userName']) {
       $('#register-button').click(); 
		} else {
      $("#accountform").html('<div class="dropdown-toggle" id="username" data-toggle="dropdown">' + response['value']['userIdent'] + '<b class="caret"></b></div><ul class="dropdown-menu"><li><a href="#transactions" onclick="myTransactions()">My Transactions</a></li><li><a href="#offers" onclick="myOffers()">My Offers</a></li><li><a href="#settings" onclick="settings()">Settings</a></li><li><a href="/auth/logout">Log Out</a></li></ul>');
    }
  });
};

var register = function() {
  name = $('#registerName').val();
  city = $('#registerCity').val();
  if (name === 'Your Name' || city === 'Your City' || name === '' || city === '') {
    $('#register .error').html('Please enter a name and city!');
  } else {
    $.getJSON("/current-user").done(function(response){
      $.getJSON("/users/register/" + response['value']['userIdent'] + "/" + name + "/" + city).done(function(){
        isLoggedIn();});
    });
  }
};

//data-toggle="modal" data-target="#myTransactions"
var myTransactions = function() {
  $.getJSON("/current-user").done(function(response){
    $.getJSON("/transactions/by-id/" + response['value']['userIdent']).done(function(resp){
      if (resp.length == 0) {
        $('.container .row').html("<div>You do not have any transactions!</div>");
      } else {
        $('.container .row').html('');
        for (var i=0; i < resp.length; i++) {
          (function(r) {
            var h2 = $("<h2>").text(r.value.transactionItem);
            var desc = $("<p>").text(r.value.transactionDescription);
            var btn = $("<a>").addClass('btn').addClass('btn-default').attr('data-toggle', 'modal').attr('data-target', '#myTransactionModal').text('view details >>').click(function(){showTransactionDetails(r);});
            var div = $("<div>").addClass("col-sm-6").addClass("col-md-3").append(h2).append(desc).append(btn);
            $('.container .row').append(div);
          })(resp[i]);
        }
      }
    });
  });
};


var showTransactionDetails = function(response) {
  $("#myTransactionModalTitle").val(response.value.transactionItem);
  var vendor = $("<h4>").text(response.value.transactionVendor);
  var desc = $("<p>").text(response.value.transactionDescription);
  $("#myTransactionModalBody").append(vendor).append(desc);
  $("#myTransactionModalTitle").text(response['value']['transactionItem']);
  $.getJSON("/offers/for-transaction/" + response.key).done(function(response){
  });
};

var myOffers = function() {

};

var settings = function() {

};

var addTransaction = function(){
  var data = {          
    'Item': $("#new-transaction-item").val(),
    'Description': $("#new-transaction-description").val(),
    'Minimum Offer': $("#new-transaction-offer").val(),
    'Image URL': null
  }
  $.post("/transactions/add", data).always(function(response){
    console.log(response);
  });
};   

/* Makes the offer form visible */
var showOfferForm = function() {
  console.log('clicked');
  $("#offerForm").removeClass("hidden");
};
/* Hides the offer form */
var hideOfferForm = function() {
  console.log('clicked hidden');
  $("#offerForm").addClass("hidden");
};

/* Adds a new offer */
var addOffer = function() {
  var data = {
    'Transaction': $('#new-offer-transaction').val(),
    'Offer': $('#new-offer-amount').val()
  }
  $.post("/offers/new", data).always(function(response){
    console.log(response);
  });
};


/* searches transactions */
var searchTransactions = function(){
    query = $("#search-text").val();
    $.getJSON("/transactions/search/" + query).done(function(response){
        console.log(response);
        $("#search-results").html("");
        for (var i = 0; i < response.length; i++){
            (function(r){
              var h2 = $("<h2>").text(r.value.transactionItem);
              var desc = $("<p>").text(r.value.transactionDescription);
              var btn = $("<a>").addClass('btn').addClass('btn-default').attr('data-toggle','modal').attr('data-target','#transactionModal').text('view details >>').click(function(){fillTransactionModal(r);});
              var div = $("<div>").addClass("search-result").addClass('col').addClass("col-md-3").append(h2).append(desc).append(btn)
              $("#search-results").append(div);
            })(response[i]);
        }
   });
};


var fillTransactionModal = function(response){
    $("#transactionModalTitle").val(response.value.transactionItem);
    var vendor = $("<h4>").text(response.value.transactionVendor);
    var desc = $("<p>").text(response.value.transactionDescription);
    $("#transactionModalBody").append(vendor).append(desc);
    $("#transaction-title").val(response['value']['transactionItem']);
}


$(function(){
  isLoggedIn();
});
