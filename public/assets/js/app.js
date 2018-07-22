// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  if(data.length > 0) {
    data.forEach((element, i) => {
      document.getElementById("missing").style.display="none";
      // Create our elements
      let colSpacer = document.createElement("div");
      colSpacer.classList.add("col-2");
  
      let colSpacerTwo = document.createElement("div");
      colSpacerTwo.classList.add("col-2");
  
      let col = document.createElement("div");
      col.classList.add("col-8");
      col.style.marginTop = "20px";
  
      let card = document.createElement("div");
      card.classList.add("card");
  
      let cardBody = document.createElement("div");
      cardBody.classList.add("card");
  
      let cardHeader = document.createElement("div");
      cardHeader.classList.add("card-header","bg-primary","text-white");
  
      let secondRow = document.createElement("div");
      secondRow.classList.add("row");
  
      let header = document.createElement("h5");
      header.classList.add("card-title","col");
      header.innerHTML = data[i].title;
  
      let button = document.createElement("a");
      button.classList.add("btn","btn-success","col");
      button.style.maxWidth = "180px";
      button.style.maxHeight = "39px";
      button.href = "#";
      button.innerText = "Save Article";
      button.setAttribute("data-id",data[i]._id);
      button.onclick = clickBoy;
  
      let subTitle = document.createElement("p");
      subTitle.classList.add("card-text");
      subTitle.innerHTML = element.body || "Asdfasdfas";
  
      //Start building them from the ground up
      secondRow.appendChild(header);
      secondRow.appendChild(button);
      cardHeader.appendChild(secondRow);
      cardBody.appendChild(cardHeader);
      cardBody.appendChild(subTitle);
      card.appendChild(cardBody);
      col.appendChild(card);
      
      // row.appendChild(col);
      document.getElementById("rowWrap").appendChild(colSpacer);  
      document.getElementById("rowWrap").appendChild(col);
      document.getElementById("rowWrap").appendChild(colSpacerTwo);
    });
  }
  else {
    document.getElementById("missing").style.display="block";
  }
});

const clickBoy = function(e) {
  e.preventDefault();
  console.log(this);
  $.ajax({
    method: "GET",
    url: "/save-article/" + this.getAttribute("data-id")
  }).then((data) =>{

  });
}

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

window.onload = () => {
  if(document.getElementById("scrape-button")) {
    document.getElementById("scrape-button").onclick = scrapeBoy;
  }
}

const scrapeBoy = (e) => {
  e.preventDefault();
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).then((data)=>{
    window.location.reload();
  })
}

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
