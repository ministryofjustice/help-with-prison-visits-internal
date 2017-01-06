$(document).ready(function () {
  $('#filter').change(function () {
    $(this).closest('form').submit()
  })
})
