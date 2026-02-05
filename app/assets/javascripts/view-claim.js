function totalApproved () {
  let approvedCost = 0
  const manuallyProcessed = 0
  let deduction = 0

  function isValidValue (value) {
    return !isNaN(value) && value.trim().length !== 0 && value.indexOf('e') === -1 && value.indexOf('E') === -1
  }

  $('.approved-amount').each(function eachFunction() {
    const value = $(this).val()
    if (isValidValue(value)) {
      approvedCost += parseFloat(value)
    }
    approvedCost += +$(this).text().replace('£', '').trim()
  })

  $('.deduction').each(function eachFunction() {
    deduction += +$(this).text().replace(' £', '')
  })

  const totalCost = approvedCost + manuallyProcessed + deduction

  const formattedCost = totalCost < 0 ? '- £' + Math.abs(totalCost).toFixed(2) : '£' + totalCost.toFixed(2)
  $('.claim-expense-approvedCostText').text(formattedCost)

  if (totalCost < 0) {
    $('.claim-expense-approvedCostText').addClass('claim-table-negative')
  } else {
    $('.claim-expense-approvedCostText').removeClass('claim-table-negative')
  }
}

function showClosedClaimActionSection(id) {
  $('#overpayment-input,#close-advanced-claim-input,#request-new-payment-details-input').addClass('js-hidden')
  $(id).removeClass('js-hidden')
}

jQuery(() => {
  if ($('#unassign').length) {
    // setting initial state for when assigned
    $('.claim-expense-status').each(function eachFunction() {
      const id = $(this).attr('data-id')
      const value = $(this).val()
      if (value === 'APPROVED') {
        $(`#text-for-${id}-approved-cost`).text($(`#claimed-expense-for-${id}`).text().trim())
      } else if (value === 'APPROVED-DIFF-AMOUNT') {
        $(`#text-for-${id}-approved-cost`).addClass('js-hidden').removeClass('approved-amount')
        $(`.input-container-for-${id}-approve-different-cost`).removeClass('js-hidden')
        $(`.input-value-for-${id}-approve-different-cost`).addClass('approved-amount')
      }
    })
  }
  $('#additional-info-reject').each(function eachFunction() {
    if (this[this.selectedIndex].value === 'Other') {
      $('.rejection-reason-other').removeClass('js-hidden')
    }
  })
  $('#release-date-is-set').each(function eachFunction() {
    if ($(this).is(':checked')) {
      $('#release').removeClass('js-hidden')
    }
  })
  $('#is-trusted-checkbox').each(function eachFunction() {
    if ($(this).is(':checked')) {
      $('.reject-auto-approval').addClass('js-hidden')
    } else {
      $('.reject-auto-approval').removeClass('js-hidden')
    }
  })
  totalApproved()

  $('.claim-expense-status').on('change', function onChangeFunction() {
    const id = $(this).attr('data-id')
    const value = $(this).val()
    if (value === 'APPROVED') {
      $(`#text-for-${id}-approved-cost`).removeClass('js-hidden').addClass('approved-amount').text($(`#claimed-expense-for-${id}`).text())
      $(`.input-container-for-${id}-approve-different-cost`).addClass('js-hidden')
      $(`.input-value-for-${id}-approve-different-cost`).removeClass('approved-amount').val($(`#claimed-expense-for-${id}`).text().replace('£', ''))
      $(`.claim-expense-${id}-approvedcost`).val($(`#claimed-expense-for-${id}`).text())
    } else if (value === 'APPROVED-DIFF-AMOUNT') {
      $(`#text-for-${id}-approved-cost`).addClass('js-hidden').removeClass('approved-amount')
      $(`.input-container-for-${id}-approve-different-cost`).removeClass('js-hidden')
      $(`.input-value-for-${id}-approve-different-cost`).addClass('approved-amount').val($(`#claimed-expense-for-${id}`).text().replace('£', ''))
    } else {
      $(`#text-for-${id}-approved-cost`).addClass('js-hidden').addClass('approved-amount').text('0.00')
      $(`.input-container-for-${id}-approve-different-cost`).addClass('js-hidden')
      $(`.input-value-for-${id}-approve-different-cost`).removeClass('approved-amount').val('0.00')
    }
    totalApproved()
  })

  $('.input-for-different-cost').on('input', () => {
    totalApproved()
  })

  $('input[value="Remove"]').parent().parent().find('td.deduction').addClass('approved-amount')

  $('#overpayment-toggle').on('change', () => {
    showClosedClaimActionSection('#overpayment-input')
  })

  $('#close-toggle').on('change', () => {
    showClosedClaimActionSection('#close-advanced-claim-input')
  })

  $('#request-new-payment-details-toggle').on('change', () => {
    showClosedClaimActionSection('#request-new-payment-details-input')
  })

  $('#additional-info-reject').on('change', function onChangeFunction() {
    if (this[this.selectedIndex].value === 'Other') {
      $('.rejection-reason-other').removeClass('js-hidden')
    } else {
      $('.rejection-reason-other').addClass('js-hidden')
    }
  })

  $('#is-trusted-checkbox').on('click', function onClickFunction() {
    if ($(this).is(':checked')) {
      $('.reject-auto-approval').addClass('js-hidden')
    } else {
      $('.reject-auto-approval').removeClass('js-hidden')
    }
  })

  $('#release-date-is-set').on('click', function onClickFunction() {
    if ($(this).is(':checked')) {
      $('#release').removeClass('js-hidden')
    } else {
      $('#release').addClass('js-hidden')
    }
  })
})
