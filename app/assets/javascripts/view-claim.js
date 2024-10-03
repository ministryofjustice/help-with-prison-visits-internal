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
      $(`#change-approved-cost`).removeClass('js-hidden')
      $(this).next('input').on('input').addClass('approved-amount')
      $(this).parent().parent().find('td.cost').removeClass('approved-amount')
      $('input.approved-amount').on('input', function () {
        totalApproved()
      })
    } else if (value === 'APPROVED') {
      $(`#change-approved-cost`).addClass('js-hidden')
      $(this).parent().parent().find('td.cost').addClass('approved-amount')
      $(this).next('input').on('input').removeClass('approved-amount')
    } else {
      $(`#change-approved-cost`).addClass('js-hidden')
      $(this).parent().parent().find('td.cost').removeClass('approved-amount')
      $(this).next('input').on('input').removeClass('approved-amount')
    } totalApproved()
  })

  $('input[value="Remove"]').parent().parent().find('td.deduction').addClass('approved-amount')
  $('input.approved-amount').on('input', function () {
    totalApproved()
  })

  $('.claim-expense-status').each(function () {
    const value = this[this.selectedIndex].value
    if (value === 'APPROVED') {
      $(this).parent().parent().find('td.cost').addClass('approved-amount')
      $(this).next('input').removeClass('approved-amount')
    } else if (value === 'APPROVED-DIFF-AMOUNT') {
      $(this).next('input').addClass('approved-amount')
      $(this).parent().parent().find('td.cost').removeClass('approved-amount')
    } else {
      $(this).parent().parent().find('td.cost').removeClass('approved-amount')
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
    $('input.approved-amount').each(function () {
      if (!isNaN(this.value) && this.value.length !== 0 && this.value.indexOf('e') === -1 && this.value.indexOf('E') === -1) {
        manuallyProcessed += parseFloat(this.value)
      }
    })

    $('td.approved-amount').each(function () {
      approvedCost += +$(this).text().replace('£', '')
    })
  } else { // use hidden approved cost for unassigned claims
    $('input.approved-cost').each(function () {
      if (!isNaN(this.value) && this.value.length !== 0) {
        approvedCost += parseFloat(this.value)
      }
    })
    $('td.deduction').each(function () {
      approvedCost += +$(this).text().replace('£', '')
    })
  }

  $('.claim-expense-approvedCostText').text('£' + (approvedCost + manuallyProcessed).toFixed(2))
}

function showClosedClaimActionSection (id) {
  $('#overpayment-input').addClass('js-hidden')
  $('#close-advanced-claim-input').addClass('js-hidden')
  $('#request-new-payment-details-input').addClass('js-hidden')
  $(id).removeClass('js-hidden')
}
