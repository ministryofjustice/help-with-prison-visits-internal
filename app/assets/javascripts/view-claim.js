

$(function () {
  var claimId = $('input[name="claimId"]').val()

  $('.claim-expense-status').next('input').addClass('approved-amount')
  $('input.approved-amount').on('input', function () {
    totalApproved()
  })
  $('#update-overpayment-status').on('click', function () {
    var data = getPostDataObject()
    data['overpayment-amount'] = $('#overpayment-amount').val()
    data['overpayment-remaining'] = $('#overpayment-remaining').val()
    data['overpayment-reason'] = $('#overpayment-reason').val()

    post(`/claim/${claimId}/update-overpayment-status`, data)
  })
  $('#close-advance-claim-submit').on('click', function () {
    var data = getPostDataObject()
    data['close-advance-claim-reason'] = $('#close-advance-claim-reason').val()

    post(`/claim/${claimId}/close-advance-claim`, data)
  })
  $('#request-new-payment-details').on('click', function () {
    var data = getPostDataObject()
    data['payment-details-additional-information'] = $('#payment-details-additional-information').val()

    post(`/claim/${claimId}/request-new-payment-details`, data)
  })
  $('input.remove-deduction-button').on('click', function () {
    var data = getPostDataObject()
    data[this.name] = 'Remove'

    post(`/claim/${claimId}/remove-deduction`, data)
  })
  $('#add-deduction').on('click', function () {
    var data = getPostDataObject()
    data['deductionType'] = $('#deductionType').val()
    data['deductionAmount'] = $('#deductionAmount').val()

    post(`/claim/${claimId}/add-deduction`, data)
  })

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

function post (endPoint, data) {
  $.post(endPoint,
    data,
    function (data, textStatus, jqXHR) {
      if (data.redirectUrl) {
        window.location.replace(data.redirectUrl)
      } else {
        window.location.reload()
      }
    }
  )
  .fail(function (err) {
    alert(err)
  })
}

function getPostDataObject () {
  var data = {
    _csrf: $('input[name="_csrf"]').val(),
    'lastUpdated': $('input[name="lastUpdated"]').val()
  }

  return data
}
