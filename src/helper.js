export async function readBooksFromDB() {
   const JSON_PATH = '../assets/data/books.json'
   const res = await fetch(JSON_PATH, { mode: 'no-cors' })
   const data = await res.json();
   return data["booksInfo"];
}
