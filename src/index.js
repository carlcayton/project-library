import { readBooksFromDB } from './helper.js'
import Book from './classes/Book.js'

let myLibrary = [];


async function addBooksFromDBToLibrary() {
   const books = await readBooksFromDB();
   for (let i = 0; i < books.length; i++) {
      const newBook = new Book(
         books[i].id,
         books[i].title,
         books[i].author,
         books[i].stars,
         books[i].pageCount,
         books[i].pageCompleted
      )
      myLibrary.push(newBook)
   }
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

async function createStarsContainer(stars) {
   let starsContainer = document.createElement('div')
   starsContainer.classList.add('stars-container')
   // Start at 1 up to 6 and check if stars
   // are lower than or equal the current index

   for (let i = 1; i < 5 + 1; i++) {
      var star = document.createElement('span')
      if (i <= stars) {
         star.classList.add('fa', 'fa-star', 'checked')
      } else {
         star.classList.add('fa', 'fa-star')
      }
      starsContainer.appendChild(star)
   }

   return starsContainer.outerHTML
}


await addBooksFromDBToLibrary();
renderBooks();