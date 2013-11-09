var isLoggedIn = function(){
	$.getJSON("/current-user").done(function(response){
		if (!response['value'])
			return false;
		else
      $("#accountform").html('<div class="dropdown-toggle" id="username" data-toggle="dropdown">' + response['value']['userIdent']+'</div><ul class="dropdown-menu"><li><a href="/transactions">My Transactions</a></li><li><a href="/offers">My Offers</a></li><li><a href="/settings">Settings</a></li><li><a href="/auth/logout">Log Out</a></li></ul>');
      });
};

var searchTransactions = function(){
	query = $("#search-text").val();
	$.getJSON("/transactions/search/" + query).done(function(response){
		for (var i = 0; i < response.length; i++){
				$("#search-results").insert("<div class='col-sm-6 col-md-3'><h2>" + response[i]['val']['item'] + "</h2><p>" + response[i]['val']['description'] + "</p></br>" + response[i]['val']['vendor'] + "</div>");
		}
		});
	};



$(function(){
	isLoggedIn();
		
});
