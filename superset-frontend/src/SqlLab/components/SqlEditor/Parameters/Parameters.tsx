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
import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@superset-ui/core';
import { Col, Row } from 'antd';
import Collapse from 'src/components/Collapse';
import Icons from 'src/components/Icons';
import { Tooltip } from 'src/components/Tooltip';
import Modal from 'src/components/Modal';
import getBootstrapData from 'src/utils/getBootstrapData';
import ParameterValueInput from './ParameterValueInput';
import ParameterEditor from './ParameterEditor';
import { ComponentConfig, Parameter } from './types';
import TemplateParamsEditor from '../../TemplateParamsEditor';
import {
  COMPONENT_TITLES,
  DEFAULT_PANEL_KEY,
  HELP_TEXT,
  QUERY_PARAM_LIMIT,
} from './constants';

interface QueryParametersProps {
  queryEditorId: string;
  components: ComponentConfig[] | [];
  onValueChange: (name: string, newValue: string | number) => void;
  showModal: boolean;
  setShowModal: (visible: boolean) => void;
  onSaveParameter: (param: Parameter) => void;
  currentParameter: ComponentConfig | undefined;
  setCurrentParameter: (param: ComponentConfig | undefined) => void;
}

const StyledCol = styled(Col)`
  padding: 10px;
  position: relative;
`;
/* eslint-disable theme-colors/no-literal-colors */
const StyledEditIcon = styled(Icons.EditFilled)`
  position: absolute;
  top: 6px;
  right: 10px;
  cursor: pointer;
  border: 1px solid;
  background-color: #e9f6f9;
  border-radius: 20%;
  padding: 3px;
  font-size: 12px; // Adjust font size for smaller icon
  transition: background-color 0.3s;
  border-color: transparent;

  &:hover {
    background-color: #e6e6e6;
  }
`;

/* eslint-disable theme-colors/no-literal-colors */
const CollapseContainer = styled(Collapse)`
  .ant-collapse-item .ant-collapse-header {
    background-color: #e9f6f9;
    color: #1a85a0;
    font-weight: 600;
  }
`;

const StyledLabel = styled.label`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.grayscale.base};
`;

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

const StyledStrong = styled.strong`
  color: ${({ theme }) => theme.colors.grayscale.dark1};
  font-size: 12px;
  text-transform: uppercase;
`;

const StyledParam = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.grayscale.base};
  li {
    margin-bottom: 10px;
  }
