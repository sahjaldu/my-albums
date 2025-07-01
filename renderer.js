const client_id                     = '3e32b0815b2145a1b59dc82f53fbd0df';
const client_secret                 = 'db5ee978c19d41959c9d1ae1c0e53335';

const filterAlbumBtn                = document.getElementById("filter-album-button");
const sortAlbumBtn                  = document.getElementById("sort-album-button");
const searchInput                   = document.getElementById("search-input");

const filterOptions                 = document.getElementById("filter-options");
const filterTimeSlider              = document.getElementById("filter-time-slider");
const filterTimeSliderLabel         = document.getElementById("filter-time-slider-label");
const filterFavoriteButton          = document.getElementById("filter-favorite-button");
const filterFavoriteButtonLabel     = document.getElementById("filter-favorite-button-label");

const sortOptions                   = document.getElementById("sort-options");
const sortDateNew                   = document.getElementById("date-new");
const sortDateOld                   = document.getElementById("date-old");
const sortNameFront                 = document.getElementById("name-first");
const sortNameBack                  = document.getElementById("name-last");

const openAlbumPopupBtn             = document.getElementById("add-album-button");
const addAlbumPopup                 = document.getElementById("add-album-popup");
const closeAlbumPopupBtn            = document.getElementById("close-popup");
const submitLinkBtn                 = document.getElementById("submit-link");
const linkInput                     = document.getElementById("album-link-input");
const dateListenedInput             = document.getElementById("album-date-input");
const favoriteInput                 = document.getElementById("album-favorite-checkbox");
const commentsInput                 = document.getElementById("album-comments-input");

const albumImages                   = document.querySelectorAll(".album");
const albumInfoPopup                = document.getElementById("album-info-popup");
const albumInfoCover                = document.getElementById("album-info-cover");
const albumInfoTitle                = document.getElementById("album-info-title");
const albumInfoLink                 = document.getElementById("album-info-link");
const albumInfoArtist               = document.getElementById("album-info-artist");
const albumInfoDateListenedText     = document.getElementById("album-info-date-listened-text");
const albumInfoDateListenedInput    = document.getElementById("album-info-date-listened-input");
const albumInfoCommentsText         = document.getElementById("album-info-comments-text");
const albumInfoCommentsInput        = document.getElementById("album-info-comments-input");
const albumInfoFavoriteText         = document.getElementById("album-info-favorite-text");
const albumInfoFavoriteInput        = document.getElementById("album-info-favorite-input");
const albumInfoFavoriteInputStar    = document.getElementById("album-info-favorite-input-star");
const albumInfoModeBtn              = document.getElementById("album-info-mode");
const albumInfoSaveBtn              = document.getElementById("album-info-save");
const albumInfoDeleteBtn            = document.getElementById("album-info-delete");
const albumInfoCloseBtn             = document.getElementById("album-info-close");

const textPopup                     = document.getElementById("text-popup");

//return token based on client_id and client_secret
async function getToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' })
    });

    const data = await response.json();
    return data.access_token;
}

//returns album based on link in JSON format
async function retrieveAlbumData(link) {
    const raw_id = link.substring(link.indexOf("album/") + 6);
    const id = raw_id.split('?')[0];
    const token = await getToken();
    const response = await fetch(
        'https://api.spotify.com/v1/albums/' + id,
        { headers: { 'Authorization': 'Bearer ' + token }
    });
    
    return await response.json();
}

async function insertAlbum(link, date_listened=new Date().getDate(), favorite=false, description="") {
    try {
        const albums = window.versions.readAlbums();
        const raw_album = await retrieveAlbumData(link);

        console.log(raw_album);

        if (albums.some(a => a.name === raw_album.name) && albums.some(a => a.artist === raw_album.artists[0].name)) {
            openTextPopup("This album is already here!");
            return;
        }

        const album = {
            "name": raw_album.name,
            "cover": raw_album.images[0].url,
            "artist": raw_album.artists[0].name,
            "link": raw_album.external_urls.spotify,
            "date_listened": date_listened,
            "favorite": favorite,
            "description": description
        }

        console.log("Album retrieved:", album);
        window.versions.writeAlbum(album);
        //Put album into albums.json

    } catch (err) {
        console.error("Failed to load album:", err);
    }
}

function openInfo(album) {
    albumInfoCover.src = album.cover;
    albumInfoTitle.textContent = album.name;
    albumInfoLink.href = album.link;
    albumInfoArtist.textContent = album.artist;
    albumInfoDateListenedText.textContent = new Date(album.date_listened).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    albumInfoDateListenedInput.value = new Date(album.date_listened).toISOString().split('T')[0];
    albumInfoCommentsText.textContent = album.description;
    albumInfoCommentsInput.value = album.description;
    if (album.favorite) {
        albumInfoFavoriteText.textContent = '★';
        albumInfoFavoriteInput.checked = true;
    }
    else {
        albumInfoFavoriteText.textContent = '';
        albumInfoFavoriteInput.checked = false;
    }
    albumInfoPopup.classList.remove("hide");
}

