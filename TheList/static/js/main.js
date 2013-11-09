var searchTransactions = function(){
	$.getJSON("/transactions/search").done(function(response){
		for (var i = 0; i < response.length; i++){
				$("#search-results").insert("<div class='col-sm-6 col-md-3'><h2>" + response[i]['val']['item'] + "</h2><p>" + response[i]['val']['description'] + "</p></br>" + response[i]['val']['vendor'] + "</div>");
		}
		});
	};
}
