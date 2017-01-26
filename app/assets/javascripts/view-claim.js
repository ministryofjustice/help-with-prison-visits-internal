$(function () {
  $('.claim-expense-status').change(function () {
    var id = $(this).attr('data-id')
    var value = $(this).val()
    if (value === 'APPROVED-DIFF-AMOUNT' || value === 'MANUALLY-PROCESSED') {
      $(`#claim-expense-${id}-approvedcost`).removeClass('visibility-hidden').addClass('visibility-visible')
      $(this).next('input').on('input').addClass('approved-amount')
      $(this).parent().parent().find('td.cost').removeClass('approved-amount')
      $('input.approved-amount').on('input', function () {
        totalApproved()
      })
    } else if (value === 'APPROVED') {
      $(`#claim-expense-${id}-approvedcost`).removeClass('visibility-visible').addClass('visibility-hidden')
      $(this).parent().parent().find('td.cost').addClass('approved-amount')
      $(this).next('input').on('input').removeClass('approved-amount')
    } else {
      $(`#claim-expense-${id}-approvedcost`).removeClass('visibility-visible').addClass('visibility-hidden')
      $(this).parent().parent().find('td.cost').removeClass('approved-amount')
      $(this).next('input').on('input').removeClass('approved-amount')
    } totalApproved()
  })
  $('.claim-expense-status').next('input').addClass('approved-amount')
  $('input[value="Remove"]').parent().parent().find('td.deduction').addClass('approved-amount')
  $('input.approved-amount').on('input', function () {
    totalApproved()
  })

  $('.claim-expense-status').each(function () {
    var value = this[this.selectedIndex].value
    if (value === 'APPROVED') {
      $('.claim-expense-status').parent().parent().find('td.cost').addClass('approved-amount')
    } else if (value === 'APPROVED-DIFF-AMOUNT' || value === 'MANUALLY-PROCESSED') {
      $('.claim-expense-status').next('input').addClass('approved-amount')
    }
  })

  $('.approved-amount').each(function () {
    totalApproved()
  $('#overpayment-toggle').change(function () {
    showClosedClaimActionSection('#overpayment-input')
  })
  $('#close-toggle').change(function () {
    showClosedClaimActionSection('#close-advanced-claim-input')
  })
  $('#request-new-payment-details-toggle').change(function () {
    showClosedClaimActionSection('#request-new-payment-details-input')
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

function showClosedClaimActionSection (id) {
  $('#overpayment-input').addClass('js-hidden')
  $('#close-advanced-claim-input').addClass('js-hidden')
  $('#request-new-payment-details-input').addClass('js-hidden')
  $(id).removeClass('js-hidden')
}
