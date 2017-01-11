$('.claim-expense-status').change(function () {
  var id = $(this).attr('data-id')
  var value = $(this).val()
  if (value === 'APPROVED-DIFF-AMOUNT' || value === 'MANUALLY-PROCESSED') {
    show(`#claim-expense-${id}-approvedcost`)
    $(this).next('input').on('input').addClass('approved-amount')
    $(this).parent().parent().find('td.cost').removeClass('approved-amount')
    $('input.approved-amount').on('input', function () {
      totalApproved()
    })
  } else if (value === 'APPROVED') {
    hide(`#claim-expense-${id}-approvedcost`)
    $(this).parent().parent().find('td.cost').addClass('approved-amount')
    $(this).next('input').on('input').removeClass('approved-amount')
  } else {
    hide(`#claim-expense-${id}-approvedcost`)
    $(this).parent().parent().find('td.cost').removeClass('approved-amount')
    $(this).next('input').on('input').removeClass('approved-amount')
  } totalApproved()
})

$(function () {
  $('.claim-expense-status').next('input').addClass('approved-amount')
  $('input.approved-amount').on('input', function () {
    totalApproved()
  })
})

function totalApproved () {
  var approvedCost = 0
  var manuallyProcessed = 0
  $('input.approved-amount').each(function () {
    if (!isNaN(this.value) && this.value.length !== 0) {
      manuallyProcessed += parseFloat(this.value)
    }
  })

  $('td.approved-amount').each(function () {
    approvedCost += +$(this).text().replace('£', '')
  })

  $('.claim-expense-approvedCostText').text('£' + (approvedCost + manuallyProcessed).toFixed(2))
}

function hide (element) {
  $(element).hide()
}

function show (element) {
  $(element).show()
}
