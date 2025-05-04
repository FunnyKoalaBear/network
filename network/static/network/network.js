
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
                // Adding another <br> tag after the first one for additional spacing
                const secondBrTag = document.createElement("br");
                brTag.parentNode.insertBefore(secondBrTag, brTag.nextSibling);

                //autofilling content area
                const postContentElement = document.getElementById(`postContent-${postID}`);
                const textArea = document.createElement("textarea");
                textArea.id = `editContent-${postID}`;
                textArea.value = content; // Set the current content as the value of the textarea
                postContentElement.parentNode.replaceChild(textArea, postContentElement);
                textArea.setAttribute("rows", "2");
                textArea.style.width = "60%";

                const editButton = document.getElementById(`editButton-${postID}`);
                editButton.innerText = "Save Changes";
                editButton.className = "button"; // Set the class to a general button 
                editButton.style = "color: white;"


            })
            .catch(error => console.error("Error fetching post data:", error))

            
        })
    })

})



// body: JSON.stringify({ 
//     post_id: postID,
//     title: title,
//     content: content
// })