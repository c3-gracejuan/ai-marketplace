/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

// Roles treated as marketplace admins. C3.AppAdmin and C3.EnvAdmin are platform-level
// supersets and always count as admin so the deployer never gets locked out.
var _ADMIN_ROLE_IDS = ['aiMarketplace.Admin', 'C3.AppAdmin', 'C3.EnvAdmin'];

function getPermissions() {
  var user = User.myUser();
  if (!user) {
    return { isAdmin: false, roles: [] };
  }

  var roleIds = [];
  var allRoles = user.allRoles();
  if (allRoles) {
    allRoles.each(function (role) {
      roleIds.push(role.id);
    });
  }

  var isAdmin = false;
  for (var i = 0; i < roleIds.length; i++) {
    if (_ADMIN_ROLE_IDS.indexOf(roleIds[i]) >= 0) {
      isAdmin = true;
      break;
    }
  }

  return { isAdmin: isAdmin, roles: roleIds };
}
