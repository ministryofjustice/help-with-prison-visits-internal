const readableFileSize = (attachmentSize) => {
  const DEFAULT_SIZE = 0;
  const fileSize = attachmentSize ?? DEFAULT_SIZE;
  if (!fileSize) {
    return `${DEFAULT_SIZE} kb`;
  }
  const sizeInKb = fileSize / 1024;
  if (sizeInKb > 1024) {
    return `${(sizeInKb / 1024).toFixed(2)} mb`;
  } else {
    return `${sizeInKb.toFixed(2)} kb`;
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const documentInput = document.getElementById('document');

  const fileInputWrapper = document.getElementById('file-upload');
  const continueToPreview = document.getElementById('continue-to-preview');
  const continueToUpload = document.getElementById('file-upload-submit');

  const form = document.querySelector('.form');
  const radios = document.getElementsByName('correct');

  const uploadPreview = document.getElementById('upload-preview');
  const imagePreview = document.getElementById('image-preview');
  const imagePreviewText = document.getElementById('image-preview-text');


  continueToUpload.style.display = 'none';
  continueToUpload.disabled = true;
  continueToPreview.disabled = true

  continueToPreview.addEventListener('click', function(e) {
    e.preventDefault();
    fileInputWrapper.style.display = 'none';
    continueToPreview.style.display = 'none';
    uploadPreview.style.display = 'block';
    continueToUpload.style.display = 'block';
  });

  radios.forEach(function(radio) {
    radio.addEventListener('change', function() {
      continueToUpload.disabled = false
    });
  });

  documentInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      continueToPreview.disabled = false;
      const reader = new FileReader();
      reader.onload = function() {
        imagePreview.src = window.URL.createObjectURL(file);
        imagePreview.style.display = 'block';
        imagePreviewText.innerText = `${file.name}, ${readableFileSize(file.size)}`;
      };
      reader.readAsDataURL(file);
    }
  });

  continueToUpload.addEventListener('click', function(e) {
    const inputCorrect = document.querySelector('input[name="correct"]:checked');
    if (inputCorrect && inputCorrect.value === 'yes') {
      form.submit();
    } else {
      e.preventDefault();
      location.reload();
    }
  });
});
