console.log("Script loaded");


// Function to get CSRF token from cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            // If this cookie string begins with the name we want
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


//like post functionality
document.addEventListener("DOMContentLoaded", function() {
    const likeButtons = document.querySelectorAll(".likeButton");
    const csrftoken = getCookie("csrftoken");
    
    //adds an event listener to each like button
    //when the button is clicked, it sends a POST request to the server
    //with the post ID and the CSRF token
    likeButtons.forEach(button => {
        console.log("button loaded");

        button.addEventListener("click", function(event) {
            event.preventDefault(); // Prevent the default action of the button

            const postID = this.getAttribute("data-id");

            //the json data to send
            fetch(`likePost/${postID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({ post_id: postID })
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Server error: ${response.status} — ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                document.getElementById(`likeCount-${postID}`).innerText = data.likes;
            })
            .catch(error => console.error("Error:", error));
              
        })
    })
});


//adding edit button functionality
document.addEventListener("DOMContentLoaded", function() {
    const editButtons = document.querySelectorAll(".editButton");
    const csrftoken = getCookie("csrftoken");

    //adds an event listener to each like button
    //when the button is clicked, it sends a POST request to the server
    //with the post ID and the CSRF token
    editButtons.forEach(button => {
        console.log("edit button loaded");

        //this will do the get method to get post information so we can edit it later
        button.addEventListener("click", function(event) {
            event.preventDefault();

            const postID = button.getAttribute("data-id");
            
            //get the current content and title of the post
            fetch(`editPost/${postID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
            }) 
            .then (response => response.json())

            .then(data => {
                console.log("Fetched data:", data);  // Log the data to see its structure
                //extracting data
                const title = data.title;
                const content = data.content;

                //hiding unnecessary elements when editing post
                document.getElementById(`postInfo-${postID}`).style.display = "none";
                document.getElementById(`likeButton-${postID}`).style.display = "none";
                document.getElementById(`comments-${postID}`).style.display = "none";
                document.getElementById(`likeCount-${postID}`).style.display = "none";

                //autofilling post content 
                document.getElementById(`postTitle-${postID}`).innerText = title
                const changeTitleElement = document.getElementById(`postTitle-${postID}`);
                const inputBox = document.createElement("input");
                inputBox.type = "text";
                inputBox.id = `editTitle-${postID}`;
                inputBox.value = title; 
                changeTitleElement.parentNode.replaceChild(inputBox, changeTitleElement);

                // Adding a <br> tag after the input box for better spacing
                const brTag = document.createElement("br");
                inputBox.parentNode.insertBefore(brTag, inputBox.nextSibling);
                brTag.id = "tag1";
                // Adding another <br> tag after the first one for additional spacing
                const secondBrTag = document.createElement("br");
                brTag.parentNode.insertBefore(secondBrTag, brTag.nextSibling);
                secondBrTag.id = "tag2";

                //autofilling content area
                const postContentElement = document.getElementById(`postContent-${postID}`);
                const textArea = document.createElement("textarea");
                textArea.id = `editContent-${postID}`;
                textArea.value = content; // Set the current content as the value of the textarea
                postContentElement.parentNode.replaceChild(textArea, postContentElement);
                textArea.setAttribute("rows", "2");
                textArea.style.width = "60%";

                //hiding editButton
                const editButton = document.getElementById(`editButton-${postID}`)
                editButton.style = "display: none;"
                //showing saveButton
                const saveButton = document.getElementById(`saveButton-${postID}`)
                saveButton.style = "display: block;"


            })
            .catch(error => console.error("Error fetching post data:", error))

            
        })
    })

})


//adding save edits button functionality 
document.addEventListener("DOMContentLoaded", function() {

    const saveButtons = document.querySelectorAll(".saveButton");
    const csrftoken = getCookie("csrftoken");

    console.log("save button loaded");

    saveButtons.forEach(button =>{

        button.addEventListener("click", function(event) {
            event.preventDefault();
    
            const postID = button.getAttribute("data-id")

            const titleInput = document.getElementById(`editTitle-${postID}`);
            const contentInput = document.getElementById(`editContent-${postID}`);

            const title = titleInput.value;
            const content = contentInput.value;
    
            fetch(`editPost/${postID}`, {
                method: 'POST',
    
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
    
                body: JSON.stringify({ 
                    post_id: postID,
                    title: title,
                    content: content
                })
    
            }) 
            .then (response => response.json())
            
            .then (data => {
                console.log("Saved Data");
        
                
                //doing all the changes to get back usual post view 

                //hiding unnecessary elements when editing post
                document.getElementById(`postInfo-${postID}`).style.display = "block";
                document.getElementById(`likeButton-${postID}`).style.display = "block";
                document.getElementById(`comments-${postID}`).style.display = "block";
                document.getElementById(`likeCount-${postID}`).style.display = "block";

                //returning title to normal
                const changeTitleElement = document.getElementById(`editTitle-${postID}`);
                if (changeTitleElement) {
                    console.log("EXISTSSS")
                    const inputBox = document.createElement("h5");
                    inputBox.type = "h5";
                    inputBox.id = `postTitle-${postID}`;
                    inputBox.innerText = title; 
                    changeTitleElement.parentNode.replaceChild(inputBox, changeTitleElement);

                }

                //removing br 
                const BrTag = document.getElementById(`tag1`);
                if (BrTag) {
                    BrTag.style = "display: none;";
                }
                const secondBrTag = document.getElementById(`tag2`);
                if (secondBrTag) {
                    secondBrTag.style = "display: none;";
                }

                //returning content to normal 
                const changeContentElement = document.getElementById(`editContent-${postID}`);
                if (changeContentElement) {
                    console.log("text area exists")
                    const contentBox = document.createElement("p")
                    contentBox.type = "p"
                    contentBox.id = `postContent-${postID}`;
                    contentBox.innerText = content;
                    changeContentElement.parentNode.replaceChild(contentBox, changeContentElement);

                }
                
                

                //showing editButton
                const editButton = document.getElementById(`editButton-${postID}`)
                editButton.style = "display: block; color: rgb(53, 53, 167); "
                //hiding saveButton
                const saveButton = document.getElementById(`saveButton-${postID}`)
                saveButton.style = "display: none;"
                
                
            })
            .catch(error => console.error("Error fetching post data:", error))
            
        })

    })


})



