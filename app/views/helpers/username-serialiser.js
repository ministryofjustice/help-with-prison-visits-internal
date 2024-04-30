module.exports.nameSerialiser = function (fullName) {
  if (!fullName) return null
  // this constructs an abbreviated full name using the first character of the first name
  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}
