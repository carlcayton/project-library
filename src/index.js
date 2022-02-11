import { readBooksFromDB } from './helper.js'
import Book from './classes/Book.js'

const localStorageLibrary = JSON.parse(localStorage.getItem('myLibrary'))
let myLibrary = localStorageLibrary !== null ? localStorageLibrary : await addBooksFromDBToLibrary();
let currentlyEditingBookID = null;
let searchResults = []



updateLocalStorage()
renderAllBooks();

document.getElementById('logo').addEventListener('click', function (e) {
   e.event;
   window.location.reload();
   searchResults = []
})

//Trigger searchBook
document.getElementById('search-button').addEventListener('click', searchBook)
document.getElementById('search-input').addEventListener('keyup', function (e) {
   if (e.key === 'Enter') {
      searchBook()
   }
})

// Query the user search, save it on global var and pass it to render function
function searchBook() {
   searchResults = []
   let searchQueryRaw = document.getElementById('search-input').value
   let searchQuery = searchQueryRaw.toLowerCase()
   if (searchQuery == "") {
      return
   }
   for (let book of myLibrary) {
      const title = book.title.toLowerCase()
      const author = book.author.toLowerCase()
      if (title.includes(searchQuery) || author.includes(searchQuery)) {
         searchResults.push(book)
      }
   }

   let searchQueryDetail = document.getElementById('search-query-detail')
   searchQueryDetail.textContent = `Found ${searchResults.length} search result/s for search - "${searchQueryRaw}"`
   renderSearchResults(searchResults)
}

function renderSearchResults(searchResults) {
   $(".grid-container > *").remove()
   for (let book of searchResults) {
      renderBook(book);
   }
}


async function addBooksFromDBToLibrary() {
   const books = await readBooksFromDB();
   let bookArray = []
   for (let i = 0; i < books.length; i++) {
      const newBook = new Book(
         books[i].id,
         books[i].title,
         books[i].author,
         books[i].stars,
         books[i].pageCount,
         books[i].pageCompleted
      )
      bookArray.push(newBook)
   }
   return bookArray
}



function addBookFromInputFormToLibrary(newBook) {
   newBook.id = myLibrary.length + 1
   myLibrary.push(newBook)
}



async function renderAllBooks() {
   //Remove all elements except add-book-card and its children
   $(".grid-container > *:not('#add-book-card')").remove()
   for (let book of myLibrary) {
      renderBook(book)
   }
}

function updateLocalStorage() {
   localStorage.setItem('myLibrary', JSON.stringify(myLibrary))
}

function bindEditAndDeleteFunc(book) {
   let editBtn = document.getElementById(`edit-${book.id}`)
   editBtn.addEventListener('click', editBook, false)
   editBtn.myParam = book;

   let deleteBtn = document.getElementById(`delete-${book.id}`)
   deleteBtn.addEventListener(`click`, deleteBook, false)
   deleteBtn.myParam = book;
}

function editBook(event) {
   let book = event.currentTarget.myParam;
   $('.modal-container').addClass('show-modal');
   $('#title-input').val(book.title)
   $('#author-input').val(book.author);
   $('#pageCount').val(book.pageCount)
   $('#pageCompleted').val(book.pageCompleted)
   currentlyEditingBookID = book.id
}

function deleteBook(event) {
   let book = event.currentTarget.myParam;
   myLibrary = myLibrary.filter(obj => obj.id !== book.id)

   updateLocalStorage()
   if (searchResults.length > 0) {
      searchResults = searchResults.filter(obj => obj.id !== book.id)
      renderSearchResults(searchResults)
      return
   }
   renderAllBooks()
}

function saveBookEditToLibrary(book) {
   myLibrary = myLibrary.map(obj => (obj.id === book.id ? book : obj))
}

/** 
 * Append book to the grid container
*/
async function renderBook(book) {

   let bookContainer = document.createElement('div')
   bookContainer.classList.add('book-card')
   bookContainer.innerHTML = `
      <div class="book-card-btns-container">
         <button class="edit-btn" id="edit-${book.id}"
          title="Edit Book" >
            <i class="fas fa-edit"></i>
         </button>
         <button class="delete-btn" id="delete-${book.id}" title="Delete Book">
            <i class="fas fa-trash"></i>
         </button>
      </div>
      <h3 class="book-title">${(book.title)}</h3>
      <h4 class="book-author">${book.author}</h4>
      ${await createStarsContainer(book.stars)}
      <span class="book-pageCount">
      ${book.pageCount} Pages
      </span>
      `

   let bookProgressContainer = document.createElement('div')
   bookProgressContainer.classList.add('book-progress')
   let bookCompletedPercent = (book.pageCompleted / book.pageCount).toFixed(2) * 100;
   bookProgressContainer.style.background = `linear-gradient(to right, #7EDD51 ${bookCompletedPercent}%, transparent 0)`

   // bookProgressContainer.style.backgroundColor = '#DD517E'
   bookProgressContainer.innerHTML = `
   <span>
      ${bookCompletedPercent}%
   </span>
   `
   bookContainer.appendChild(bookProgressContainer)
   $('.grid-container').append(
      bookContainer
   )
   bindEditAndDeleteFunc(book)
}


/**
 * Create a star container that contains the star rating of the book
 * @param {*} stars - number of star ratings
 * @returns 
 */
async function createStarsContainer(stars) {
   let starsContainer = document.createElement('div')
   starsContainer.classList.add('stars-container')
   // Start at 1 up to 6 and check if stars
   // are lower than or equal the current index

   for (let i = 1; i < 5 + 1; i++) {
      var star = document.createElement('span')
      if (i <= stars) {
         star.classList.add('fas', 'fa-star', 'checked')
      } else {
         star.classList.add('fas', 'fa-star')
      }
      starsContainer.appendChild(star)
   }

   return starsContainer.outerHTML
}

function getModalValuesAsBook() {
   const title = $('#title-input').val()
   const author = $('#author-input').val();
   let stars = $('.modal-star-container input[type=radio]:checked').attr('id')
   if (!stars) {
      Swal.fire("Add star rating to the book!")
      return false
   }
   stars = parseInt(stars[stars.length - 1])
   stars = (5 - stars) + 1;

   const pageCount = parseInt($('#pageCount').val())
   const pageCompleted = parseInt($('#pageCompleted').val())
   if (pageCompleted > pageCount) {
      Swal.fire("Page completed should be less than book's page count!")
      return false;
   }
   const book = new Book(
      currentlyEditingBookID,
      title,
      author,
      stars,
      pageCount,
      pageCompleted
   )
   return book
}



$(document).ready(function () {
   $('#add-book-card').click(function () {
      $('.modal-container').addClass('show-modal');
      $('#modal-form').trigger("reset")
   })

   $('#close').click(function () {
      $('.modal-container').removeClass('show-modal');
      currentlyEditingBookID = null
   })


   $('#modal-form').submit(function (e) {

      let book = getModalValuesAsBook()
      if (currentlyEditingBookID === null) {
         addBookFromInputFormToLibrary(book)
      } else {
         saveBookEditToLibrary(book)
      }
      updateLocalStorage()
      if (searchResults.length > 0) {
         searchResults = searchResults.map(obj => (obj.id === book.id ? book : obj))
         renderSearchResults(searchResults)
         $('.modal-container').removeClass('show-modal');
         return false
      }
      renderAllBooks()

      //Close the modal
      $('.modal-container').removeClass('show-modal');
      return false;
   })
})



