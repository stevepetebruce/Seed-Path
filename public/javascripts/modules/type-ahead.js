import axios from 'axios';

function displaySearch(stores) {
  return stores.map(store => {
    return `
    <a href="/store/${store.slug}" class="search__result">
      <strong>${store.name}</strong>
    </a>`
  }).join('');
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
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = displaySearch(res.data);
          return;
        }
        searchResults.innerHTML = `<div class="search__result">No results for <strong>${this.value}</strong> have been found</div>`;

        if (!this.value) {
          searchResults.style.display = 'none';
        }

      })
      .catch(error => {
        console.error(error);
      });
    });

  // handle keyboard UX
  search.addEventListener('keyup', (e) => {
    // ignore other keys
    // 40 = down, 38 = up, 13 = enter
    if (![38,40,13].includes(e.keyCode)) {
      return;
    }
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;

    if (e.keyCode === 40 && current) {
      // down
      next = current.nextElementSibling || items[0];  //nextElementSibling = element immediately following parent's child in list
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      // up
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      // enter key
      window.location = current.href;
      return;
    }
    // add hover to selected
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });

}

export default typeAhead;