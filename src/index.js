import { readBooksFromDB } from './helper.js'
import Book from './classes/Book.js'

const localStorageLibrary = JSON.parse(localStorage.getItem('myLibrary'))

let myLibrary = localStorageLibrary !== null ? localStorageLibrary : await addBooksFromDBToLibrary();
updateLocalStorage()
renderAllBooks();

let currentlyEditingBookID = null;


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

function saveBookEditToLibrary(book) {
   myLibrary = myLibrary.map(obj => (obj.id === book.id ? book : obj))
   // ; (obj.id !== book.id ? obj : book)

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

}




/** 
 * Append book to the grid container
*/
async function renderBook(book) {

   const bookContainer = document.createElement('div')
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
      <h3 class="book-title">${book.title}</h3>
      <h4 class="book-author">${book.author}</h4>
      ${await createStarsContainer(book.stars)}
      <span class="book-pageCount">
      ${book.pageCount} Pages
      </span>
      `
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
   stars = parseInt(stars[stars.length - 1])
   stars = (5 - stars) + 1;
   const pageCount = parseInt($('#pageCount').val())
   const pageCompleted = parseInt($('#pageCompleted').val())
   if (pageCompleted > pageCount) {
      alert("Page completed should be less than book's page count!")
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
      renderAllBooks()

      //Close the modal
      $('.modal-container').removeClass('show-modal');
      return false;
   })
})


