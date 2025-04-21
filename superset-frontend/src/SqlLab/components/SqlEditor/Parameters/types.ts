/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { PARAM_TYPE } from './constants';

export type ComponentType = (typeof PARAM_TYPE)[keyof typeof PARAM_TYPE];

export interface ComponentConfig {
  type: ComponentType;
  value: string | number | any;
  name: string;
  options: string;
  multiValuesOptions: MultiValuesOptions | null;
}

export interface Parameter {
  name?: string;
  type: string | null;
  options: string | null;
  multiValuesOptions: MultiValuesOptions | null;
}

export interface MultiValuesOptions {
  prefix: string;
  suffix: string;
  separator?: string;
}

export type DropdownOption = {
  label: string;
  value: string;
};