`;

const { Panel } = Collapse;

const QueryParameters: React.FC<QueryParametersProps> = ({
  queryEditorId,
  components,
  onValueChange,
  showModal,
  setShowModal,
  onSaveParameter,
  currentParameter,
  setCurrentParameter,
}) => {
  const theme = useTheme();
  const [activeKey, setActiveKey] = useState<string[]>([DEFAULT_PANEL_KEY]);
  const [updatedComponents, setUpdatedComponents] =
    useState<ComponentConfig[]>(components);
  const [existingParameterNames, setExistingParameterNames] = useState<
    string[]
  >([]);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const config = getBootstrapData()?.common?.conf ?? null;
  const MAX_PARAMETERS = config?.QUERY_PARAM_LIMIT ?? QUERY_PARAM_LIMIT;

  useEffect(() => {
    setUpdatedComponents(components);
    setExistingParameterNames(components.map(component => component.name));
  }, [components]);

  const togglePanel = (key: string) => {
    setActiveKey(prevActiveKey => (prevActiveKey.includes(key) ? [] : [key]));
  };

  const handleValueChange = (name: string, newValue: string | number) => {
    onValueChange(name, newValue);
    setUpdatedComponents(prevComponents =>
      prevComponents.map(component =>
        component.name === name ? { ...component, value: newValue } : component,
      ),
    );
  };

  const handleEditClick = (index: number) => {
    setCurrentParameter(updatedComponents[index]);
    setShowModal(true);
  };

  const openParamGuideModal = () => {
    setShowGuideModal(true);
  };

  const getPanelHeader = (title: string) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '8px' }}>{title}</span>
        {components.length > 0 && (
          <TemplateParamsEditor
            language="json"
            onChange={params => console.log(params)}
            queryEditorId={queryEditorId}
            isReadonly
          />
        )}
      </div>
      <Tooltip title={HELP_TEXT.QUERY_PARAM_GUIDE} placement="bottomLeft">
        <Icons.InfoCircleFilled
          onClick={() => openParamGuideModal()}
          iconSize="xl"
          iconColor={theme.colors.primary.base}
        />
      </Tooltip>
    </div>
  );

  const renderParamGuideModalBody = () => (
    <StyledParam>
      <p>Guidelines for using Query Parameters:</p>
      <ul>
        <li>
          <StyledStrong>Adding Parameters:</StyledStrong> Use{' '}
          <code>
            {'{{'} parameter_name {'}}'}
          </code>{' '}
          to add a new parameter to the query.
        </li>
        <li>
          <StyledStrong>Deleting Parameters:</StyledStrong> Remove all instances
          of a parameter to delete it from the Query Parameter List.
        </li>
        <li>
          <StyledStrong>Field Validations:</StyledStrong>
          <ul>
            <li>
              <StyledStrong>Keyword Constraints:</StyledStrong> Must be{' '}
              <strong>alphanumeric</strong> and may include{' '}
              <strong>underscores</strong>. Length:{' '}
              <code>3 to 50 characters (inclusive)</code>.
            </li>
            <li>
              <StyledStrong>Invalid Parameter Names:</StyledStrong>{' '}
              <code>
                {'{{'} test aa {'}}'}
              </code>
              ,{' '}
              <code>
                {'{{'} ab {'}}'}
              </code>
              ,{' '}
              <code>
                {'{{'} _test {'}}'}
              </code>
            </li>
            <li>
              <StyledStrong>Valid Parameter Names:</StyledStrong>{' '}
              <code>
                {'{{'} test_abc {'}}'}
              </code>
              ,{' '}
              <code>
                {'{{'} start_date {'}}'}
              </code>
            </li>
          </ul>
        </li>
        <li>
          <StyledStrong>Query Parameter Limit:</StyledStrong>The user can add up
          to <code>{MAX_PARAMETERS}</code> parameters per query.
        </li>
        <li>
          <StyledStrong>Add New Parameter Button:</StyledStrong> Inserts new
          parameterat cursor or <code>{'{ 0,0 }'}</code> if unavailable.
        </li>
        <li>
          <StyledStrong>Parameter Badge:</StyledStrong> The badge shows the
          total parameters added so far. Clicking on the badge allows the user
          to view the parameters and their values in JSON format.
        </li>
      </ul>
      <p>
        <em>
          Please refer to{' '}
          <code>
            <a
              href={config.USER_GUIDE ?? ''}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.colors.primary.base }}
            >
              User Guide on Query Parameters{' '}
            </a>
          </code>
          for detailed information on how to use query parameters in SQL LAB
        </em>
      </p>
    </StyledParam>
  );

  return (
    <>
      {/* DISPLAYING PARAMETERS WITH JSON TEMPLATE FORMAT */}
      {components?.length > 0 && (
        <CollapseContainer
          activeKey={activeKey}
          bordered={false}
          expandIcon={({ isActive }) => (
            <Icons.CaretRightOutlined
              rotate={isActive ? 90 : 0}
              onClick={() => togglePanel(DEFAULT_PANEL_KEY)}
            />
          )}
        >
          <Panel
            header={getPanelHeader(COMPONENT_TITLES.PARAM_DISPLAY_BAR)}
            key={DEFAULT_PANEL_KEY}
          >
            <Row>
              {updatedComponents.map((component, index) => (
                <StyledCol key={index} style={{ position: 'relative' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignContent: 'center',
                    }}
                  >
                    <Tooltip title={`${component.name}`}>
                      <StyledLabel htmlFor={`input-${index}`}>
                        {`${component.name}`}
                      </StyledLabel>
                    </Tooltip>
                    <div>
                      <Tooltip title={HELP_TEXT.TT_EDIT_PARAM}>
                        <StyledEditIcon
                          onClick={() => handleEditClick(index)}
                          iconColor={theme.colors.primary.base}
                        />
                      </Tooltip>
                    </div>
                  </div>
                  <ParameterValueInput
                    id={`input-${index}`}
                    name={component.name}
                    type={component.type}
                    value={component.value}
                    options={component.options}
                    multiValuesOptions={component.multiValuesOptions}
                    onChange={newValue =>
                      handleValueChange(component.name, newValue)
                    }
                  />
                </StyledCol>
              ))}
            </Row>
          </Panel>
        </CollapseContainer>
      )}

      {/* ADDING OR UPDATING A NEW/EXISTING PARAMETER MODAL */}
      {showModal && (
        <ParameterEditor
          parameter={currentParameter}
          show={showModal}
          onHide={() => {
            setShowModal(false);
          }}
          onSave={(param: Parameter) => onSaveParameter(param)}
          existingParameterNames={existingParameterNames}
        />
      )}

      {/* PARAMETER GUIDE MODAL */}
      {showGuideModal && (
        <StyledModalContainer>
          <StyledModal
            draggable
            show={showGuideModal}
            onHide={() => {
              setShowGuideModal(false);
            }}
            title={COMPONENT_TITLES.PARAM_GUIDE_TITLE}
            footer={<></>}
            responsive
          >
            {renderParamGuideModalBody()}
          </StyledModal>
        </StyledModalContainer>
      )}
    </>
  );
};

export default QueryParameters;