function processAlbums() {
    let albums = window.versions.readAlbums();
    if (searchInput.value) {
        albums = albums.filter(a => 
            a.name.toLowerCase().includes(searchInput.value) || a.name.includes(searchInput.value)
            // || a.artist.toLowerCase().includes(searchInput.value)
        );
        console.log(albums);
    }
    if (filterFavoriteButtonLabel.textContent !== '') {
        albums = albums.filter(a => a.favorite)
    }
    const today = new Date();
    switch (parseInt(filterTimeSlider.value)) {
        case 1: {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(today.getFullYear() - 1);
            albums = albums.filter(a => new Date(a.date_listened) >= oneYearAgo );
            break;
        }
        case 2: {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(today.getMonth() - 6);
            albums = albums.filter(a => new Date(a.date_listened) >= sixMonthsAgo);
            break;
        }
        case 3: {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(today.getMonth() - 1);
            albums = albums.filter(a => new Date(a.date_listened) >= oneMonthAgo);
            break;
        }
        case 4: {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(today.getDate() - 7);
            albums = albums.filter(a => new Date(a.date_listened) >= oneWeekAgo);
            break;
        }
        default:
            break;
    }

    if (sortDateNew.checked) {
        albums = albums.sort((a, b) => new Date(b.date_listened) - new Date(a.date_listened));
    }
    else if (sortDateOld.checked) {
        albums = albums.sort((a, b) => new Date(a.date_listened) - new Date(b.date_listened));
    }
    else if (sortNameFront.checked) {
        albums = albums.sort((a, b) => a.name.localeCompare(b.name));
    }
    else if (sortNameBack.checked) {
        albums = albums.sort((a, b) => b.name.localeCompare(a.name));
    }

    loadAlbums(albums);
}

function loadAlbums(albums) {
    const album_container = document.getElementById("album-container");
    console.log("Loaded albums:", albums);
    album_container.innerHTML = "";
    albums.forEach(function(album) {
        // Create album image on main screen
        const album_image = document.createElement("img");
        album_image.src = album.cover;
        album_image.name = album.name;
        album_image.classList.add("album");
        
        // Make open infoPanel when clicked
        album_image.addEventListener('click', () => {
            const album = albumDataSearch(album_image.getAttribute("name"));
            if (album) openInfo(album);
        });

        album_container.appendChild(album_image);
    });
}

processAlbums();

// TEXT POPUP

function openTextPopup(text, button) {
    textPopup.innerHTML = '';
    textPopup.classList.remove("hide");
    const textElement = document.createElement("p");
    textElement.textContent = text;
    textPopup.appendChild(textElement);
    if (button instanceof HTMLElement) {
        textPopup.appendChild(button);
    }
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", () => {
        textPopup.classList.add("hide");
    });
    textPopup.appendChild(closeButton);
}


// ADD ALBUM BUTTON
openAlbumPopupBtn.addEventListener("click", () => {
    if (addAlbumPopup.classList.contains("hide") && albumInfoPopup.classList.contains("hide")) {
        addAlbumPopup.classList.remove("hide");
    }
    linkInput.value = "";
    dateListenedInput.value = "";
    favoriteInput.checked = false;
    commentsInput.value = "";
});


closeAlbumPopupBtn.addEventListener("click", () => {
    if (!addAlbumPopup.classList.contains("hide")) {
        addAlbumPopup.classList.add("hide");
    }
});

submitLinkBtn.addEventListener("click", async () => {
    const link = linkInput.value.trim();
    let date = dateListenedInput.value.trim();
    if(!date) {
        date = new Date().toISOString().split('T')[0];
    }
    else {
        date = new Date(date).toISOString().split('T')[0];
    }
    const favorite = favoriteInput.checked;
    const comments = commentsInput.value;

    if (!link) return;
    try {
        await insertAlbum(link, date, favorite, comments);
        processAlbums();
        if (!addAlbumPopup.classList.contains("hide")) {
            addAlbumPopup.classList.add("hide");
        }
    }
    catch (err) {
        console.error("Failed to add album:", err);
        alert("Failed to add album. Check the link and try again.");
    }
});

// ALBUM INFO POPUP

function albumDataSearch(name) {
    const albums = window.versions.readAlbums();
    for (const album of albums) {
        if (album.name == name) {
            console.log("found it", album);
            return album;
        }
    }
    console.log("Did not find an album.");
}

