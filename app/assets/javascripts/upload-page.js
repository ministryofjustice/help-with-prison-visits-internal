$('#document').change(function () {
  const document = $('#document').val().replace(/\\/g, '/').replace(/.*\//, '')
  if (document) {
    $('#document-name').html(document).addClass('text-success')
    $('#choose-file').hide()
    $('#label').hide()
    $('#remove-file-upload').show()
  }
})
