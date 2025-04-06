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
import { map } from 'lodash';
import React from 'react';
import { DatePicker } from 'antd';
import { InputNumber, Input } from 'src/components/Input';
import SelectControl from 'src/explore/components/controls/SelectControl';
import { styled } from '@superset-ui/core';
import moment from 'moment';
import { Tooltip } from 'src/components/Tooltip';
import { ComponentType } from './types';
import {
  DATE_FORMATS,
  PARAM_TYPE,
  PLACEHOLDERS,
  SELECTION_MODE,
} from './constants';

interface ParameterValueInputProps {
  id: string;
  type: ComponentType;
  name: string;
  value: string | number | any;
  options: string;
  multiValuesOptions?: any;
  onChange: (value: any) => void;
}

const StyledParameterInput = styled.div`
  .ant-input::placeholder,
  .ant-input-number input::placeholder, // More specific selector for InputNumber
  .ant-select-selection-placeholder,
  .ant-picker-input input::placeholder {
    font-size: 12px; // Adjust the font size as needed
  }

  .ant-select {
    min-width: 150px;
  }
`;
const ParameterValueInput: React.FC<ParameterValueInputProps> = ({
  id,
  name,
  type,
  value,
  options,
  onChange,
  multiValuesOptions,
}) => {
  const handleDateChange = (date: moment.Moment | null) => {
    if (!date) {
      onChange(null); // Date cleared from control
      return;
    }
    const formattedDate =
      type === PARAM_TYPE.DATE
        ? date.format(DATE_FORMATS.DATE)
        : date.format(DATE_FORMATS.DATETIME);
    onChange(formattedDate);
  };

  const renderTextInput = () => (
    <Tooltip title={value ? String(value) : PLACEHOLDERS.N_A}>
      <Input
        name={name}
        type="text"
        placeholder={PLACEHOLDERS.ENTER_TEXT}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={e => onChange(e.target.value)}
      />
    </Tooltip>
  );

  const renderNumberInput = () => {
    const normalize = (val: any) => (Number.isNaN(val) ? undefined : val);
    return (
      <Tooltip title={value ? String(value) : PLACEHOLDERS.N_A}>
        <InputNumber
          value={normalize(value)}
          onChange={val => onChange(normalize(val))}
          onBlur={() => onChange(value)}
          name={name}
          placeholder={PLACEHOLDERS.ENTER_NUMBER}
          style={{ width: '100%' }}
        />
      </Tooltip>
    );
  };

  const renderDropdownInput = () => {
    const enumOptionsArray = options.split('\n').filter((v: any) => v !== '');
    const normalize = (val: any) =>
      multiValuesOptions && val === null ? [] : val;
    return (
      <SelectControl
        mode={
          multiValuesOptions ? SELECTION_MODE.MULTIPLE : SELECTION_MODE.SINGLE
        }
        value={normalize(value)}
        onChange={onChange}
        onBlur={() => onChange(value)}
        options={map(enumOptionsArray, (opt: any) => ({
          label: String(opt),
          value: opt,
        }))}
        showSearch
        showArrow
        name={name}
        placeholder={PLACEHOLDERS.SELECT_OPTIONS}
      />
    );
  };

  const renderDateInput = () => {
    const isValidDateString = moment(value, moment.ISO_8601, true).isValid();
    const dateValue = isValidDateString ? moment(value) : null;

    return (
      <DatePicker
        name={name}
        showTime={type !== PARAM_TYPE.DATE}
        onChange={handleDateChange}
        allowClear
        placeholder={
          type === PARAM_TYPE.DATE
            ? PLACEHOLDERS.SELECT_DATE
            : PLACEHOLDERS.SELECT_DATETIME
        }
        value={dateValue}
        onBlur={() => onChange(value)}
      />
    );
  };
  const renderInput = (type: string) => {
    switch (type) {
      case PARAM_TYPE.DATETIME:
      case PARAM_TYPE.DATE:
        return renderDateInput();
      case PARAM_TYPE.DROPDOWN:
        return renderDropdownInput();
      case PARAM_TYPE.NUMBER:
        return renderNumberInput();
      default:
        return renderTextInput();
    }
  };

  return (
    <StyledParameterInput
      className="parameter-input"
      data-test="ParameterValueInput"
    >
      {renderInput(type)}
    </StyledParameterInput>
  );
};

export default ParameterValueInput;
