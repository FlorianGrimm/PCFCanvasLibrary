// <reference path="./../../node_modules/@types/powerapps-component-framework/componentframework.d.ts" />

import { MockPCFClient } from "./MockPCFClient";
import { MockPCFDevice } from "./MockPCFDevice";
import { MockPCFFactory } from "./MockPCFFactory";
import { MockPCFFormatting } from "./MockPCFFormatting";
import { MockPCFMode } from "./MockPCFMode";
import { MockPCFNavigation } from "./MockPCFNavigation";
import { MockPCFResources } from "./MockPCFResources";
import { MockPCFUserSettings } from "./MockPCFUserSettings";
import { MockPCFUtility } from "./MockPCFUtility";
import { MockPCFWebApi } from "./MockPCFWebApi";


export type ContextParameters<T, K extends keyof T> = {
  [P in K]: T[P] extends ComponentFramework.PropertyTypes.Property ? T[P] : never;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
export class MockPCFContext<TInputs> implements ComponentFramework.Context<TInputs> {
  constructor(parameters: TInputs) {
    this.client = new MockPCFClient();
    this.device = new MockPCFDevice();
    this.factory = new MockPCFFactory();
    this.formatting = new MockPCFFormatting();
    this.mode = new MockPCFMode();
    this.navigation = new MockPCFNavigation();
    this.resources = new MockPCFResources();
    this.userSettings = new MockPCFUserSettings();
    this.utils = new MockPCFUtility();
    this.webAPI = new MockPCFWebApi();
    this.parameters = parameters;
  }
  client: ComponentFramework.Client;
  device: ComponentFramework.Device;
  factory: ComponentFramework.Factory;
  formatting: ComponentFramework.Formatting;
  mode: ComponentFramework.Mode;
  navigation: ComponentFramework.Navigation;
  resources: ComponentFramework.Resources;
  userSettings: ComponentFramework.UserSettings;
  utils: ComponentFramework.Utility;
  webAPI: ComponentFramework.WebApi;
  parameters: TInputs;
  updatedProperties: string[] = [];
}

export function createNumberProperty(raw: number | null): ComponentFramework.PropertyTypes.NumberProperty {
  return {
    error: false,
    errorMessage: "",
    formatted: undefined,
    security: undefined,
    type: "",

    raw: raw,
    attribute: undefined
  } as ComponentFramework.PropertyTypes.NumberProperty;
}

export function createDecimalNumberProperty(raw: number | null): ComponentFramework.PropertyTypes.DecimalNumberProperty {
  return {
    error: false,
    errorMessage: "",
    formatted: undefined,
    security: undefined,
    type: "",

    raw: raw,
    attribute: undefined
  } as ComponentFramework.PropertyTypes.DecimalNumberProperty;
}

export function createFloatingNumberProperty(raw: number | null): ComponentFramework.PropertyTypes.FloatingNumberProperty {
  return {
    error: false,
    errorMessage: "",
    formatted: undefined,
    security: undefined,
    type: "",

    raw: raw,
    attribute: undefined
  } as ComponentFramework.PropertyTypes.FloatingNumberProperty;
}

export function createWholeNumberProperty(raw: number | null): ComponentFramework.PropertyTypes.WholeNumberProperty {
  return {
    error: false,
    errorMessage: "",
    formatted: undefined,
    security: undefined,
    type: "",

    raw: raw,
    attribute: undefined
  } as ComponentFramework.PropertyTypes.WholeNumberProperty;
}

export function createDateTimeProperty(raw: Date | null): ComponentFramework.PropertyTypes.DateTimeProperty {
  return {
    error: false,
    errorMessage: "",
    formatted: undefined,
    security: undefined,
    type: "",

    raw: raw,
    attribute: undefined
  } as ComponentFramework.PropertyTypes.DateTimeProperty;
}

export function createStringProperty(raw: string | null): ComponentFramework.PropertyTypes.StringProperty {
  return {
    error: false,
    errorMessage: "",
    formatted: undefined,
    security: undefined,
    type: "",

    raw: raw,
    attribute: undefined
  } as ComponentFramework.PropertyTypes.StringProperty;
}

export function createEnumProperty<EnumType>(type: string, raw: EnumType): ComponentFramework.PropertyTypes.EnumProperty<EnumType> {
  return {
    error: false,
    errorMessage: "",
    formatted: undefined,
    security: undefined,
    type: type,

    raw: raw,
    attribute: undefined
  } as ComponentFramework.PropertyTypes.EnumProperty<EnumType>;
}

export function createOptionSetProperty(raw: number): ComponentFramework.PropertyTypes.OptionSetProperty {
  return {
    error: false,
    errorMessage: "",
    formatted: undefined,
    security: undefined,
    type: "",

    raw: raw,
    attribute: undefined
  } as ComponentFramework.PropertyTypes.OptionSetProperty;
}
export function createMultiSelectOptionSetProperty(raw: number[] | null): ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty {
  return {
    error: false,
    errorMessage: "",
    formatted: undefined,
    security: undefined,
    type: "",

    raw: raw,
    attribute: undefined
  } as ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty;
}

export function createTwoOptionsProperty(raw: boolean): ComponentFramework.PropertyTypes.TwoOptionsProperty {
  return {
    error: false,
    errorMessage: "",
    formatted: undefined,
    security: undefined,
    type: "",

    raw: raw,
    attribute: undefined
  } as ComponentFramework.PropertyTypes.TwoOptionsProperty;
}

export class MockEntityReference implements ComponentFramework.EntityReference {
  /**
   * The record id. Read-only.
   */
  id: { guid: string; };

  /**
   * The entity logical name. Read-only.
   */
  etn?: string;

  /**
   * The name of the entity reference. Read-only.
   */
  name: string;

  constructor(
    id?: string,
    entityType?: string,
    name?: string
  ) {
    this.id = { guid: id || "" };
    this.etn = entityType || undefined;
    this.name = name || "";
  }
}

// 
export type EntityRecordFormattedValues = { [columnName: string]: string };
export type EntityRecordValues = { [columnName: string]: string | Date | number | number[] | boolean | ComponentFramework.EntityReference | ComponentFramework.EntityReference[] };
// 
export class MockEntityRecord implements ComponentFramework.PropertyHelper.DataSetApi.EntityRecord {
  _RecordId: string;
  _Values: EntityRecordValues;
  _FormattedValues: EntityRecordFormattedValues;
  _NamedReference: ComponentFramework.EntityReference;

  constructor(
    recordId: string,
    values?: EntityRecordValues | null | undefined,
    formattedValue?: EntityRecordFormattedValues | null | undefined,
    namedReference?: ComponentFramework.EntityReference | null | undefined,
  ) {
    this._RecordId = recordId;
    this._Values = values || {};
    this._FormattedValues = formattedValue || {};
    this._NamedReference = namedReference as unknown as ComponentFramework.EntityReference;
  }

  /**
  * Get the current formatted value of this record column.
  * @param columnName Column name of the record
  */
  getFormattedValue(columnName: string): string {
    return this._FormattedValues[columnName];
  }

  /**
   * Get the record ID
   */
  getRecordId(): string {
    return this._RecordId;
  }

  /**
   * Get the raw value of the record's column
   * @param columnName Column name of the record
   */
  getValue(columnName: string): string | Date | number | number[] | boolean | ComponentFramework.EntityReference | ComponentFramework.EntityReference[] {
    return this._Values[columnName];
  }

  /**
   * Get the object that encapsulates an Entity Reference as a plain object
   */
  getNamedReference(): ComponentFramework.EntityReference {
    return null! as unknown as ComponentFramework.EntityReference;
  }
}

/**
     * The structure of a dataset property as it would be passed to a control
     */
export class MockDataSet implements ComponentFramework.PropertyTypes.DataSet {
  _SelectedRecordIds: string[];

  /**
     * Adds column to the columnset
     * @param name column name to be added to the columnset
     * @param entityAlias entity alias for which the column name needs to be added
     */
  addColumn?: (name: string, entityAlias?: string) => void;

  /**
   * Set of columns available in this dataset.
   */
  columns: ComponentFramework.PropertyHelper.DataSetApi.Column[];

  /**
   * True if encountered error while data retrieval
   */
  error: boolean;

  /**
   * The error message associated with the last encountered error, if applicable
   */
  errorMessage: string;

  /**
   * The column filtering for the current query.
   */
  filtering: ComponentFramework.PropertyHelper.DataSetApi.Filtering;

  /**
   * Related entity info
   */
  linking: ComponentFramework.PropertyHelper.DataSetApi.Linking;

  /**
   * Indicate if the dataset property is in loading state or not
   */
  loading: boolean;

  /**
   * Pagination status and actions.
   */
  paging: ComponentFramework.PropertyHelper.DataSetApi.Paging;

  /**
   * Map of IDs to the full record object
   */
  records: {
    [id: string]: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;
  };

  /**
   * IDs of the records in the dataset, order by the query response result
   */
  sortedRecordIds: string[];

  /**
   * The sorting status for the current query.
   */
  sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];

  constructor() {
    this._SelectedRecordIds = [];
    this.columns = [];
    this.error = false;
    this.errorMessage = "";
    this.filtering = null as unknown as ComponentFramework.PropertyHelper.DataSetApi.Filtering;
    this.linking = null as unknown as ComponentFramework.PropertyHelper.DataSetApi.Linking;
    this.loading = false;
    this.paging = null as unknown as ComponentFramework.PropertyHelper.DataSetApi.Paging;
    this.records = {};
    this.sortedRecordIds = [];
    this.sorting = [];

  }

  /**
   * Clear selected record ids list
   */
  clearSelectedRecordIds(): void {
    this._SelectedRecordIds.splice(0, this._SelectedRecordIds.length);
  }

  /**
   * Retrieves all selected record ids
   */
  getSelectedRecordIds(): string[] {
    return ([] as string[]).concat(...this._SelectedRecordIds);
  }

  /**
   * Get DataSet target entity logical name
   */
  getTargetEntityType(): string {
    throw new Error("NYI");
  }

  /**
   * Retrieves the view display name used by the dataset property
   */
  getTitle(): string {
    throw new Error("NYI");
  }

  /**
   * Gets Id of view used by the dataset property
   */
  getViewId(): string {
    throw new Error("NYI");
  }

  /**
   * Open dataSet item for a given EntityReference. It will check if there is a command with command button id "Mscrm.OpenRecordItem".
   * If there is, it will execute the command, otherwise it will just navigate to the associated form of the entityReference
   * @param entityReference entity reference
   */
  openDatasetItem(entityReference: ComponentFramework.EntityReference): void {
    throw new Error("NYI");
  }

  /**
   * Refreshes the dataset based on filters, sorting, linking, new column. New data will be pushed to control in another 'updateView' cycle.
   */
  refresh(): void {
    throw new Error("NYI");
  }

  /**
   * Set the ids of the selected records
   * @ids List of recordId's
   */
  setSelectedRecordIds(ids: string[]): void {
    this._SelectedRecordIds.splice(0, this._SelectedRecordIds.length);
    this._SelectedRecordIds.push(...ids);
  }
}
export function createDataset(
  columnNames: (string | Partial<ComponentFramework.PropertyHelper.DataSetApi.Column>)[],
  entityRecords: MockEntityRecord[]
): ComponentFramework.PropertyTypes.DataSet {
  const result = new MockDataSet();
  columnNames.forEach((columnName, idx) => {
    if (typeof columnName === "string") {
      result.columns.push({
        name: columnName,
        displayName: columnName,
        order: idx,
      } as ComponentFramework.PropertyHelper.DataSetApi.Column);
    } else {
      const column = columnName as ComponentFramework.PropertyHelper.DataSetApi.Column
      if (!column.displayName) { column.displayName = column.name; }
      if ((column.order ?? -1) < 0) { column.order = idx; }
    }
  });
  entityRecords.forEach((entityRecord) => {
    const recordId = entityRecord.getRecordId();
    result.records[recordId] = entityRecord;
    result.sortedRecordIds.push(recordId);
  });
  return result;
}