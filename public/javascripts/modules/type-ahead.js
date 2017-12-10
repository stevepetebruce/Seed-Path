const axios = require('axios');

function displaySearch(stores) {
  return stores.map(
    store => {
      return `<a href="store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>`
    }
  ).join('');

}

function typeAhead(search) {
  // if the search box is not displayed
  if (!search) return;

  const searchInput =  search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.addEventListener('input', function() {
    // if no search results
    if (!searchResults) {
      searchResults.style.display = 'none';
      return;
    }
    searchResults.style.display = 'block';

    axios
      .get(`api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = displaySearch(res.data);
        }
      });
  });

}

export default typeAhead;