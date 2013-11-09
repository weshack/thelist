/* Checks if user is logged in */
var isLoggedIn = function(){
	$.getJSON("/current-user").done(function(response){
		if (!response['value']){
			return false;
    } else if (!response['value']['userName']) {
       $('#register-button').click(); 
		} else {
      $("#accountform").html('<div class="dropdown-toggle" id="username" data-toggle="dropdown">' + response['value']['userIdent'] + '<b class="caret"></b></div><ul class="dropdown-menu"><li><a href="#transactions" onclick="myTransactions()">My Transactions</a></li><li><a href="#offers" onclick="myOffers()">My Offers</a></li><li><a href="#settings" onclick="settings()">Settings</a></li><li><a href="#rate" onclick="fillReviewModal()">Review Vendors</a></li><li><a href="/auth/logout">Log Out</a></li></ul>');
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

var editMyTransaction = function() {  
  $("#newTransactionName").text($("#myTransactionModalTitle").text());
  $("#newTransactionDescription").text($("#myTransactionModalBody p").text());
  $("#newTransactionMinPrice").text($("#myTransactionModalBody p").text());
  $(".editTransaction").removeClass("hidden");

};

var notCompleted = function(transaction) {
  if (!transaction.value.transactionCompleted){
    return transaction;
  }
};

var myTransactions = function() {
  $.getJSON("/current-user").done(function(response){
    $.getJSON("/transactions/by-id/" + response['value']['userIdent']).done(function(resp){
      $("#myTransactionModalBody").html("");
      var trans = resp.filter(notCompleted);
      if (trans.length == 0) {
        var p = $("<p>").text("You do not currently have any transactions.");
        $("#myTransactionModalBody").append(p);
      } else {
        for (var i=0; i < trans.length; i++) {
            (function(r) {
              var h2 = $("<h2>").text(r.value.transactionItem);
              var desc = $("<p>").text(r.value.transactionDescription);
              //var btn = $("<a>").addClass('btn').addClass('btn-default').attr('data-toggle', 'modal').attr('data-target', '#myTransactionModal').text('view details >>').click(function(){showTransactionDetails(r);});
              var dropdown = $('<div>').addClass('dropdown-toggle').addClass('btn').addClass('btn-default').attr("data-toggle","dropdown").text("Offers");
              var ul = $('<ul id="'+r.key+'">"').addClass("dropdown-menu");
              var div = $("<div>").addClass("transaction").append(h2).append(desc);
              var li = $('<li>').addClass('btn-group').append(div).append(dropdown).append(ul);
              $('#myTransactionModalBody').append(li);
              showOffers(r);
            })(trans[i]);
        }
      } 
      $("#myTransactionModalButton").click();
    });
  });
};

var showOffers = function(transaction) {
  $.getJSON("/offers/for-transaction/" + transaction.key).done(function(response) {
    $("#" + transaction.key).html('');
    for (var i=0; i < response.length; i++) {
      (function(r) {
        var price = $("<div>").text(r.value.offerOffer);
        var btn = $("<button>").addClass('btn').addClass('transactionBtn').addClass('btn-default').text('Accept Offer').click(function(){acceptOffer(r);});
        price.append(btn);
        var li = $("<li>").addClass('offer').append(price);
        $("#"+transaction.key).append(li);
      })(response[i]);
    }
  });
};

var acceptOffer = function(offer) {
  $.getJSON("/offers/accept/" + offer.key).done(function() {
    $("#myTransactionModal .close").click();
  });
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

var showProfile = function(key) {
	$.getJSON("/users/by-key/"+key).done(function(response){
		console.log(response);
		$("#userProfileName").text(response['userName']);
		$("#userProfileEmail").text(response['userIdent']);
		$("#userProfileCity").text(response['userCity']);
		$.getJSON("/transactions/by-id/" + response['userIdent']).done(function(response){
        console.log(response);
        $("#userProfileTransactions").html("");
        for (var i = 0; i < response.length; i++){
            (function(r){
              var h2 = $("<h2>").text(r.value.transactionItem);
              var desc = $("<p>").text(r.value.transactionDescription);
              var btn = $("<a>").addClass('btn').addClass('btn-default').attr('data-toggle','modal').attr('data-target','#transactionModal').text('view details >>').click(function(){fillTransactionModal(r);});
              var div = $("<div>").addClass("search-result").addClass('col').addClass("col-md-3").append(h2).append(desc).append(btn);
              $("#userProfileTransactions").append(div);
            })(response[i]);
        }
   });

	})
$('#userProfileModal').modal('show')
}

var addTransaction = function(){
  var data = {          
    'Item': $("#new-transaction-item").val(),
    'Description': $("#new-transaction-description").val(),
    'Minimum Offer': $("#new-transaction-offer").val(),
    'Image URL': null
  }
  $.post("/transactions/add", data).always(function(response){
    console.log(response);
    $('#postModal .close').click();
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
              if (!r.value.transactionCompleted){
              var h2 = $("<h2>").text(r.value.transactionItem);
              var desc = $("<p>").text(r.value.transactionDescription);
              var btn = $("<a>").addClass('btn').addClass('btn-default').attr('data-toggle','modal').attr('data-target','#transactionModal').text('view details >>').click(function(){fillTransactionModal(r);});
              var div = $("<div>").addClass("search-result").addClass('col').addClass("col-md-3").append(h2).append(desc).append(btn)
              $("#search-results").append(div);
              }
            })(response[i]);
        }
   });
};


var fillTransactionModal = function(response){
	$("#transactionModalBody").html("");
    $("#transactionModalTitle").val(response.value.transactionItem);
    $.getJSON("/ratings/for-user/"+response.value.transactionVendor).done(function(rating){
      console.log(rating);
      $.getJSON("/users/by-key/" + response.value.transactionVendor).done(function(user){
        var vendor = $("<h4>").text(user.userName + " - " + user.userIdent);
        var rates = $("<h5>").text("Rating: " + rating.rating + " out of " + rating.num_ratings + " ratings.");
        var desc = $("<p>").text(response.value.transactionDescription);
        var offerForm = $("<div id='offerForm'>").addClass('transition-all').append($("<h4>").text("Make an Offer")).append($("<table>").append($("<tr>").append($("<td>").text("Enter an Offer: ")).append($("<td>").append($("<input id='new-offer-amount'>").attr('type','text')))))
        $("#offerButton").click(function(){makeOffer(response.key);$('#transactionModal .close').click()});
        $("#transactionModalBody").append(vendor).append(rates).append(desc).append(offerForm);
        $("#transaction-title").val(response['value']['transactionItem']);
    });
});
}

var addRating = function(reviewed){
    $.post("/ratings/add", {
        'Reviewed': reviewed,
        'Rating': parseInt($("#rate-score").val())
    }).done(fillReviewModal)
}

var fillReviewModal = function(){
    $("#rate-button").click();
    $.getJSON("/users/can-review").done(function(response){
        $("#rate .modal-body").html('<ul></ul>');
        for (var i = 0; i < response.length; i++){
          (function(r){
              $("#rate .modal-body ul").append($("<li>").text(r.value.userName).click(function(){
                  $("#rate .modal-body").html('');
                  $("#rate .modal-body").append($("<input id='rate-score'>").attr('type','text')).append($("<input>").attr('type','submit').click(function(){ addRating(r.key); }));
              }));
          })(response[i])
        }
    });
}

var about = function(){
  $('#about-button').click();
};

$(function(){
  isLoggedIn();
  $("#search-text").keydown(function(e){
    if (e.which == 13){
      $("#search-submit").click();
    }  
  });
});
