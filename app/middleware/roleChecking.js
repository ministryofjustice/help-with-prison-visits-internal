const applicationRoles = require('../constants/application-roles-enum');

const userNavigationOptions = {
    dashboard: false,
    claims: false,
    audit: false,
    download: false,
    config: false,
};

const rolesAndPermissions = {};

// Assign permissions to each role by iterating through applicationRoles 
for (const role in applicationRoles) {
    if (applicationRoles.hasOwnProperty(role)) {
        const value = applicationRoles[role];
        if (value === applicationRoles.CLAIM_ENTRY_BAND_2 || value === applicationRoles.CLAIM_PAYMENT_BAND_3) {
            rolesAndPermissions[role] = ['dashboard', 'claims'];
        } else if (value === applicationRoles.CASEWORK_MANAGER_BAND_5) {
            rolesAndPermissions[role] = ['dashboard', 'claims', 'audit'];
        } else if (value === applicationRoles.HWPV_SSCL) {
            rolesAndPermissions[role] = ['download'];
        } else if (value === applicationRoles.BAND_9) {
            rolesAndPermissions[role] = ['dashboard', 'claims', 'audit', 'config'];
        }
    }
}

// If user has correct role, assign true to nav option in userNavigationOptions
module.exports = () => {
    return (req, res, next) => {
        res.rolesForNavigation = rolesAndPermissions;

        if (res.locals.user) {
            res.locals.user.roles.forEach(userRole => {
                for (const role in rolesAndPermissions) {
                    if (userRole.includes(role)) {
                        rolesAndPermissions[role].forEach(navOption => {
                            userNavigationOptions[navOption] = true;
                        });
                    }
                }
            });
        }
        res.locals.UserNavigationOptions = userNavigationOptions
        next();
    };
};