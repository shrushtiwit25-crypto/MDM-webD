let books=JSON.parse(localStorage.getItem("books"))||[];
let editIndex=-1;

displayBooks();

async function fetchBookCover(title) {

  // Google Books API (Primary)
  try {
    const googleRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`
    );

    const googleData = await googleRes.json();

    if (googleData.items && googleData.items.length > 0) {
      const img = googleData.items[0].volumeInfo.imageLinks?.thumbnail;
      if (img) {
        return img.replace("http://", "https://");
      }
    }
  } catch (e) {
    console.log("Google API Error:", e);
  }

  // Open Library (Fallback)
  try {
    const openRes = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`
    );

    const openData = await openRes.json();

    if (openData.docs && openData.docs.length > 0 && openData.docs[0].cover_i) {
      return `https://covers.openlibrary.org/b/id/${openData.docs[0].cover_i}-L.jpg`;
    }
  } catch (e) {
    console.log("Open Library Error:", e);
  }

  // Final fallback
  return "https://placehold.co/300x450?text=No+Cover";
}

async function saveBook(){

const title=document.getElementById("title").value.trim();
const author=document.getElementById("author").value.trim();
const genre=document.getElementById("genre").value.trim();
const total=parseInt(document.getElementById("totalPages").value);
const current=parseInt(document.getElementById("currentPage").value)||0;
const status=document.getElementById("status").value;
const rating=parseInt(document.getElementById("rating").value);
const review=document.getElementById("review").value.trim();

if(!title||!author||!total){

alert("Please fill all required fields.");
return;

}

const cover=await fetchBookCover(title);

const book={
title,
author,
genre,
total,
current,
status,
rating,
review,
cover
};

if(editIndex===-1){

books.push(book);

}else{

books[editIndex]=book;
editIndex=-1;

}

localStorage.setItem("books",JSON.stringify(books));

clearForm();

displayBooks();

}

function displayBooks(){

const container=document.getElementById("books");

const search=document.getElementById("search").value.toLowerCase();

container.innerHTML="";

let reading=0;
let completed=0;

books.filter(b=>b.title.toLowerCase().includes(search)).forEach((book,index)=>{

const progress=Math.min(100,Math.round(book.current/book.total*100));

if(book.status==="Reading")reading++;
if(book.status==="Completed")completed++;

container.innerHTML+=`

<div class="glass card rounded-3xl overflow-hidden">

<img src="${book.cover}"
class="w-full h-64 object-cover"
onerror="this.src='https://placehold.co/300x450?text=No+Cover'">

<div class="p-5">

<h2 class="text-2xl font-bold">${book.title}</h2>

<p class="text-slate-300 mb-2">${book.author}</p>

<span class="inline-block bg-purple-600 text-xs px-3 py-1 rounded-full mb-3">

${book.genre||"General"}

</span>

<div class="mb-3">

<div class="flex justify-between text-sm">

<span>${book.current}/${book.total} pages</span>

<span>${progress}%</span>

</div>

<div class="bg-slate-700 rounded-full h-3 mt-2">

<div class="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full"
style="width:${progress}%">

</div>

</div>

</div>

<div class="flex justify-between items-center mb-3">

<span class="px-3 py-1 rounded-full text-xs ${book.status==="Completed"?"bg-green-600":"bg-blue-600"}">

${book.status}

</span>

<span>${"⭐".repeat(book.rating)}</span>

</div>

<p class="text-sm text-slate-300 mb-5">

${book.review||"No Review"}

</p>

<div class="flex gap-2">

<button onclick="editBook(${index})"
class="flex-1 bg-yellow-500 py-2 rounded-xl hover:bg-yellow-600">

Edit

</button>

<button onclick="deleteBook(${index})"
class="flex-1 bg-red-600 py-2 rounded-xl hover:bg-red-700">

Delete

</button>

</div>

</div>

</div>

`;

});

document.getElementById("totalBooks").textContent=books.length;
document.getElementById("readingBooks").textContent=reading;
document.getElementById("completedBooks").textContent=completed;

}

function deleteBook(index){

if(confirm("Delete this book?")){

books.splice(index,1);

localStorage.setItem("books",JSON.stringify(books));

displayBooks();

}

}

function editBook(index){

const b=books[index];

document.getElementById("title").value=b.title;
document.getElementById("author").value=b.author;
document.getElementById("genre").value=b.genre;
document.getElementById("totalPages").value=b.total;
document.getElementById("currentPage").value=b.current;
document.getElementById("status").value=b.status;
document.getElementById("rating").value=b.rating;
document.getElementById("review").value=b.review;

editIndex=index;

window.scrollTo({

top:0,
behavior:"smooth"

});

}

function clearForm(){

document.getElementById("title").value="";
document.getElementById("author").value="";
document.getElementById("genre").value="";
document.getElementById("totalPages").value="";
document.getElementById("currentPage").value="";
document.getElementById("review").value="";
document.getElementById("status").value="Reading";
document.getElementById("rating").value="1";

}