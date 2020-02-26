/*
 * Copyright 2018-2020 TON DEV SOLUTIONS LTD.
 *
 * Licensed under the SOFTWARE EVALUATION License (the "License"); you may not use
 * this file except in compliance with the License.  You may obtain a copy of the
 * License at:
 *
 * http://www.ton.dev/licenses
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific TON DEV software governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
const p = os.platform();

const v = pkg.version.split('.');
const bv = `${v[0]}.${v[1]}.${~~(Number.parseInt(v[2]) / 100) * 100}`.split('.').join('_');
const bp = path.resolve(os.homedir(), '.tonlabs', 'binaries', bv);
module.exports = { p, bv, bp };