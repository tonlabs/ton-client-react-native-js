import * as j from 'jest-lite';
import {tests} from './init-tests';

//IMPORTS
import aggregations_suite from '../aggregations.js';
import auth_suite from '../auth.js';
import client_suite from '../client.js';
import contracts_suite from '../contracts.js';
import crypto_suite from '../crypto.js';
import deploy_ex_suite from '../deploy-ex.js';
import queries_suite from '../queries.js';
import run_local_suite from '../run-local.js';
import test_error_messages_suite from '../test-error-messages.js';
//IMPORTS

export async function startTests(onStateChange) {
    try {
        await tests.init();
        const state = {
            version: await tests.client.config.getVersion(),
            passed: 0,
            failed: 0,
            finished: false,
        };
        onStateChange(state);

        j.addEventHandler((event) => {
            if (event.name === 'test_success') {
                state.passed += 1;
                console.log(`[TEST_SUCCESS] ${JSON.stringify({
                    name: event.test.name,
                })}`);
            } else if (event.name === 'test_failure') {
                state.failed += 1;
                console.log('>>>', event);
                console.log(`[TEST_FAILURE] ${JSON.stringify({
                    name: event.test.name,
                    error: event.error.toString(),
                    errors: event.test.errors,
                })}`);
            } else {
                return;
            }
            onStateChange(state);
        });
        onStateChange(state);
        j.run().then((results) => {
            results.forEach((result) => {
                result.errors = result.errors.map((e) => {
                    return e.toString().replace(/\n\s+at\s+.*/gi, '')
                });
            });
            console.log(`[TEST_COMPLETE] ${JSON.stringify(results)}`);
            state.finished = true;
            onStateChange(state);
        });
    } catch (error) {
        console.log('>>>', error);
    }
}
