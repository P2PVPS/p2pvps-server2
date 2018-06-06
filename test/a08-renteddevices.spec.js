/*
  This file contains tests for the /api/renteddevices API.

  TODO:
  -addDevice tests
  -getDevices tests
  -renewDevice tests
  --If the rentedDevices list is empty, returns 422
  --If the device supplied is not in the rentedDevices list, returns 422
  --If the device model/ID does not exist, returns 404.
  --On success, a new obContract ID is returned.
  --On success, an http status of 200 is returned.
  -removeDevice tests
*/

'use strict'
