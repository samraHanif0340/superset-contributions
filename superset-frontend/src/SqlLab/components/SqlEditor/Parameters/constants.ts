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
export const PARAM_TYPE_DROPDOWN_OPTIONS = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Dropdown', value: 'dropdown' },
  { label: 'Date', value: 'date' },
  { label: 'Date Time', value: 'datetime' },
];

export const QUOTATION_DROPDOWN_OPTIONS = [
  { label: 'None (default)', value: '' },
  { label: 'Quotation Mark', value: "'" },
];

export const COMPONENT_TITLES = {
  ADD_MODAL_TITLE: 'Add New Parameter',
  ADD: 'Add',
  CANCEL: 'Cancel',
  UPDATE: 'Update',
  PARAM_DISPLAY_BAR: 'Query Parameters',
  DELETE_PARAM_MODAL: 'Confirm Delete',
  DELETE_PARAM_MODAL_DESC:
    'CAUTION: Deleting the parameter will delete the keyword from the sql query as well. Are you sure you want to delete this parameter?',
  DELETE_PARAM_ACTION: 'Delete',
  ADD_NEW_PARAM_ICON: '{{}}',
  PARAM_GUIDE_TITLE: 'Parameter Guidelines',
};

export const LABELS = {
  KEYWORD: 'Keyword',
  PARAM_TYPE: 'Parameter Type',
  DROPDOWN_OPTIONS: 'Values',
  MULTIVALUE_SELECTION_CEHCKBOX: 'Allow multiple values selection in dropdown?',
  QUOTATION: 'Quotation',
};

export const HELP_TEXT = {
  KEYWORD: 'Parameter keyword to be used in a query [must be unique]',
  PARAM_TYPE:
    'Please select parameter type(for e.g: Date, Text, Number, or Dropdown)',
  DROPDOWN_OPTIONS:
    'List of values to be shown in dropdown (new-line delimited)',
  QUOTATION:
    'The selected dropdown values will be placed in query as a comma-separated',
  QUOTATION_TOOLTIP: 'Select how the list values should be added in the query',
  TT_EDIT_PARAM: 'Edit parameter',
  TT_DELETE_PARAM: 'Delete parameter',
  ADD_NEW_PARAM_LIMIT_EXCEED:
    'Parameter limit exceeded, please remove redundant parameters to add new parameters',
  QUERY_PARAM_GUIDE: 'Query Parameter User Guide',
};

export const PLACEHOLDERS = {
  N_A: 'N/A',
  NULL: 'None',
  ENTER_TEXT: 'Enter text',
  ENTER_NUMBER: 'Enter number',
  SELECT_DATE: 'Select date',
  SELECT_DATETIME: 'Select datetime',
  SELECT_OPTIONS: 'Select options',
};

export const FORM_ERRORS = {
  REQUIRED: 'Required',
  MIN_VALUE: 'Keyword must be at least 3 characters',
  MAX_VALUE: 'Keyword cannot exceed 50 characters',
  KEYWORD_REGEX:
    'Keyword must start with a letter, can include numbers and underscores, but cannot end with an underscore.',
  KEYWORD_ALREADY_EXIST: 'Parameter keyword already exists',
  DROPDOWN_LIMIT_EXCEEDED: 'You can only add up to ',
};

export const MULTIVALUES_SAMPLE = ['value1', 'value2', 'value3'];

export const SELECTION_MODE = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
};

export const PARAM_TYPE = {
  TEXT: 'text',
  NUMBER: 'number',
  DROPDOWN: 'dropdown',
  DATE: 'date',
  DATETIME: 'datetime',
} as const;

export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
};

export const DEFAULT_PANEL_KEY = '1';

export const REGEX = {
  ALL_PARAM: /{{\s*([^}]+?)\s*}}/g,
  VALID_PARAM: /{{\s*([a-zA-Z][a-zA-Z0-9_]{1,48}[a-zA-Z0-9])\s*}}/g,
  VALID_PARAM_NAME: /^(?![_\d])[a-zA-Z0-9_]{2,49}[a-zA-Z0-9]$/,
  FORM_PARAM_NAME_REGEX: /^(?![_\d])[a-zA-Z0-9_]+(?<!_)$/,
};

export const QUERY_PARAM_LIMIT = 10;
export const QUERY_PARAM_OPTION_LIMIT = 1000;
