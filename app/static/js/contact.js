onloadModule.register(function() {
  noid = document.getElementById('noid');
  if (noid) {
    document.getElementById('noid').onclick = function() {
      document.getElementById('form-content-container').style.display = 'block';
      document.getElementById('noid-container').style.display = 'none';
      document.getElementById('name').disabled = false;
      document.getElementById('from-address').disabled = false;
      document.getElementById('wcaid-container').style.display = 'none';
      document.getElementById('contact-message').disabled = false;
      document.getElementById('send-button').disabled = false;
    }
  }
});
