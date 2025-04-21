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
import React, { FunctionComponent, useState } from 'react';
import { Row, Col } from 'src/components';
import { t, styled } from '@superset-ui/core';
import { TextArea } from 'src/components/Input';
import Button from 'src/components/Button';
import Modal from 'src/components/Modal';
import withToasts from 'src/components/MessageToasts/withToasts';
import Icons from 'src/components/Icons';
import { Checkbox, Form, Input } from 'antd';
import SelectControl from 'src/explore/components/controls/SelectControl';
import getBootstrapData from 'src/utils/getBootstrapData';
import {
  ComponentType,
  DropdownOption,
  MultiValuesOptions,
  Parameter,
} from './types';
import {
  COMPONENT_TITLES,
  FORM_ERRORS,
  HELP_TEXT,
  LABELS,
  MULTIVALUES_SAMPLE,
  PARAM_TYPE,
  PARAM_TYPE_DROPDOWN_OPTIONS,
  QUERY_PARAM_OPTION_LIMIT,
  QUOTATION_DROPDOWN_OPTIONS,
  REGEX,
  SELECTION_MODE,
} from './constants';

interface ParameterEditorProps {
  parameter: Parameter;
  existingParameterNames: string[];
  show: boolean;
  onHide: () => void;
  onSave: (param: Parameter) => void;
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
}

/* eslint-disable theme-colors/no-literal-colors */
const StyledModalContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;
const StyledModal = styled(Modal)`
  .ant-modal-body {
    overflow: visible;
  }
  .ant-modal-content {
    width: 70%;
    left: 18%;
    margin-top: 15%;
  }
`;

const StyledRow = styled(Row)`
  display: flex;
  justify-content: center;
`;

const StyledForm = styled(Form)`
  .ant-form-item-explain,
  .ant-form-item-extra {
    font-size: 11px !important;
  }
  .ant-form-item-label > label {
    font-size: 12px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.grayscale.base};
  }
  .ant-form-item-explain.ant-form-item-explain-error {
    font-size: 10px;
    color: ${({ theme }) => theme.colors.error.base};
  }
  .ant-form-item-explain.ant-form-item-explain-warning {
    font-size: 10px;
    font-variant: tabular-nums;
    color: ${({ theme }) => theme.colors.warning.base};
  }
  .ant-checkbox-wrapper {
    font-size: 12px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.grayscale.base} !important;
  }
`;

