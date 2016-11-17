$('#document').change(function () {
  var document = $('#document').val().replace(/\\/g, '/').replace(/.*\//, '')
  if (document) {
    $('#document-name').html(document)
    $('#choose-file').html('Choose a different file')
  }
})
