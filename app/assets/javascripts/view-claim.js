$('.claim-expense-status').change(function () {
  var id = $(this).attr('data-id')
  var value = $(this).val()
  if (value === ('APPROVED-DIFF-AMOUNT' || 'MANUALLY-PROCESSED')) {
    show(`#claim-expense-${id}-approvedcost`)
  } else {
    hide(`#claim-expense-${id}-approvedcost`)
  }
})

function hide (element) {
  $(element).hide()
}

function show (element) {
  $(element).show()
}
