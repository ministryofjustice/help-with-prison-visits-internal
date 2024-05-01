const { nameSerialiser } = require('../../../../app/views/helpers/username-serialiser')

describe('serailise username', function () {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson']
  ])('%s nameSerialiser(%s, %s)', (_, a, expected) => {
    expect(nameSerialiser(a)).toEqual(expected)
  })
})
