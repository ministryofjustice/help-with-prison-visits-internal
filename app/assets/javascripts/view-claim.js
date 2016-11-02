$('[id^="claim-expense-status-"]').change(function () {
  console.log('**************')
  var id = $(this).attr('data-id')
  var value = $(this).val()
  if (value === 'APPROVED-DIFF-AMOUNT') {
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
