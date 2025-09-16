$(document).ready(() => {
  $('#filter').change(() => {
    $(this).closest('form').submit()
  })
})
