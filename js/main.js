const localStorageKey = "bookshelf";
const sessionStorageKey = "edited-bookshelf";
const RENDER_BOOK = "render-book";

const formAdd = document.getElementById("bookForm");
const bookTitle = document.getElementById("bookFormTitle");
const bookAuthor = document.getElementById("bookFormAuthor");
const bookYear = document.getElementById("bookFormYear");
const bookComplete = document.getElementById("bookFormIsComplete");
const btnAdd = document.getElementById("bookFormSubmit");
const formFind = document.getElementById("searchBook");
const findInput = document.getElementById("searchBookTitle");
const btnFind = document.getElementById("searchSubmit");
const bookList = document.querySelectorAll(".book-list div[id]");

/***Mengubah JSON String*/
const setJSON = (str) => {
  return JSON.stringify(str);
};

/***Mengubah String menjadi JSON */
const getJSON = (jsn) => {
  return JSON.parse(jsn);
};

/***Mengambil atau mengubah localStorage*/
const GetSet_DataLocal = (gs, val = "") => {
  if (gs === "get") return localStorage.getItem(localStorageKey);
  else if (gs === "set") localStorage.setItem(localStorageKey, val);
};

/***Mengambil atau mengubah sessionStorage*/
const GetSet_DataSession = (gs, id = "") => {
  if (gs === "get") return sessionStorage.getItem(sessionStorageKey);
  else if (gs === "set") sessionStorage.setItem(sessionStorageKey, id);
};

/***Generate data*/
const dataGenerate = (
  title,
  author,
  year,
  isComplete,
  id = new Date().getTime()
) => {
  return {
    id,
    title,
    author,
    year: parseInt(year),
    isComplete,
  };
};

