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
/* eslint-disable no-param-reassign */
import { Dispatch } from 'redux';
import { addDangerToast } from 'src/components/MessageToasts/actions';
import {
  queryEditorSetTemplateParams,
  queryEditorSetParamsConfig,
  queryEditorSetSql,
} from 'src/SqlLab/actions/sqlLab';
import { ComponentConfig, ComponentType } from './types';
import { PARAM_TYPE, PLACEHOLDERS, REGEX } from './constants';

export const formatMultiSelectValuesForStorage = (
  values: any[],
  multiValuesOptions: any,
) => {
  const {
    prefix = '',
    suffix = '',
    separator = ',',
  } = multiValuesOptions || {};
  return values.map(value => `${prefix}${value}${suffix}`).join(separator);
};

export const updateDropdownValue = (
  newParameter: ComponentConfig,
  currentParameter: ComponentConfig,
  optionsArray: string[],
) => {
  const isMultiSelectNew = newParameter?.multiValuesOptions;
  const isMultiSelectPrevious = currentParameter?.multiValuesOptions;

  if (isMultiSelectPrevious && !isMultiSelectNew) {
    newParameter.value = optionsArray.length > 0 ? optionsArray[0] : null;
  } else if (
    isMultiSelectPrevious &&
    isMultiSelectNew &&
    Array.isArray(currentParameter.value)
  ) {
    const validValues = currentParameter.value.filter((val: any) =>
      optionsArray.includes(val),
    );
    newParameter.value = validValues.length > 0 ? validValues : null;
  } else if (!isMultiSelectNew && !isMultiSelectPrevious) {
    if (optionsArray.includes(currentParameter.value)) {
      newParameter.value = currentParameter.value;
    } else {
      newParameter.value = optionsArray.length > 0 ? optionsArray[0] : null;
    }
  } else if (!isMultiSelectPrevious && isMultiSelectNew) {
    newParameter.value = currentParameter.value
      ? [`${currentParameter.value}`]
      : null;
  }
};

export const syncParamsToJinjaTemplate = (
  updatedComponents: ComponentConfig[],
  dispatch: Dispatch,
  queryEditor: any,
) => {
  const jinjaParameters = updatedComponents.reduce(
    (params, component) => {
      let value = component.value ?? null;

      if (
        component.type === PARAM_TYPE.DROPDOWN &&
        component.multiValuesOptions &&
        Array.isArray(value) &&
        value.length > 0
      ) {
        value = formatMultiSelectValuesForStorage(
          value,
          component.multiValuesOptions,
        );
      }

      return { ...params, [component.name]: value };
    },
    {} as Record<string, string | number>,
  );

  console.log('Jinja Parameters syncParamsToJinjaTemplate', jinjaParameters);
  dispatch(
    queryEditorSetTemplateParams(
      queryEditor,
      JSON.stringify(jinjaParameters, null, 2),
    ),
  );
};

