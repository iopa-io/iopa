/*
 * Copyright (c) 2015 Limerun Project Contributors
 * Portions Copyright (c) 2015 Internet of Protocols Assocation (IOPA)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const images = {
	logo: '<img alt="" src="data:image/png;base64,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" />'
};

exports.default = images;