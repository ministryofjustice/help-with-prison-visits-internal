$(document).ready(function () {
  var status = $('#claims').attr('title')
  var dataReference = '/claims/' + status
  $('#claims').DataTable({
    processing: true,
    serverSide: true,
    searching: false,
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
          $(td).html("<a href='/claim/" + rowData.ClaimId + "'>View</a>")
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
