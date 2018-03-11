/*
  This file contains utility functions used by the server.
*/

// Create the first user in the system. A 'admin' level system user that is
// used by the Listing Manager and test scripts, in order access private API
// functions.
async function createSystemUser () {

}

module.exports = {
  createSystemUser: createSystemUser
}
