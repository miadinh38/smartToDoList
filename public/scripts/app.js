// Client facing scripts here

$(document).ready(function () {

  const renderTodos = function (response) {
    const toDoCategory = {
      1: "watch-todo-list",
      2: "eat-todo-list",
      3: "read-todo-list",
      4: "buy-todo-list",
    };

    let $todosList;

    //no data should be displayed initially
    for (const category in toDoCategory) {
      $todosList = $(`#${toDoCategory[category]}`);
      $todosList.empty();
    }

    for (const todo of response.toDos) {
      $todosList = $(`#${toDoCategory[todo.category_id]}`);
      console.log($todosList);
      const element = createToDoElement(todo);
      $todosList.append(element);
    }

    console.log(response);
  };

  const createToDoElement = function (todo) {
    const element = `
    <div class='todo'>
    <h3 class='todo-text'>${todo.name}</h3>
    <button class='delete-todo'>Delete</button>
    <button class='edit-todo'>Edit</button>
    </div>
    `;
    return $(element).data("todo", todo);
  };

  // Define an escape function to safely escape HTML content
  // const escape = function(str) {
  //   let div = document.createElement("div");
  //   div.appendChild(document.createTextNode(str));
  //   return div.innerHTML;
  // };

  //Function to delete a todo
  $(".todo-main-container").on("click", ".delete-todo", function (event) {
    const todoElement = $(this).parent();
    console.log(todoElement);
    const todo = todoElement.data("todo");
    console.log(todo);

    $.ajax({
      url: `/api/todo/${todo.id}`,
      type: "DELETE",
    })
      .done((data) => {
        console.log("delete todo");
        todoElement.remove();
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        if (jqXHR.status === 404) {
          $("body").html(
            "<html><body><h3>You are not logged in. Please <a href='/login'>login</a> or <a href='/sign-up'>register</a> first.</h3></body></html>\n"
          );
        }
        // Handle the failure, log the error
        console.log("Error:", textStatus, errorThrown);
      });
  });

  // Function to edit a todo
  $(".todo-main-container").on("click", ".edit-todo", function (event) {
    console.log("editing");
    // Get the to-do item ID from the data attribute
    const todoElement = $(this).parent();
    console.log(todoElement);
    const todo = todoElement.data("todo");
    console.log(todo);

    // Get the new category ID from the user using prompt
    const newCategoryId = prompt("Enter new category ID:");

    // Send an Ajax request to update the to-do item
    $.ajax({
        url: `/api/todo/${todo.id}`,
        method: "POST",
        data: { categoryId: newCategoryId },
        success: function (editedToDo) {
      
          // Update UI after editing
          const toDoCategory = {
            1: "watch-todo-list",
            2: "eat-todo-list",
            3: "read-todo-list",
            4: "buy-todo-list",
          };
          
          const $todosList = $(`#${toDoCategory[editedToDo.category_id]}`);

          // Remove the existing to-do item from the UI
          todoElement.remove();
    
          // Create a new element for the edited to-do
          const editedToDoElement = createToDoElement(editedToDo);
    
          // Append the new element to the correct category list
          $todosList.append(editedToDoElement);
    
          console.log("To-do item edited successfully", editedToDo);
    
        },
        error: function (error) {
          console.error("Error editing to-do item", error);
        },
    });
});

  // Function to submit the form
  $("#myForm").on("submit", function (event) {
    event.preventDefault();

    $('.add-button').text(`Sorting...`).prop('disabled', true);

    // Slide up error message on click if open
    $('.error-message').slideUp(function() {

      // Serialize the form data
      const todo = $("#myForm").serialize();
      console.log($(this).serialize());

      // Check if submission is empty
      if (todo === 'text=') {
        $('.add-button').text(`Add`).removeAttr('disabled');
        $('.error-message').text(`Entry cannot be blank`).slideDown();
      } else {
        // Make AJAX request
        $.post("/api/todo", todo)
          .then((data) => {
            console.log(data);
            $('.add-button').text(`Add`).removeAttr('disabled');

            // Show error if API replies with an error message
            if (data.message) {
              $('.error-message').text(`Entry could not be categorized.`).slideDown();
            } else {
              $loadTodos();
            }
          })
          .catch((error) => {
            $('.add-button').text(`Add`).removeAttr('disabled');
            $('.error-message').text(`Server error - Please try again.`).slideDown();
          });
      }

      $("#todo-text").val(""); // clear the text after submitting the form
    });
  });

  // Function to load todos
  const $loadTodos = function () {
    console.log("test");
    $.ajax({
      url: "/api/todo",
      method: "GET",
    })
      .done((data) => {
          renderTodos(data);
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        if (jqXHR.status === 401) {
          $("body").html(
            "<html><body><h3>You are not logged in. Please <a href='/login'>login</a> or <a href='/sign-up'>register</a> first.</h3></body></html>\n"
          );
        }
        // Handle the failure, log the error
        console.log("Error:", textStatus, errorThrown);
      });
  };

  $loadTodos();
});
