module.exports.nameSerialiser = function (fullName) {
   // this check is for the authError page
   if (!fullName) return null
   // this constructs an abbreviated full name using the first character of the first name
   const array = fullName.split(' ')
   return `${array[0][0]}. ${array.reverse()[0]}`
}