function switchInfoMode(mode) {
    if (mode == 'text') {
        // Hide input versions
        albumInfoDateListenedText.classList.remove('hide');
        albumInfoFavoriteText.classList.remove('hide');
        albumInfoCommentsText.classList.remove('hide');

        // Unhide text versions
        albumInfoDateListenedInput.classList.add('hide');
        albumInfoFavoriteInput.classList.add('hide');
        albumInfoFavoriteInputStar.classList.add('hide');
        albumInfoCommentsInput.classList.add('hide');

        // Change buttons
        albumInfoSaveBtn.classList.add('hide');
        albumInfoDeleteBtn.classList.add('hide');
        // albumInfoModeBtn.classList.remove('hide');
        // albumInfoCloseBtn.classList.add('hide');
    }
    if (mode == 'input') {
        // Hide text versions
        albumInfoDateListenedText.classList.add('hide');
        albumInfoFavoriteText.classList.add('hide');
        albumInfoCommentsText.classList.add('hide');

        // Unhide input versions
        albumInfoDateListenedInput.classList.remove('hide');
        albumInfoFavoriteInput.classList.remove('hide');
        albumInfoFavoriteInputStar.classList.remove('hide');
        albumInfoCommentsInput.classList.remove('hide');

        // Change buttons
        albumInfoSaveBtn.classList.remove('hide');
        albumInfoDeleteBtn.classList.remove('hide');
        // albumInfoModeBtn.classList.add('hide');
        // albumInfoCloseBtn.classList.add('hide');
    }
}

albumInfoCloseBtn.addEventListener('click', () => {
    if (!albumInfoPopup.classList.contains("hide")) {
        albumInfoPopup.classList.add("hide");
    }
    switchInfoMode('text');

});

albumInfoModeBtn.addEventListener('click', () => {
    if (albumInfoSaveBtn.classList.contains('hide')) {
        switchInfoMode('input');
    }
    else {
        switchInfoMode('text');
    }
});

albumInfoSaveBtn.addEventListener('click', () => {
    const yesButton = document.createElement("button");
    yesButton.textContent = "Yes";
    yesButton.addEventListener("click", () => {
        const updated_data  = {
            name: albumInfoTitle.textContent,
            date_listened: albumInfoDateListenedInput.value.trim(),
            favorite: albumInfoFavoriteInput.checked,
            description: albumInfoCommentsInput.value
        };
        // console.log(updated_data);
        window.versions.updateAlbum(updated_data);
        textPopup.classList.add("hide");
        switchInfoMode('text');
        openInfo(albumDataSearch(albumInfoTitle.textContent));
        processAlbums();
    });
    openTextPopup("Are you sure you want to override album data?", yesButton);
});

albumInfoDeleteBtn.addEventListener('click', () => {
    const yesButton = document.createElement("button");
    yesButton.textContent = "Yes";
    yesButton.addEventListener("click", () => {
        window.versions.deleteAlbum(albumInfoTitle.textContent);
        textPopup.classList.add("hide");
        switchInfoMode('text');
        albumInfoPopup.classList.add('hide');
        processAlbums();
    });
    openTextPopup("Are you sure you want to delete this album? It cannot be undone.", yesButton);
});

// FILTERS

searchInput.addEventListener('input', processAlbums);

filterAlbumBtn.addEventListener('click', () => {
    if (filterOptions.classList.contains('hide')) {
        filterOptions.classList.remove('hide');
    }
    else {
        filterOptions.classList.add('hide');
    }
});

function updateSliderLabel() {
    const options = ["All Time", "Last Year", "Last 6 Months", "Last Month", "Last Week"];
    filterTimeSliderLabel.textContent = options[filterTimeSlider.value];
    processAlbums();
}

updateSliderLabel();

filterTimeSlider.addEventListener("input", () => {
    updateSliderLabel();
    processAlbums();
});

filterFavoriteButton.addEventListener('click', () => {
    if (filterFavoriteButtonLabel.textContent == "") {
        filterFavoriteButtonLabel.textContent = "---  Favorite";
    }
    else {
        filterFavoriteButtonLabel.textContent = "";
    }
    processAlbums();
});

sortAlbumBtn.addEventListener('click', () => {
    if (sortOptions.classList.contains('hide')) {
        sortOptions.classList.remove('hide');
    }
    else {
        sortOptions.classList.add('hide');
    }
});

[ sortDateNew, sortDateOld, sortNameFront, sortNameBack ].forEach((btn) => 
    btn.addEventListener('click', processAlbums)
);


// Keyboard Shortcuts

document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "f") {
        event.preventDefault(); // prevent browser/Electron default
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
            searchInput.focus();
            searchInput.select(); // optional: selects existing text
        }
    }
});