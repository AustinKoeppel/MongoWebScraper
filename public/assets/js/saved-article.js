// Grab the articles as a json
$.getJSON("/saved-articles", function(data) {
    console.log("in this motha",data);
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
            header.classList.add("card-title","col-7");
            header.innerHTML = data[i].title;
        
            let button = document.createElement("a");
            button.classList.add("btn","btn-dark","col-2");
            button.style.maxWidth = "180px";
            button.style.maxHeight = "39px";
            button.style.marginRight = "10px";
            button.href = "#";
            button.innerText = "ARTICLE NOTES";
            button.setAttribute("data-id",data[i]._id);
            button.onclick = modalBoy;

            let removeButton = document.createElement("a");
            removeButton.classList.add("btn","btn-danger","col-2");
            removeButton.style.maxWidth = "180px";
            removeButton.style.maxHeight = "39px";
            removeButton.style.marginRight = "10px";
            removeButton.href = "#";
            removeButton.innerText = "DELETE FROM SAVED";
            removeButton.setAttribute("data-id",data[i]._id);
            removeButton.onclick = clickBoy;
        
            let subTitle = document.createElement("p");
            subTitle.classList.add("card-text");
            subTitle.innerHTML = element.body || "Asdfasdfas";
        
            //Start building them from the ground up
            secondRow.appendChild(header);
            secondRow.appendChild(button);
            secondRow.appendChild(removeButton);
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
      url: "/unsave-article/" + this.getAttribute("data-id")
    }).then((data) =>{
        console.log(data);
        window.location.reload();
    });
  }
  
const modalBoy = (e) => {
    e.preventDefault();
    console.log(e.target);
    let articleId = e.target.getAttribute("data-id");
    $.ajax({
        method: "GET",
        url: "/articles/" + articleId
    }).then((data) => {
        console.log("We didn't watch what",data.note);
        if(data.note && data.note.body) {
            document.getElementById("notesArea").innerHTML = "";
            let note = document.createElement("div");
            note.classList.add("alert","alert-light","col-lg");
            note.setAttribute("role","alert");
            note.innerText = data.note.body;
            document.getElementById("notesArea").appendChild(note);
            document.getElementById("hideawaySection").style.display = "none";
        }
        else {
            document.getElementById("hideawaySection").style.display = "block";
        }
        document.getElementById("saveNoteButton").setAttribute("data-id",articleId);
        $("#exampleModal").modal('toggle')
    });
}

const noteSubmit = (e) => {
    e.preventDefault();
    $.ajax({
        method: "POST",
        url: "/articles/" + e.target.getAttribute("data-id"),
        data: {
            title: "",
            body: document.getElementById("notePad").value
        }
      }).then(()=>console.log("success"))
}

document.getElementById("saveNoteButton").onclick = noteSubmit;