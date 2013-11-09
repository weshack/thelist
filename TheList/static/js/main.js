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
  $("#myTransactionModalBody").html('');
  $("#myTransactionModalTitle").val(response.value.transactionItem);
  var vendor = $("<h4>").text(response.value.transactionVendor);
  var desc = $("<p>").text(response.value.transactionDescription);
  $("#myTransactionModalTitle").text(response['value']['transactionItem']);
  var ul = $("<ul>").text("Offers");
  $("#myTransactionModalBody").append(vendor).append(desc).append(ul);
  $.getJSON("/offers/for-transaction/" + response.key).done(function(response){
    for (var i=0; i < response.length; i++) {
      (function(r) {
        var desc = $("<p>").text(r.value.offerOffer + "   ");
        var btn = $("<button>").addClass('btn').addClass('btn-default').text('Accept Offer').click(function(){acceptOffer(r);});
        desc.append(btn);
        var li = $("<li>").addClass('offer').append(desc);
        ul.append(li);
      })(response[i]);
    }
  });
};

var acceptOffer = function(offer) {
console.log(offer);
};

var myOffers = function() {
	user = $("#username").text()
	$.getJSON("/offers/by-id/" + user).done(function(response){
        console.log(response);
        $("#myOffersResults").html("");
        for (var i = 0; i < response.length; i++){
            (function(r){
              var h2 = $("<h2>").text(r.value.offerOffer);
              var desc = $("<p>").text(r.value.offerClient);
              var btn = $("<a>").addClass('btn').addClass('btn-default').text('Cancel').click(function(){cancelOffer(r);});
              var div = $("<div>").addClass("myOfferResult").addClass('col').addClass("col-md-3").append(h2).append(desc).append(btn)
              $("#myOffersResults").append(div);
            })(response[i]);
        }
	$('#myOffersModal').modal('show')
}
)};

var cancelOffer = function(r){
	$.getJSON("/offers/rescind/" + r.key)
}
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
var makeOffer = function(transId) {
  var data = {
    'Transaction': transId,
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
    $.getJSON("/users/by-key/" + response.value.transactionVendor).done(function(user){
        var vendor = $("<h4>").text(user.userName + " - " + user.userIdent);
        var desc = $("<p>").text(response.value.transactionDescription);
        var offerForm = $("<div id='offerForm'>").addClass('hidden').addClass('transition-all').append($("<h4>").text("Make an Offer")).append($("<table>").append($("<tr>").append($("<td>").text("Enter an Offer: ")).append($("<td>").append($("<input id='new-offer-amount'>").attr('type','text'))))).append($("<button>").addClass('btn').addClass('btn-default').click(function(){ makeOffer(response.key); } ).text('Submit'));
        $("#transactionModalBody").append(vendor).append(desc).append(offerForm);
        $("#transaction-title").val(response['value']['transactionItem']);
    });
}


$(function(){
  isLoggedIn();
});
