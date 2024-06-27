$(function () {
  totalApproved()

  if (document.getElementById('additional-info-reject') !== null) {
    if (document.getElementById('additional-info-reject').value === 'Other') {
      document.getElementById('additional-info-reject-manual').style.display = 'block'
      document.getElementById('manual-label').style.display = 'block'
    }
  }

  $('.claim-expense-status').change(function () {
    const id = $(this).attr('data-id')
    const value = $(this).val()
    if (value === 'APPROVED-DIFF-AMOUNT') {
      $(`#claim-expense-${id}-approvedcost`).removeClass('visibility-hidden').addClass('visibility-visible')
      $(`#claim-expense-${id}-approvedcost`).addClass('approved-amount')
      $(`#claim-expense-${id}-claimedcost`).removeClass('approved-amount')
      $('input.approved-amount').on('input', function () {
        totalApproved()
      })
    } else if (value === 'APPROVED') {
      $(`#claim-expense-${id}-approvedcost`).removeClass('visibility-visible').addClass('visibility-hidden')
      $(`#claim-expense-${id}-claimedcost`).addClass('approved-amount')
      $(`#claim-expense-${id}-approvedcost`).removeClass('approved-amount')
    } else {
      $(`#claim-expense-${id}-approvedcost`).removeClass('visibility-visible').addClass('visibility-hidden')
      $(`#claim-expense-${id}-claimedcost`).removeClass('approved-amount')
      $(`#claim-expense-${id}-approvedcost`).removeClass('approved-amount')
    }
    totalApproved()
  })

  $('input[value="Remove"]').parent().parent().find('td.deduction').addClass('approved-amount')
  $('input.approved-amount').on('input', function () {
    totalApproved()
  })

  $('.claim-expense-status').each(function () {
    const value = this[this.selectedIndex].value
    const id = $(this).attr('data-id')
    if (value === 'APPROVED') {
      $(`#claim-expense-${id}-approvedcost`).addClass('approved-amount')
    } else if (value === 'APPROVED-DIFF-AMOUNT') {
      $(`#claim-expense-${id}-approvedcost`).addClass('approved-amount')
      $(`#claim-expense-${id}-claimedcost`).removeClass('approved-amount')
    } else {
      $(`#claim-expense-${id}-claimedcost`).removeClass('approved-amount')
    }
  })

  $('.approved-amount').each(function () {
    totalApproved()
  })

  $('#overpayment-toggle').change(function () {
    showClosedClaimActionSection('#overpayment-input')
  })

  $('#close-toggle').change(function () {
    showClosedClaimActionSection('#close-advanced-claim-input')
  })

  $('#request-new-payment-details-toggle').change(function () {
    showClosedClaimActionSection('#request-new-payment-details-input')
  })

  $('#additional-info-reject').change(function () {
    if (this[this.selectedIndex].value === 'Other') {
      document.getElementById('additional-info-reject-manual').style.display = 'block'
      document.getElementById('manual-label').style.display = 'block'
    } else {
      document.getElementById('additional-info-reject-manual').style.display = 'none'
      document.getElementById('manual-label').style.display = 'none'
      document.getElementById('additional-info-reject-manual').value = ''
    }
  })
})

function totalApproved () {
  let approvedCost = 0
  let manuallyProcessed = 0
  if ($('#unassign').length) {
    $('.approved-amount').each(function () {
      if (!isNaN(this.value) && this.value.length !== 0 && this.value.indexOf('e') === -1 && this.value.indexOf('E') === -1) {
        manuallyProcessed += parseFloat(this.value)
      }
      approvedCost += +$(this).text().replace('£', '')
    })
    $('.deduction').each(function () {
      approvedCost += +$(this).text().replace(' £', '')
    })
  } else { // use hidden approved cost for unassigned claims
    $('.approved-cost').each(function () {
      const parsedCost = parseFloat(+$(this).text().replace('£', ''))
      if (!isNaN(parsedCost) && parsedCost !== 0) {
        approvedCost += parsedCost
      }
    })
    $('.deduction').each(function () {
      approvedCost += +$(this).text().replace(' £', '')
    })
  }

  const totalCost = approvedCost + manuallyProcessed
  const formattedCost = totalCost < 0 ? '- £' + Math.abs(totalCost).toFixed(2) : '£' + totalCost.toFixed(2)
  $('.claim-expense-approvedCostText').text(formattedCost)
}

function showClosedClaimActionSection (id) {
  $('#overpayment-input').addClass('js-hidden')
  $('#close-advanced-claim-input').addClass('js-hidden')
  $('#request-new-payment-details-input').addClass('js-hidden')
  $(id).removeClass('js-hidden')
}
