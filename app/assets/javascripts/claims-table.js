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

$(document).ready(function () {
  var status = getUrlParameter('status') || 'NEW'
  var dataReference = '/claims/' + status

  $('#claims').DataTable({
    processing: true,
    serverSide: true,
    searching: false,
    lengthChange: false,
    ajax: {
      url: dataReference,
      dataSrc: 'claims'
    },

    columns: [
      {'data': 'Reference'},
      {'data': 'Name'},
      {'data': 'DateSubmittedFormatted'},
      {'data': 'ClaimId',
        'createdCell': function (td, cellData, rowData, row, col) {
          $(td).html("<a id='claim" + rowData.ClaimId + "' href='/claim/" + rowData.ClaimId + "'>View</a>")
        }
      }
    ],

    columnDefs: [
      {
        'targets': [0, 1, 2, 3],
        'visible': true,
        'searchable': false,
        'orderable': false
      }
    ]
  })
})