export const initializeParameters = (
  queryEditor: any,
  setComponents: React.Dispatch<React.SetStateAction<ComponentConfig[]>>,
) => {
  const { sql } = queryEditor;
  const regex = REGEX.VALID_PARAM;
  const foundParams = new Set<string>();
  let match = regex.exec(sql);

  while (match !== null) {
    foundParams.add(match[1]);
    match = regex.exec(sql);
  }

  const templateParams =
    queryEditor.templateParams &&
    queryEditor.templateParams !== PLACEHOLDERS.NULL
      ? JSON.parse(queryEditor.templateParams)
      : {};

  setComponents(prevComponents => {
    const newComponents = [...prevComponents];

    foundParams.forEach(paramName => {
      if (!prevComponents.some(component => component.name === paramName)) {
        let templateValue = templateParams[paramName];
        let type: ComponentType = PARAM_TYPE.TEXT;
        let options = '';
        let multiValuesOptions = null;

        if (typeof templateValue === PARAM_TYPE.NUMBER) {
          type = PARAM_TYPE.NUMBER;
        } else if (
          typeof templateValue === 'string' &&
          templateValue.includes(',')
        ) {
          type = PARAM_TYPE.DROPDOWN;
          multiValuesOptions = templateValue.includes("'")
            ? { prefix: "'", suffix: "'" }
            : { prefix: '', suffix: '' };

          const cleanedValues = templateValue.replace(/'/g, '').split(',');
          options = cleanedValues.join('\n');
          templateValue = cleanedValues;
        } else {
          type = PARAM_TYPE.TEXT;
        }
        newComponents.push({
          name: paramName,
          type,
          value: templateValue ?? null,
          options,
          multiValuesOptions,
        });
        console.log(
          'newcomponent in initialise parameter on first run after migration',
          newComponents,
        );
      }
    });

    return newComponents;
  });
};

export const updateParamsConfigAndSync = (
  components: ComponentConfig[],
  dispatch: Dispatch,
  queryEditor: any,
) => {
  dispatch(queryEditorSetParamsConfig(queryEditor, JSON.stringify(components)));
  syncParamsToJinjaTemplate(components, dispatch, queryEditor);
};

export const updateComponentsFromSql = (
  sql: string,
  setComponents: React.Dispatch<React.SetStateAction<ComponentConfig[]>>,
  MAX_PARAMETERS: number,
  setShowMaxParamsBanner: React.Dispatch<React.SetStateAction<boolean>>,
  setShowInvalidParamsBanner: React.Dispatch<React.SetStateAction<boolean>>,
  setInvalidParams: React.Dispatch<React.SetStateAction<any>>,
) => {
  setShowMaxParamsBanner(false);
  setShowInvalidParamsBanner(false);

  // Extracting all the unique params from sql query
  const allParamRegex = REGEX.ALL_PARAM;
  const foundParams = new Set<string>();
  let match = allParamRegex.exec(sql);
  while (match !== null) {
    foundParams.add(match[1]);
    match = allParamRegex.exec(sql);
  }

  // Extracting valid unique params from query
  const validParamRegex = REGEX.VALID_PARAM;
  const validParams = new Set<string>();
  let validMatch = validParamRegex.exec(sql);
  while (validMatch !== null) {
    validParams.add(validMatch[1]);
    validMatch = validParamRegex.exec(sql);
  }

  const invalidParams: string[] = [];

  console.log('foundParams in a query', foundParams);
  console.log('validParams in a query', validParams);

  // Extract the size of total unique parameters, If it exceeds the max_param limit set QueryParamExceeds banner
  if (validParams.size > MAX_PARAMETERS) {
    setShowMaxParamsBanner(true);
    return;
  }

  // Extract the invalid parameters from a query. If exists set the InvalidParameterBanner
  foundParams.forEach(paramName => {
    if (!REGEX.VALID_PARAM_NAME.test(paramName)) {
      console.log('invalid Param Names from query', paramName);
      invalidParams.push(paramName);
    }
  });

  // Passing invalid parameters to InvalidParameterBanner
  if (invalidParams?.length > 0) {
    console.log('invalid query parameters list', invalidParams);
    setShowInvalidParamsBanner(true);
    setInvalidParams(invalidParams);
  }

  // Adding the valid parameters to the paramConfigList
  setComponents(prevComponents => {
    const newComponents = [...prevComponents];
    validParams.forEach(paramName => {
      // Add the parameter if it doesn't already exist
      if (!prevComponents.some(component => component.name === paramName)) {
        newComponents.push({
          name: paramName,
          type: PARAM_TYPE.TEXT,
          value: null,
          options: '',
          multiValuesOptions: null,
        });
      }
    });

    return newComponents;
  });

  // Remove components that are no longer in the SQL query
  setComponents(prevComponents =>
    prevComponents.filter(component => foundParams.has(component.name)),
  );
};

export const handleValueChange = (
  name: string,
  newValue: string | number,
  setComponents: React.Dispatch<React.SetStateAction<ComponentConfig[]>>,
) => {
  setComponents(prevComponents =>
    prevComponents.map(component =>
      component.name === name ? { ...component, value: newValue } : component,
    ),
  );
};

export const handleAddParameter = (
  components: ComponentConfig[],
  MAX_PARAMETERS: number,
  dispatch: Dispatch,
  setShowParameterEditor: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrentParameter: React.Dispatch<
    React.SetStateAction<ComponentConfig | undefined>
  >,
) => {
  if (components.length >= MAX_PARAMETERS) {
    dispatch(
      addDangerToast(`You can add up to ${MAX_PARAMETERS} Query Parameters.`),
    );
    return;
  }
  setShowParameterEditor(true);
  setCurrentParameter(undefined);
};

export const handleSaveParameter = (
  newParameter: ComponentConfig,
  currentParameter: ComponentConfig | undefined,
  components: ComponentConfig[],
  MAX_PARAMETERS: number,
  dispatch: Dispatch,
  aceEditorRef: React.RefObject<any>,
  queryEditor: any,
  setComponents: React.Dispatch<React.SetStateAction<ComponentConfig[]>>,
  setShowParameterEditor: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const editor = aceEditorRef.current?.editor;
  if (editor) {
    if (currentParameter) {
      if (currentParameter?.type !== newParameter?.type) {
        newParameter.value = null;
      }

      if (newParameter.type === PARAM_TYPE.DROPDOWN) {
        const optionsArray = newParameter.options.split('\n');
        updateDropdownValue(newParameter, currentParameter, optionsArray);
      }

      setComponents(prevComponents =>
        prevComponents.map(component =>
          component.name === currentParameter?.name ? newParameter : component,
        ),
      );
      console.log('Edit Case: Updated Existing Parameter', newParameter);
    } else {
      // Add new parameter
      setComponents(prevComponents => [...prevComponents, newParameter]);
      console.log('Add Case: Adding New Parameter', newParameter);

      // Insert the new parameter into the SQL query at the current cursor position
      if (components.length >= MAX_PARAMETERS) {
        dispatch(
          addDangerToast(
            `You can add up to ${MAX_PARAMETERS} Query Parameters.`,
          ),
        );
        return;
      }
      // Getting current cursor position
      const cursorPosition = editor.getCursorPosition();
      const parameterPlaceholder = `{{ ${newParameter.name} }}`;
      editor.session.insert(cursorPosition, parameterPlaceholder);
      // updating the sql value with new parameter
      const updatedSql = editor.getValue();
      console.log('updatedSql', updatedSql);
      dispatch(queryEditorSetSql(queryEditor, updatedSql));
      // mover cursor to the relevant cursor position
      editor.moveCursorToPosition({
        row: cursorPosition.row,
        column: cursorPosition.column + parameterPlaceholder.length,
      });
    }
  }
  setShowParameterEditor(false);
};
