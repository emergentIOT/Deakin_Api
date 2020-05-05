'use strict';

const should = require('should');
// const util = require('du-utils');

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const apiUser = 'bigdata1';

const testUsers = [];

let network;
let gateway;
let contract;

describe('query', function() {

    this.timeout(60000);

    before(async function() {

        try {

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user.
            const userExists = await wallet.exists(apiUser);
            if (!userExists) {
                console.log(`An identity for the user "${apiUser}" does not exist in the wallet`);
                console.log('Run the registerUser.js application before retrying');
                return;
            }

            // Create a new gateway for connecting to our peer node.
            gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: apiUser, discovery: { enabled: true } });

            // Get the network (channel) our contract is deployed to.
            network = await gateway.getNetwork('mychannel');

            contract = network.getContract('UserPermissionContract');

            for (let i = 0; i < 10; i++) {
                const user = {
                    userId: 'test' + i + '@deakin.edu.au',
                    type: "location",
                    subType: "",
                    permissions: { 
                        canStream: i % 2 === 0 ? true : false,
                        canSave: i % 2 === 0 ? false : true,
                        services: {
                            scout: "realtime",
                            genie: "realtime|historic"
                        }
                    }
                };
                testUsers.push(user);
                await contract.submitTransaction('deleteUserPermission', testUsers[i].userId, testUsers[i].type);

            }
            

        } catch (error) {
            console.error(`Failed to connect: ${error}`);
            // done(error);
            throw error;
        }
        
    });

    after(async function() {
        // Disconnect from the gateway.
        await gateway.disconnect();
    });

    // try {
    // } catch (error) {
    //     console.error(`Failed to connect: ${error}`);
    // }

    describe('saveUserPermissions', function() {
        
        it('user does not exist', async function() {
            let result = JSON.parse(await contract.submitTransaction('getUserPermission', testUsers[0].userId, testUsers[0].type));
            should.not.exist(result.userId);
        });

        it('new user', async function() {
            await contract.submitTransaction('saveUserPermission', testUsers[0].userId, testUsers[0].type, 
                JSON.stringify(testUsers[0].permissions));
        });

        it('user exist', async function() {
            let result = JSON.parse(await contract.submitTransaction('getUserPermission', testUsers[0].userId, testUsers[0].type));
            result.userId.should.equal(testUsers[0].userId);
            result.type.should.equal(testUsers[0].type);
            result.permissions.canStream.should.equal(true);
            result.permissions.canSave.should.equal(false);
            result.dateModified.should.equal(result.dateCreated);
        });


        it('save many', async function() {
            for (let i = 1; i < testUsers.length; i++) {
                await contract.submitTransaction('saveUserPermission', testUsers[i].userId, testUsers[i].type, 
                    JSON.stringify(testUsers[i].permissions));
            }
        });


        it('update user', async function() {
            const permissions = { 
                canStream: false,
                canSave: true,
                services: {
                    scout: "realtime",
                    genie: "realtime|historic"
                }
            };
            await contract.submitTransaction('saveUserPermission', testUsers[0].userId, testUsers[0].type, 
                JSON.stringify(permissions));
        });

        it('user updated', async function() {
            let result = JSON.parse(await contract.submitTransaction('getUserPermission', testUsers[0].userId, testUsers[0].type));
            result.userId.should.equal(testUsers[0].userId);
            result.type.should.equal(testUsers[0].type);
            result.permissions.canStream.should.equal(false);
            result.permissions.canSave.should.equal(true);
            result.dateModified.should.not.equal(result.dateCreated);
        });

        it('delete user', async function() {
            await contract.submitTransaction('deleteUserPermission', testUsers[0].userId, testUsers[0].type);
        });

        it('user deleted', async function() {
            let result = JSON.parse(await contract.submitTransaction('getUserPermission', testUsers[0].userId, testUsers[0].type));
            should.not.exist(result.userId);
        });

    });

    describe('queryUserPermissions', function() {
        
        it('query all', async function() {
            
            let query = JSON.stringify({
                selector: {/*dateModified: {$gt: "2019-04-30T05:04:40.710Z"}*/}, 
                sort: [{dateModified: "desc"}]
            });
 
            let result = JSON.parse(await contract.evaluateTransaction('queryUserPermissions', query, "5", ""));
            console.log('Transaction has been evaluated, ' + result.metadata.fetched_records_count + ' items returned:');
            let testUserIndex = 9;
            result.metadata.fetched_records_count.should.equal(5);
            result.data.length.should.equal(5);
            for (let i = 0; i < result.data.length; i++) {
                console.dir(result.data[i].record, {depth: null, colors: true});
                result.data[i].record.userId.should.equal(testUsers[testUserIndex].userId);
                testUserIndex--;
            }

            // Next set
            result = JSON.parse(await contract.evaluateTransaction('queryUserPermissions', query, "5", result.metadata.bookmark));
            console.log('Transaction has been evaluated, ' + result.metadata.fetched_records_count + ' items returned:');
            result.metadata.fetched_records_count.should.equal(4);
            result.data.length.should.equal(4);
            for (let i = 0; i < result.data.length; i++) {
                console.dir(result.data[i].record, {depth: null, colors: true});
                result.data[i].record.userId.should.equal(testUsers[testUserIndex].userId);
                testUserIndex--;
            }

            result = JSON.parse(await contract.evaluateTransaction('queryUserPermissions', query, "5", result.metadata.bookmark));
            console.log('Transaction has been evaluated, ' + result.metadata.fetched_records_count + ' items returned:');
            result.metadata.fetched_records_count.should.equal(0);
            result.data.length.should.equal(0);


        });

    });

});