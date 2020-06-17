

process.env.ENV = 'test';
process.env.LOG = 'false'; 

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
require('../security/authentication.js');
const Authorization = require('../security/authorization.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const UserRoles = require('../types/userRoles.js');
chai.use(chaiHttp);

describe('is administrator?', () => {
    it('it should answer true if the user is an administrator', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const result = Authorization.isAdministrator(user);
        result.should.equal(true);
    });

    it('it should answer false if the user is a provided one', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const result = Authorization.isAdministrator(user);
        result.should.equal(false);
    });

    it('it should answer false if the user is an analyst', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const result = Authorization.isAdministrator(user);
        result.should.equal(false);
    });
});

describe('is provider?', () => {
    it('it should answer true if the user is a provider', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const result = Authorization.isProvider(user);
        result.should.equal(true);
    });

    it('it should answer false if the user is an administrator', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const result = Authorization.isProvider(user);
        result.should.equal(false);
    });

    it('it should answer false if the user is an analyst', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const result = Authorization.isProvider(user);
        result.should.equal(false);
    });
});

describe('is analyst?', () => {
    it('it should answer true if the user is an analyst', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const result = Authorization.isAnalyst(user);
        result.should.equal(true);
    });

    it('it should answer false if the user is an administrator', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const result = Authorization.isAnalyst(user);
        result.should.equal(false);
    });

    it('it should answer false if the user is a provided', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const result = Authorization.isAnalyst(user);
        result.should.equal(false);
    });
});

describe('is owner?', () => {
    it('it should answer true if the user is the owner of a device', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const device = await factory.createDevice("test-device-1", user);
        const result = Authorization.isOwner(device, user);
        result.should.equal(true);
    });

    it('it should answer false if the user is not the owner of a device', async () => {
        const user_not_owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user_owner = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const device = await factory.createDevice("test-device-1", user_owner);
        const result = Authorization.isOwner(device, user_not_owner);
        result.should.equal(false);
    });
});
