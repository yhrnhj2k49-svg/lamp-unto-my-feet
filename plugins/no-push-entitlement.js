// The daily verse is a *local* notification: the phone schedules it itself and
// nothing is ever sent from a server. iOS only needs the push entitlement
// ("aps-environment") for remote notifications, but expo-notifications adds it
// automatically the moment the package is installed.
//
// Left in place it would mean asking Apple for a Push Notifications capability
// the app never uses, another entitlement on the binary, and an awkward answer
// on the store's questionnaires. It also broke the 1.0.1 build, because the
// signing profile carries no such capability.
//
// So this strips it back out, after expo-notifications has had its say.
const { withEntitlementsPlist } = require("expo/config-plugins");

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults["aps-environment"];
    return cfg;
  });
};
