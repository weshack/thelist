/* Checks if user is logged in */
var isLoggedIn = function(){
	$.getJSON("/current-user").done(function(response){
		if (!response['value']){
			return false;
    } else if (!response['value']['userName']) {
       $('#register-button').click(); 
		} else {
      $("#accountform").html('<div class="dropdown-toggle" id="username" data-toggle="dropdown">' + response['value']['userIdent'] + '</div><ul class="dropdown-menu"><li><a href="#transactions" onclick="myTransactions()">My Transactions</a></li><li><a href="#offers" onclick="myOffers()">My Offers</a></li><li><a href="#settings" onclick="settings()">Settings</a></li><li><a href="/auth/logout">Log Out</a></li></ul>');
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
          trans = resp[i]['value'];
          $('.container .row').append('<div class="col-sm-6 col-md-3"><h2>'+trans['transactionItem']+'</h2><p>'+trans['transactionDescription']+'</p><p><a class="btn btn-default" href="#">View Details &raquo;</a></p>');
        }
      }
    });
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

/* searches transactions */
var searchTransactions = function(){
	query = $("#search-text").val();
	$.getJSON("/transactions/search/" + query).done(function(response){
    console.log(response);
    $("#search-results").html("");
		for (var i = 0; i < response.length; i++){
				$("#search-results").append("<div class='col-sm-6 col-md-3'><h2>" + 
                                    response[i]['value']['transactionItem'] + "</h2><p>" + 
                                    response[i]['value']['transactionDescription'] + "</p></br>" + 
                                    response[i]['value']['transactionVendor'] + "<p><a class='btn btn-default' onclick='function(){fillTransactionModal(" + response["key"] + ")}' data-toggle='modal' data-target='#transactionModal'>View details &raquo;</a></p></div>");
		}
  });
};


var fillTransactionModal = function(a){
	$.getJSON("/transactions/by-id/"+a).done(function(response){
		$("#transactionModalTitle").val(response['value']['transactionItem']);
		$("#transactionModalBody").html("<h4>"+ response['value']['transactionVendor']+"</h4><p>"+response['value']['transactionDescription']+"</p>");
		$("#transaction-title").val(response['value']['transactionItem']);
	})
}

$(function(){
  isLoggedIn();
});
