/* Checks if user is logged in */
var isLoggedIn = function(){
	$.getJSON("/current-user").done(function(response){
		if (!response['value'])
			return false;
		else
      $("#accountform").html('<div class="dropdown-toggle" id="username" data-toggle="dropdown">' + response['value']['userIdent'] + '</div><ul class="dropdown-menu"><li><a href="#transactions" data-toggle="modal" data-target="#myTransactions" onclick="myTransactions()">My Transactions</a></li><li><a href="#offers" onclick="myOffers()">My Offers</a></li><li><a href="#settings" onclick="settings()">Settings</a></li><li><a href="/auth/logout">Log Out</a></li></ul>');
      });
};

var myTransactions = function() {
  
};

var myOffers = function() {

};

var settings = function() {

};

/* searches transactions */
var searchTransactions = function(){
	query = $("#search-text").val();
	$.getJSON("/transactions/search/" + query).done(function(response){
    console.log(response);
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
