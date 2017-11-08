filterModule = (function() {
  var currentFilterText = '';

  return {
    changeListener: function(evt) {
      newFilterText = this.value;
      stricterFilter = newFilterText.search(newFilterText) != -1;
      currentFilterText = newFilterText;

      filterWords = currentFilterText.split(' ');

      rowsToCheck = document.getElementById('filter-table').getElementsByClassName(
          stricterFilter ? 'filter-row' : 'user-visible');

      numMatches = 0;

      Array.prototype.some.call(rowsToCheck, function(row) {
        matches = true;
        filterWords.forEach(function(word) {
          if (row.dataset.filtertext.toLowerCase().search(word.toLowerCase()) == -1) {
            matches = false;
          }
        });
        if (matches) {
          row.classList.add('user-visible');
          row.classList.remove('user-invisible');
          numMatches++;
          if (numMatches >= 30) {
            return true;
          }
        } else {
          row.classList.add('user-invisible');
          row.classList.remove('user-visible');
        }
        return false;
      });
    },
  };
})();

document.getElementById('filter-box').addEventListener('keyup', filterModule.changeListener);
