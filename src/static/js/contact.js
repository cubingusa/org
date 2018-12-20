onloadModule.register(function() {
  noid = document.getElementById('noid');
  if (noid) {
    document.getElementById('noid').onclick = function() {
      document.getElementById('form-content-container').style.display = 'block';
      document.getElementById('noid-container').style.display = 'none';
    }
  }
});
