$('#document').on('change', () => {
  const document = $('#document').val().replace(/\\/g, '/').replace(/.*\//, '')
  if (document) {
    $('#document-name').html(document).addClass('text-success')
    $('#choose-file,#label').hide()
    $('#remove-file-upload').show()
  }
})
