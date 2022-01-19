import { readBooksFromDB } from './helper.js'
import Book from './classes/Book.js'

const localStorageLibrary = JSON.parse(localStorage.getItem('myLibrary'))

let myLibrary = localStorageLibrary !== null ? localStorageLibrary : await addBooksFromDBToLibrary();
console.log(myLibrary);
updateLocalStorage()
renderBooks();


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
   console.log(typeof bookArray);
   return bookArray
}

function addBookFromInputFormToLibrary(newBook) {
   newBook.id = myLibrary.length + 1
   myLibrary.push(newBook)
}

async function renderBooks() {
   for (let book of myLibrary) {
      const bookContainer = document.createElement('div')
      bookContainer.classList.add('book-card')
      bookContainer.innerHTML = `
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
   }
}

function updateLocalStorage() {
   localStorage.setItem('myLibrary', JSON.stringify(myLibrary))
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
/** 
 * Append newly added book to the grid container
 *  
*/
async function renderNewBook(book) {
   const bookContainer = document.createElement('div')
   bookContainer.classList.add('book-card')
   bookContainer.innerHTML = `
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
}


$(document).ready(function () {
   $('#add-book-card').click(function () {
      $('.modal-container').addClass('show-modal');

   })

   $('#close').click(function () {
      $('.modal-container').removeClass('show-modal');
   })

   $('#modal-form').submit(function (e) {

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
      const newBook = new Book(
         0,
         title,
         author,
         stars,
         pageCount,
         pageCompleted
      )
      alert("New Book Added!")
      addBookFromInputFormToLibrary(newBook)
      renderNewBook(newBook)
      updateLocalStorage()
      //Close the modal
      $('.modal-container').removeClass('show-modal');
      return false;
   })
})