const ParameterEditor: FunctionComponent<ParameterEditorProps> = ({
  parameter,
  existingParameterNames,
  onHide,
  show,
  onSave,
  addDangerToast,
  addSuccessToast,
}) => {
  const config = getBootstrapData()?.common?.conf ?? null;
  const MAX_DROPDOWN_OPTIONS =
    config?.QUERY_PARAM_OPTION_LIMIT ?? QUERY_PARAM_OPTION_LIMIT;
  const [form] = Form.useForm();
  const [param, setParam] = useState<Parameter>(parameter);
  const isNew = !parameter?.name;

  const [paramTypeDropdown, setParamTypeDropdown] = useState<DropdownOption[]>(
    PARAM_TYPE_DROPDOWN_OPTIONS,
  );
  const [quotationDropdown, setQuotationDropdown] = useState<DropdownOption[]>(
    QUOTATION_DROPDOWN_OPTIONS,
  );
  const [submitting, setSubmitting] = useState<boolean>(false);

  const footer = () => (
    <>
      <Button
        data-test="param-cancel-button"
        htmlType="button"
        buttonSize="small"
        onClick={onHide}
      >
        {COMPONENT_TITLES.CANCEL}
      </Button>
      <Button
        data-test="param-save-button"
        htmlType="submit"
        buttonSize="small"
        buttonStyle="primary"
        onClick={() => form.submit()}
      >
        {submitting && <Icons.LoadingOutlined iconSize="l" />}{' '}
        {isNew ? COMPONENT_TITLES.ADD : COMPONENT_TITLES.UPDATE}
      </Button>
    </>
  );

  const extractMultiDropdownHelpText = (
    multiValuesOptions: MultiValuesOptions,
  ) => {
    const { prefix, suffix } = multiValuesOptions;
    return MULTIVALUES_SAMPLE.map(value => `${prefix}${value}${suffix}`).join(
      ',',
    );
  };

  const onConfirm = () => {
    setSubmitting(true);
    onSave(param);
    setSubmitting(false);
  };

  const isNameUnique = (name: string) => !existingParameterNames.includes(name);

  const renderModalBody = () => (
    <StyledForm
      form={form}
      onFinish={onConfirm}
      layout="vertical"
      initialValues={parameter || {}}
    >
      {isNew && (
        <StyledRow gutter={16}>
          <Col span={20}>
            <Form.Item
              name="name"
              required
              label={t(LABELS.KEYWORD)}
              tooltip={HELP_TEXT.KEYWORD}
              rules={[
                {
                  required: true,
                  message: FORM_ERRORS.REQUIRED,
                },
                {
                  min: 3,
                  message: FORM_ERRORS.MIN_VALUE,
                },
                {
                  max: 50,
                  message: FORM_ERRORS.MAX_VALUE,
                },
                {
                  pattern: REGEX.FORM_PARAM_NAME_REGEX,
                  message: FORM_ERRORS.KEYWORD_REGEX,
                },
                {
                  validator: (_, value) =>
                    isNameUnique(value)
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(FORM_ERRORS.KEYWORD_ALREADY_EXIST),
                        ),
                },
              ]}
              extra={HELP_TEXT.KEYWORD}
            >
              <Input
                name="name"
                value={param?.name}
                onChange={e => {
                  const name = e.target.value;
                  setParam({ ...param, name });
                }}
                autoFocus
              />
            </Form.Item>
          </Col>
        </StyledRow>
      )}
      <StyledRow gutter={16}>
        <Col span={20}>
          <Form.Item
            name="type"
            label={t(LABELS.PARAM_TYPE)}
            extra={HELP_TEXT.PARAM_TYPE}
            required
            tooltip={HELP_TEXT.PARAM_TYPE}
            rules={[
              {
                required: true,
                message: FORM_ERRORS.REQUIRED,
              },
            ]}
          >
            <SelectControl
              mode={SELECTION_MODE.SINGLE}
              value={param?.type}
              onChange={(type: ComponentType) => {
                setParam({ ...param, type });
              }}
              options={paramTypeDropdown}
              showSearch
              showArrow
            />
          </Form.Item>
        </Col>
      </StyledRow>
      {param?.type === PARAM_TYPE.DROPDOWN && (
        <StyledRow gutter={16}>
          <Col span={20}>
            <Form.Item
              name="options"
              label={LABELS.DROPDOWN_OPTIONS}
              extra={HELP_TEXT.DROPDOWN_OPTIONS}
              required={param?.type === PARAM_TYPE.DROPDOWN}
              tooltip={HELP_TEXT.DROPDOWN_OPTIONS}
              rules={[
                {
                  required: param?.type === PARAM_TYPE.DROPDOWN,
                  message: FORM_ERRORS.REQUIRED,
                },
                {
                  validator: (_, value) => {
                    const optionsArray = value.split('\n');
                    return optionsArray.length <= 1000
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            `${FORM_ERRORS.DROPDOWN_LIMIT_EXCEEDED} ${MAX_DROPDOWN_OPTIONS} options.`,
                          ),
                        );
                  },
                },
              ]}
            >
              <TextArea
                rows={3}
                value={param?.options ?? ''}
                onChange={e => {
                  const uniqueOptions = Array.from(
                    new Set(e.target.value.split('\n')),
                  ).join('\n');
                  setParam({ ...param, options: uniqueOptions });
                }}
              />
            </Form.Item>
          </Col>
        </StyledRow>
      )}
      {param?.type === PARAM_TYPE.DROPDOWN && (
        <StyledRow gutter={16} style={{ marginTop: '-30px' }}>
          <Col span={20}>
            <Form.Item label=" " colon={false}>
              <Checkbox
                defaultChecked={!!param?.multiValuesOptions}
                onChange={e =>
                  setParam({
                    ...param,
                    multiValuesOptions: e.target.checked
                      ? { prefix: '', suffix: '', separator: ',' }
                      : null,
                  })
                }
              >
                {t(LABELS.MULTIVALUE_SELECTION_CEHCKBOX)}
              </Checkbox>
            </Form.Item>
          </Col>
        </StyledRow>
      )}
      {param?.type === PARAM_TYPE.DROPDOWN && param?.multiValuesOptions && (
        <StyledRow gutter={16}>
          <Col span={20}>
            <Form.Item
              label={LABELS.QUOTATION}
              extra={
                <React.Fragment>
                  {HELP_TEXT.QUOTATION}
                  {param.multiValuesOptions?.prefix
                    ? ' string values:'
                    : ' number values:'}{' '}
                  <code>
                    {extractMultiDropdownHelpText(param.multiValuesOptions)}
                  </code>
                </React.Fragment>
              }
              required={
                !!(
                  param?.type === PARAM_TYPE.DROPDOWN &&
                  param?.multiValuesOptions
                )
              }
              tooltip={HELP_TEXT.QUOTATION_TOOLTIP}
              rules={[
                {
                  required: !!(
                    param?.type === PARAM_TYPE.DROPDOWN &&
                    param?.multiValuesOptions
                  ),
                  message: FORM_ERRORS.REQUIRED,
                },
              ]}
            >
              <SelectControl
                clearable={false}
                mode={SELECTION_MODE.SINGLE}
                value={param.multiValuesOptions.prefix}
                onChange={(quoteOption: any) =>
                  setParam({
                    ...param,
                    multiValuesOptions: {
                      ...param.multiValuesOptions,
                      prefix: quoteOption,
                      suffix: quoteOption,
                    },
                  })
                }
                options={quotationDropdown}
              />
            </Form.Item>
          </Col>
        </StyledRow>
      )}
    </StyledForm>
  );

  return (
    <StyledModalContainer>
      <StyledModal
        draggable
        onHide={onHide}
        show={show}
        title={
          parameter?.name ? parameter?.name : COMPONENT_TITLES.ADD_MODAL_TITLE
        }
        footer={footer()}
        responsive
      >
        {renderModalBody()}
      </StyledModal>
    </StyledModalContainer>
  );
};

export default withToasts(ParameterEditor);
