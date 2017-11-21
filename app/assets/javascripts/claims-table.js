function getUrlParameter (sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1))
  var sURLVariables = sPageURL.split('&')
  var sParameterName

  for (var i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=')

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1]
    }
  }
}

function cleanColumnOutput (data, type, row) {
  var unsafeOutputPattern = new RegExp(/>|<|&|"|\/|'/g)
  return data.replace(unsafeOutputPattern, '')
}

$(document).ready(function () {
  var status = getUrlParameter('status') || 'NEW'
  var dataReference = '/claims/' + status

  $('#claims').DataTable({
    processing: true,
    serverSide: true,
    searching: false,
    lengthChange: false,
    order: [],
    ajax: {
      url: dataReference,
      dataSrc: 'claims',
      error: function (response) {
        $('#claims_processing').hide()
        alert('An error occurred when searching for claims.') // eslint-disable-line no-undef
      }
    },

    columns: [
      {'data': 'Reference', 'render': cleanColumnOutput},
      {'data': 'Name', 'render': cleanColumnOutput},
      {'data': 'DateSubmittedFormatted'},
      {'data': 'DateOfJourneyFormatted'},
      {'data': 'DisplayStatus'},
      {'data': 'ClaimType',
        'createdCell': function (td, cellData, rowData, row, col) {
          $(td).html('<span class=\'tag ' + rowData.ClaimType + '\'>' + rowData.ClaimTypeDisplayName + '</span>')
        }
      },
      {'data': 'ClaimId',
        'createdCell': function (td, cellData, rowData, row, col) {
          $(td).html("<a id='claim" + rowData.ClaimId + "' href='/claim/" + rowData.ClaimId + "'>View</a>")
        }
      }
    ],

    columnDefs: [
      {
        'targets': [0, 1, 2, 3, 4, 5, 6],
        'visible': true,
        'searchable': false,
        'orderable': false
      }
    ],

    drawCallback: function () {
      var total = $('#claims_info').text().split(' ')[5]
      $('.badge').text(total)
    },

    language: {
      info: 'Showing _START_ to _END_ of _TOTAL_ claims',
      infoEmpty: 'Showing 0 to 0 of 0 claims',
      emptyTable: 'No claims found'
    }
  })
})