if (typeof Storage !== "undefined") {
  let bookData = [];

  /***Mengisi data tampilan dari localStorage*/
  if (GetSet_DataLocal("get") !== null) {
    bookData = getJSON(GetSet_DataLocal("get"));
  }
  /***Ketika menekan tombol belum selesai dibaca akan mengubah data localStorage isComplete menjadi false
   * lalu mengembalikan object dengan nilai id:0 yaitu untuk index selector book-list
   * dan text: "Selesai Dibaca" pada tombolbagian Belum Selesai Dibaca. Begitu pula sebaliknya*/
  const completeData = (data) => {
    if (data.isComplete) {
      data.isComplete = false;
      return { id: 0, text: "Selesai dibaca" };
    } else {
      data.isComplete = true;
      return { id: 1, text: "Belum Selesai dibaca" };
    }
  };

  /***Menghapus data*/
  const deleteData = (data) => {
    const cntInd = bookData.findIndex((itm) => itm.id === data.id);
    if (cntInd !== -1) {
      bookData.splice(cntInd, 1);
    }
    GetSet_DataLocal("set", setJSON(bookData));

    document.dispatchEvent(new Event(RENDER_BOOK));
  };

  /***Membuat konten item buku*/
  const bookListContent = (bookItemData, bookListId, editedItem = false) => {
    const bookItemWrap = document.createElement("div");
    bookItemWrap.setAttribute("data-bookid", bookItemData.id);
    bookItemWrap.setAttribute("data-testid", "bookItem");

    bookItemWrap.innerHTML = `
            <h3 data-testid="bookItemTitle">${bookItemData.title}</h3>
            <p data-testid="bookItemAuthor">Penulis: ${bookItemData.author}</p>
            <p data-testid="bookItemYear">Tahun: ${bookItemData.year}</p>
            `;

    const btnWrap = document.createElement("div");
    const btnCompl = document.createElement("button");

    btnCompl.textContent = `${
      bookItemData.isComplete ? "Belum " : ""
    }Selesai dibaca`;
    btnCompl.setAttribute("data-testid", "bookItemIsCompleteButton");

    const btnDel = document.createElement("button");
    btnDel.textContent = "Hapus Buku";
    btnDel.setAttribute("data-testid", "bookItemDeleteButton");

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Edit Buku";
    btnEdit.setAttribute("data-testid", "bookItemEditButton");

    btnWrap.appendChild(btnCompl);
    btnWrap.appendChild(btnDel);
    btnWrap.appendChild(btnEdit);

    bookItemWrap.appendChild(btnWrap);

    const formEdit = document.createElement("form");
    const cancleBtn = document.createElement("button");
    cancleBtn.textContent = "Batal";
    cancleBtn.className = "cancle-btn";

    const inputEditTitle = document.createElement("input");
    const inputEditAuthor = document.createElement("input");
    const inputEditYear = document.createElement("input");
    inputEditYear.setAttribute("type", "number");

    /***Membuat div wraper untuk input form edit*/
    const editInputWrap = (label, el) => {
      const wraperInput = document.createElement("div");
      const labelEdit = document.createElement("label");
      labelEdit.textContent = label;
      wraperInput.appendChild(labelEdit);
      wraperInput.appendChild(el);
      return wraperInput;
    };

    formEdit.appendChild(editInputWrap("Judul", inputEditTitle));
    formEdit.appendChild(editInputWrap("Penulis", inputEditAuthor));
    formEdit.appendChild(editInputWrap("Tahun", inputEditYear));

    /***Membuat form untuk edit*/
    const formEditMaker = () => {
      formEdit.buttonFunctional = false; //indikator form edit
      btnEdit.setAttribute("style", "display:none"); //jika buttonFunctional bernilai false maka tombol edit akan hilang sementara. jika true maka tombol edit akan muncul
      btnEdit.textContent = "Simpan Edit";

      bookItemWrap.isEdited = true; //indikator keteranganitem buku yang diedit jika bernilai true maka muncul class edited dan keterangan akan hilang sementara
      bookItemWrap.className = "edited";

      bookItemWrap.insertBefore(formEdit, bookItemWrap.firstChild); //form edit ditaruh sebelum keterangan item buku

      btnWrap.insertBefore(cancleBtn, btnWrap.firstChild); //tombol batal ditaruh sebelum tombol yg ada sebelumnya

      btnWrap.className = "edited-btn"; //tombol turunan class tersebut akan hilang semntara yaitu tombol selesai baca dan hapus

      /***Mengambil data buku yang sedang diedit tapi belum disimpan pada sessionStorage*/
      const dataFromSession = getJSON(GetSet_DataSession("get"));

      inputEditTitle.value = editedItem
        ? dataFromSession.title
        : bookItemData.title;
      inputEditAuthor.value = editedItem
        ? dataFromSession.author
        : bookItemData.author;
      inputEditYear.value = editedItem
        ? dataFromSession.year
        : bookItemData.year;

      if (
        editedItem &&
        dataFromSession.wasEdited &&
        !formEdit.buttonFunctional
      ) {
        formEdit.buttonFunctional = true;
        btnEdit.style = "";
      }

      const FORM_EDIT_HANDLER = "formEditHandler";
      const formEditEvent = new Event(FORM_EDIT_HANDLER);
      let editInput = getJSON(GetSet_DataSession("get"));

      /**Menyimpan data yang diedit pada sessionStorage */
      document.addEventListener(FORM_EDIT_HANDLER, () => {
        const dataWasEdited = dataGenerate(
          inputEditTitle.value.trim(),
          inputEditAuthor.value.trim(),
          inputEditYear.value,
          bookItemData.isComplete,
          bookItemData.id
        );

        dataWasEdited.wasEdited = true;

        GetSet_DataSession("set", setJSON(dataWasEdited));

        if (
          !formEdit.buttonFunctional &&
          (editInput.title !== dataWasEdited.title ||
            editInput.author !== dataWasEdited.author ||
            editInput.year !== dataWasEdited.year)
        ) {
          formEdit.buttonFunctional = true;
          btnEdit.style = "";
        }
      });

      formEdit.addEventListener("keyup", () => {
        document.dispatchEvent(formEditEvent);
      });
      formEdit.addEventListener("change", () =>
        document.dispatchEvent(formEditEvent)
      );
      formEdit.addEventListener("paste", () =>
        document.dispatchEvent(formEditEvent)
      );
    };

    /**Menghapus tampilan form edit */
    const editFormRemover = () => {
      btnEdit.textContent = "Edit Buku";
      bookItemWrap.isEdited = false;
      formEdit.buttonFunctional = false;
      bookItemWrap.classList.remove("edited");
      btnWrap.classList.remove("edited-btn");
      formEdit.remove();
      cancleBtn.remove();
      sessionStorage.removeItem(sessionStorageKey);
    };

    /**Untuk menampilkan form edit jika terjadi edit item */
    if (editedItem) {
      formEditMaker();
    }

    /**Tombol untuk memindah ketika buku selesai atau belum selesai dibaca */
    btnCompl.addEventListener("click", () => {
      const completeBook = completeData(bookItemData);

      btnCompl.textContent = completeBook.text;
      bookList[completeBook.id].appendChild(bookItemWrap);
      GetSet_DataLocal("set", setJSON(bookData));
    });

    /**Tombol untuk menghapus item buku*/
    btnDel.addEventListener("click", () => {
      deleteData(bookItemData);
    });

    /**Tombol untuk mengedit buku */
    btnEdit.addEventListener("click", () => {
      sessionStorage.removeItem(sessionStorageKey);

      if (bookItemWrap.isEdited) {
        //Menyimpan dan menampilkan hasil edit buku

        if (formEdit.buttonFunctional) {
          bookItemData.title = inputEditTitle.value;
          bookItemData.author = inputEditAuthor.value;
          bookItemData.year = inputEditYear.value;
          GetSet_DataLocal("set", setJSON(bookData));
        }

        document.querySelector(".edited h3").textContent = bookItemData.title;
        document.querySelectorAll(".edited p")[0].textContent =
          bookItemData.author;
        document.querySelectorAll(".edited p")[1].textContent =
          bookItemData.year;

        editFormRemover();
      } //
      else {
        //Manapilkan form edit
        const editedClass = document.querySelector(".edited");
        const editedFormElement = document.querySelector(".edited form");
        const editButtonElement = document.querySelector(
          '.edited [data-testid="bookItemEditButton"]'
        );
        const cancleEditedClass = document.querySelector(".edited-btn");

        if (editedClass && editedFormElement) {
          //Menghilangkan form edit sebelumnya jika ada
          editedClass.isEdited = false;
          editedFormElement.remove();
          document.querySelector(
            '.edited button[data-testid="bookItemEditButton"]'
          ).textContent = "Edit Buku";
          document.querySelector(".cancle-btn").remove();
          editedClass.classList.remove("edited");
          cancleEditedClass.classList.remove("edited-btn");
          editButtonElement.style = "";
        }

        GetSet_DataSession("set", setJSON(bookItemData));
        formEditMaker();
      }
    });

    /**Membatalkan form edit*/
    cancleBtn.addEventListener("click", () => {
      editFormRemover();
      btnEdit.style = "";
    });

    bookList[bookListId].appendChild(bookItemWrap); //bookListId jika bernilai 0 maka ke selector Belum selesai dibaca. Jika 1 maka ke selector Selesai dibaca
  };

  /**Menambah data buku baru */
  const addBookData = () => {
    const newData = dataGenerate(
      bookTitle.value.trim(),
      bookAuthor.value.trim(),
      bookYear.value,
      bookComplete.checked
    );

    bookData.push(newData);
    GetSet_DataLocal("set", setJSON(bookData));
    bookTitle.value = "";
    bookAuthor.value = "";
    bookYear.value = 20;
    bookComplete.checked = false;

    document.dispatchEvent(new Event(RENDER_BOOK));
  };

  document.addEventListener("DOMContentLoaded", () => {
    formAdd.addEventListener("submit", (e) => {
      e.preventDefault();
      addBookData();
    });

    const domReadyEvent = new Event(RENDER_BOOK);
    document.dispatchEvent(domReadyEvent);
  });

  /**Mencari buku berdasar salah satu kata */
  formFind.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchInput = document.createElement("div");
    const searchQuery = findInput.value.trim();

    const boolSearch = (obj) =>
      obj.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (bookData.length > 0 && searchQuery.length > 0) {
      const bookSection = document.querySelector(".book-list");

      searchInput.className = "search-dialog";
      bookSection.parentNode.insertBefore(searchInput, bookSection);
      document.querySelector(
        ".search-dialog"
      ).innerHTML = `<span>Hasil dari pencarian judul <b>${searchQuery}</b></span> <a href="./index.html">reload</a> `;

      bookList[0].innerHTML = "";
      bookList[1].innerHTML = "";
      bookData.forEach((sc) => {
        if (sc.isComplete) {
          if (boolSearch(sc)) bookListContent(sc, 1);
        } else {
          if (boolSearch(sc)) bookListContent(sc, 0);
        }
      });
    }
  });

  /**Render tampilan buku */
  document.addEventListener(RENDER_BOOK, () => {
    bookList[0].innerHTML = "";
    bookList[1].innerHTML = "";
    if (bookData.length > 0) {
      bookData.forEach((bd) => {
        const idSession =
          GetSet_DataSession("get") === null
            ? false
            : bd.id == getJSON(GetSet_DataSession("get")).id;
        if (bd.isComplete) bookListContent(bd, 1, idSession);
        else bookListContent(bd, 0, idSession);
      });
    }
  });
} else alert("browser tidak mendukung");
