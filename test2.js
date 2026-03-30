const key = 'AIzaSyCyGpMeiywKL5-cAybjoc9p3yDHWtBNSTY';
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key)
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(console.error);
