const childRelationshipEnum = require('../../constants/child-relationship-enum')

module.exports = type => {
  return childRelationshipEnum[type] ? childRelationshipEnum[type] : type
}
