import fs from 'fs-extra';
import chalk from 'chalk';
import { generateSingleActionThunk } from '../../../templates/react/redux/redux-thunk/generateSingleActionThunk.js';
import { generateModelSliceThunk } from '../../../templates/react/redux/redux-thunk/generateModelSliceThunk.js';
import { addThunkActionToSlice } from '../../actions/addThunkActionToSlice.js';

interface ThunkConfig {
  stateManagement: string;
}

interface ThunkOptions {
  action?: string;
}

/**
 * Generates or updates a thunk based on the given options.
 *
 * @param {Object} config - The configuration object.
 * @param {Object} options - The options for thunk generation.
 * @param {string} modelName - The name of the model.
 * @param {boolean} sliceFileExists - Whether the slice file already exists.
 * @param {string} sliceDir - The directory for the slice file.
 * @param {string} sliceFilePath - The path to the slice file.
 * @returns {Promise<void>}
 */
export async function generateThunk(
  config: ThunkConfig,
  options: ThunkOptions,
  modelName: string,
  sliceFileExists: boolean,
  sliceDir: string,
  sliceFilePath: string
) {
  if (config.stateManagement !== 'reduxThunk') {
    console.log(chalk.red('Thunks are not used with redux-saga.'));
    return;
  }

  if (options.action) {
    await generateOrUpdateThunkWithAction(
      modelName,
      options.action,
      sliceFileExists,
      sliceDir,
      sliceFilePath
    );
  }
}

async function generateOrUpdateThunkWithAction(
  modelName: string,
  action: string,
  sliceFileExists: boolean,
  sliceDir: string,
  sliceFilePath: string
) {
  if (sliceFileExists) {
    const existingSliceCode = await fs.readFile(sliceFilePath, 'utf8');
    const { newThunkCode, newExtraReducersCode } = generateSingleActionThunk(
      modelName,
      action
    );
    const updatedSliceCode = addThunkActionToSlice(
      existingSliceCode,
      newThunkCode,
      newExtraReducersCode
    );
    await fs.writeFile(sliceFilePath, updatedSliceCode);
    console.log(
      chalk.green(`Thunk action '${action}' added to slice '${modelName}'.`)
    );
  } else {
    await fs.ensureDir(sliceDir);
    const fullSliceCode = generateModelSliceThunk(modelName);
    await fs.writeFile(sliceFilePath, fullSliceCode);
    console.log(chalk.green(`Slice for ${modelName} created.`));
    const existingSliceCode = await fs.readFile(sliceFilePath, 'utf8');
    const { newThunkCode, newExtraReducersCode } = generateSingleActionThunk(
      modelName,
      action
    );
    const updatedSliceCode = addThunkActionToSlice(
      existingSliceCode,
      newThunkCode,
      newExtraReducersCode
    );
    await fs.writeFile(sliceFilePath, updatedSliceCode);
    console.log(
      chalk.green(`Thunk action '${action}' added to slice '${modelName}'.`)
    );
  }
}
