## Config Docs

#### filter object
```
{
  '<path>': {
    listview: {
      'row-filters': [
        filter objects ...
      ]
    },
    'add-points': {
      'option-filters': [
        filter objects ...
      ]
    }
  }
}

# Sample filter object (if working with is array of purses [purse])
{
  "field": "name", /* Purse Policy Name */
  "filter-type": "nin", /* allowed values [in, nin] */
  "values": ["Welcome"] /* Purse Policy Names to be ignored */
}
```

#### basic object for a tab
```
{
  listview: { // It is object which consists of the columns to display and some features of listview
    data: [list of column objects] // ref to sample column object
    isExpandable: <boolean> // tells if the row of the table is expandable to show nested table
  },
  ### this is exclusively for point-summary
  add-points: {
    form: [list of form objects] // to be displayed in the add-points ui // ref to form object
    append-to-activity: [list of fields to be appended to acttivity object],
    option-filters: (ref filter object) for filtering the data based on config
    activity-template: basic structure of activity object
    disable-adjustments: list of purses that we don't allow for adjustments
  }
}
```

#### sample column object
#### Config for all tabs except account-summary
```
{
  field: The header of the column
  label: It is String to be displayed as column name
  type: string/number/date/table
  ```
    string - normal string
    number - will have two pipes based on requirement number/currency. Based on pipe used data is displayed
    date - to display date we use three types of pipes localDate/dateOnlyFormat/dateTimeFormat. These functionality can be seen in pipes service
    table - this tells us the row is linked with another expandable table where we show some extended data. it will be linked to another object in config with ref field
  ```
  pipe: based on the requirement we can use currency/localDate/dateOnlyFormat/dateTimeFormat/number/date
  default: this is the default which will be displayed if the value is null/undefined
  uniqueField: This field is used to set the header as alternate for 'field' if the field is having nested object declaration (e.g. if field is like a.b.c then we should use uniqueField and set to c)
  subType: tells us which field have the data to be used in pipeService
  isExpandField: should be true for expandColumn field which refers to another meta table through ref
  row-filers: (ref filter object) for filtering the value based on config
}
```

#### form object
```
{
  field: variable to store the value of input
  type: datatype of the input value
  input-type: based on this the form-fields are displayed (input, textarea, dropdown, autocomplete),
  required: <boolean> tells us if the field is required field,
  displayField: used for dropdown/autocomplete to tell which field of the data object to displayed as option
  label: placeholder/label for the input
  model: tells us to fetch which model data for the input
  query: query at config level to fetch data from db
  createIfNotExist: <boolean> used for autocomplete input-type if set to true then create new option if it doesn't have the required one
  initLimit: number of values to fetch per call
  queryOptions: these are some external params to be sent to request along with query
}
```

#### account object
```
{
  bread-crumb: list of member details to be shown space seperated string on top-left of mcp
  bread-crumb-ext: list of member details to shown on top-left in brackets with - seperated
}
```