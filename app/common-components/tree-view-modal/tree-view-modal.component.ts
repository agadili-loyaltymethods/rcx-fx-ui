import { Component, Inject, Input, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';


import {
  InputBodyFieldDefs,
  InputFieldDefs,
  ResponseBodyFieldDefs,
  ResponseFieldDefs
} from 'src/app/models/template';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

export class InputNode {
  children: InputNode[];
  mappedValue?: string;
  constructor(
    public item: string,
    public index: number,
    public inputType?: string,
    public isMappingKey: boolean = false
  ) {
    this.index = index || 0;
  }
}
@Component({
  selector: 'app-tree-view-modal',
  templateUrl: './tree-view-modal.component.html',
  styleUrls: ['./tree-view-modal.component.scss'],
})
export class TreeViewModalComponent {
  @ViewChild('treeContainer') treeContainer: ElementRef;
  treeControl: NestedTreeControl<InputNode>;
  dataSource: MatTreeNestedDataSource<InputNode>;
  treeData: any = [];
  isDropdownOpen = false;
  newNodeName: any;
  newMappedValue = '';
  addNode: InputNode;
  title: string = '';
  errorMessage: string = '';
  operators: any = ['+', '-', '*', '/', '%'];
  isMappingPairMode = false;
  mappingPairs: {[key: string]: string} = {};
  currentMappingKey: string = '';
  isSubmitDisabled: boolean = true;

  modelMap = {
    'Input File-Header': InputFieldDefs,
    'Input File-Body': InputBodyFieldDefs,
    'Input File-Footer': InputFieldDefs,
    'Response File-Header': ResponseFieldDefs,
    'Response File-Body': ResponseBodyFieldDefs,
    'Response File-Footer': ResponseFieldDefs,
  };

  item = {
    field: 'selectField',
    selectValue: 'value',
    selectLabel: 'label',
    label: 'Select Option',
  };
  constructor(
    public dialogRef: MatDialogRef<any>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
      dialogRef.disableClose = true;
      this.treeControl = new NestedTreeControl<InputNode>(this.getChildren);
    this.dataSource = new MatTreeNestedDataSource();
    this.dataSource.data = this.treeData;
  }

  inputData: any;
  properties: any;
  file: any;
  fileSelected: Boolean = false;
  isToggleActive: Boolean = false;
  dialogTypes = ['testFile'];
  confirmationButton: any;
  isAddingNode: boolean = false;
  dropdownOptions = [];
  loadCustomText: boolean = false;
  isTextValid: boolean = false;
  regex = /^\d+$/;
  isEdit = false;
  editingNode: any;

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectionChange(item: any) {
    console.log('Selection changed:', item);
  }

  // Handler for additional actions on option click
  handleChange(item: any) {
    console.log('Option clicked:', item);
  }

  close () {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.properties = this.data?.properties;
    this.generateTree();
  }

  onDropdownValueChange(event: any) {
    this.errorMessage = '';
    if (event.isReserved) {
      this.loadCustomText = true;
      this.isTextValid = false;
    } else if(this.operators.includes(event.value)) {
      this.loadCustomText = true;
      this.isTextValid = true;
    }
    else {
      this.loadCustomText = false;
      this.isTextValid = true;
    }
    this.isSubmitDisabled = !event.value || (this.loadCustomText && !this.isTextValid);
  }

  onInputTextChange(event: any) {
    this.errorMessage = '';
    if (this.data.rowData.transform === 'ArithmeticTransform' || this.data.rowData.transform === 'JoinTransform') {
      this.newNodeName = event;
    }
    if (this.data.rowData.transform === 'MappingTransform') {
      this.isSubmitDisabled = !this.newNodeName || !this.newMappedValue;
    } else {
      this.isTextValid = event.length > 0;
      this.isSubmitDisabled = this.isAddingNode && (!this.newNodeName || (this.loadCustomText && !this.isTextValid));
    }
  }

  isValidInput(): boolean {
    return this.loadCustomText ? this.isTextValid : this.newMappedValue.length > 0;
  }

  getChildren = (node: InputNode): InputNode[] => node.children;


  hasChildren = (_index: number, node: InputNode) => {
    return node.children.values.length > 0;
  };

  getNodeName(node: InputNode) {
    return node.item;
  }

  parseString(str) {
    if (this.data.rowData.transform === 'MappingTransform') {
      try {
        const mappingObject = JSON.parse(str);
        const result = [];
        Object.entries(mappingObject).forEach(([key, value]) => {
          // Trim both key and value if they're strings
          const trimmedKey = typeof key === 'string' ? key.trim() : key;
          const trimmedValue = typeof value === 'string' ? value.trim() : value;
          result.push({key: trimmedKey, value: trimmedValue});
        });
        return result;
      } catch (e) {
        console.error('Error parsing mapping transform:', e);
        return [];
      }
    }

    // For FieldJoinTransform and other transforms
    // First, split by newlines to preserve them as separate items
    if (str.includes('\n')) {
      const lines = str.split('\n');
      const result = [];
      
      for (const line of lines) {
        if (line.length === 0) continue; // Skip truly empty lines, but keep lines with spaces
        
        // Process each line for field references
        const lineRegex = /\$\{([^}]+)\}|([^${}]+)/g;
        let matches;
        
        let hasMatches = false;
        while ((matches = lineRegex.exec(line)) !== null) {
          hasMatches = true;
          if (matches[1]) {
            // This is a field reference ${fieldName}
            result.push(matches[1]);
          } else if (matches[2]) {
            // This is custom text, add it even if it's just spaces
            result.push(matches[2]);
          }
        }
        
        // If the line had no matches but wasn't empty, add it as is
        if (!hasMatches && line) {
          result.push(line);
        }
      }
      
      return result;
    } else {
      // behavior for single-line content
      const regex = /\$\{([^}]+)\}|([^${}]+)/g;
      let matches;
      const result = [];
    
      while ((matches = regex.exec(str)) !== null) {
        if (matches[1]) {
          // This is a field reference ${fieldName}
          result.push(matches[1]);
        } else if (matches[2]) {
          // This is custom text, add it even if it's just spaces
          result.push(matches[2]);
        }
      }
    
      return result;
    }
  }

  generateTree() {
    this.title = this.data.enumData.TransformType.find(
      (type: any) => type.value === this.data.rowData.transform)?.label || '';
    let existingTreeData = this.data.rowData.transformExpr; 
    if (existingTreeData?.length) {
      if (this.data.rowData.transform === 'MappingTransform') {
        try {
          const mappings = this.parseString(existingTreeData);
          this.isAddingNode = false;
          mappings.forEach(({key, value}, index) => {
            const newNode = new InputNode(key, index, 'customText');
            newNode.mappedValue = value;
            this.treeData.push(newNode);
          });
          this.treeData.push(new InputNode('Add', this.treeData.length, 'reservedNode'));
        } catch (e) {
          console.error('Error parsing mapping transform:', e);
          let node = new InputNode('Add', 0);
          this.treeData.push(node);
          this.onNodeClick(node);
        }
      } else {
        let nodes = this.parseString(existingTreeData);
        let inputType;
        this.isAddingNode = false;
        nodes.forEach((node, index) => {
          if (this.data.fields.includes(node) || (this.data.rowData.transform === 'ArithmeticTransform' && this.operators.includes(node))) {
            inputType = 'dropDown'
          } else {
            inputType = 'customText'
          }
          this.treeData.push(new InputNode(node, index, inputType))
        });
        this.treeData.push(new InputNode('Add', nodes.length, 'reservedNode'));
      }
    } else {
      let node = new InputNode(
        `Add`,
        0,
        'reservedNode'
      );
      
      this.treeData.push (node);
      this.onNodeClick(node);
    }    
    this.dataSource.data = this.treeData;
    this.treeControl.dataNodes = this.treeData;
  }

  onNodeClick(node) {
    // Close the current editing or adding node if any
    if (this.isAddingNode || this.isEdit) {
      this.cancelAddNode(this.editingNode || this.addNode);
    }
    // Adding new node
    this.isAddingNode = true;
    this.addNode = node; // Track the new node being added
    node.isAddingNode = true;
    this.newNodeName = '';
    this.newMappedValue = '';
    this.editingNode = null;

    this.dropdownOptions = [];

    if (this.data.rowData.transform === 'ArithmeticTransform') {
      let dataLength = this.dataSource.data.length;
      if (dataLength % 2 !== 0) {
        this.data.fields.forEach(field => this.dropdownOptions.push({label: field, value: field}));
        this.dropdownOptions.push({label: 'Custom Text', value: 'Custom Text', isReserved: true});
      } else {
        this.operators.forEach(field => this.dropdownOptions.push({label: field, value: field}));
      }
    } else {
      this.data.fields.forEach(field => this.dropdownOptions.push({label: field, value: field}));
      this.dropdownOptions.push({label: 'Custom Text', value: 'Custom Text', isReserved: true});
    }
  }
  
  confirmAddNode(node) {
    if (this.data.rowData.transform !== 'MappingTransform') {
        this.newNodeName = this.newNodeName?.value || this.newNodeName;
    }
    if (!this.newNodeName?.length) {
      this.errorMessage = 'Please provide a valid field';
      return;
    }
    let inputType = this.loadCustomText ? 'customText' : 'dropDown';
    if (this.data.rowData.transform === 'ArithmeticTransform') {
      let index = this.isEdit ? node.index+1 : this.dataSource.data.length;
      if ((index % 2 !== 0) && !(this.regex.test(this.newNodeName) || this.data.fields.includes(this.newNodeName))) {
          this.errorMessage = 'Please provide a valid number';
          return;
      }
      inputType = this.data.fields.includes(this.newNodeName) || this.operators.includes(this.newNodeName) ? 'dropDown' : inputType;
    }
    
    // Trim the node name only for MappingTransform
    const trimmedNodeName = this.data.rowData.transform === 'MappingTransform' ? this.newNodeName.trim() : this.newNodeName;
    
    if (this.isEdit && this.editingNode) {
      this.editingNode.item = this.newNodeName;
      this.editingNode.inputType = inputType;
      
      if (this.data.rowData.transform === 'MappingTransform') {
        this.editingNode.mappedValue = this.newMappedValue;
        this.mappingPairs[this.newNodeName] = this.newMappedValue;
        if (!this.newMappedValue.length) {
          this.errorMessage = 'Please provide a valid value';
          return;
        }
      }  // Reset edit mode
      node.isAddingNode = false;
      this.editingNode.isAddingNode = false;
      node.disable = false;

      this.isEdit = false;
      this.editingNode = null;
    } else {
    const newNode = new InputNode(
      trimmedNodeName,
      this.dataSource.data.length-1,
      inputType
    );

    if (this.data.rowData.transform === 'MappingTransform') {
      // Trim the mapped value
      const trimmedValue = this.newMappedValue.trim();
      newNode.mappedValue = trimmedValue;
      this.mappingPairs[trimmedNodeName] = trimmedValue;
      if (!trimmedValue.length) {
        this.errorMessage = 'Please provide a valid value';
        return;
      }
      if(this.data.rowData.dataType === 'Boolean'){
        const lowerCaseValue = trimmedValue.toLowerCase();
        if (lowerCaseValue !== 'true' && lowerCaseValue !== 'false') {
          this.errorMessage = 'Transformed values must be either "true" or "false"';
          return;
        }
      }
    }

    const updatedNodes = this.dataSource.data.filter(node => node.inputType !== 'reservedNode');
    const addNode = new InputNode('Add', updatedNodes.length + 1, 'reservedNode');
  
    this.dataSource.data = [...updatedNodes, newNode, addNode];
  }
    const treeNodes = this.treeContainer.nativeElement.querySelectorAll('.mat-tree-node');
    const lastNode = treeNodes[treeNodes.length - 1];
    if (lastNode) {
      lastNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    this.isAddingNode = false;
    this.loadCustomText = false;
    this.newNodeName = '';
    this.newMappedValue = '';
  }
  
  cancelAddNode(node) {
    if (!node) return;
    // Reset the state of the node being canceled
    node.isAddingNode = false;
    node.disable = false;
  
    this.isAddingNode = false;
    this.isEdit = false;
    this.editingNode = null;
    this.addNode = null;
    this.loadCustomText = false;
    this.errorMessage = '';
    this.newNodeName = '';
    this.newMappedValue = '';
  }

  ok() {
    if (this.data.rowData.transform !== 'ArithmeticTransform') {
      this.submitData();
      return;
    }

    const dataLength = this.dataSource.data.length-1;
    const lastNode = this.dataSource.data[dataLength - 1]?.item;

    if (dataLength % 2 === 0 && this.operators.includes(lastNode)) {
      this.errorMessage = 'Ensure the expression ends with a number or a field of dataType \'Number\'';
      return;
    }

    const errMessage = 'Ensure valid expression';
    for (let i = 0; i < dataLength; i++) {
      const nodeName = this.dataSource.data[i]?.item;
      if (i % 2 === 0) { // Validate numbers and fields
        if (!this.data.fields.includes(nodeName) && !this.regex.test(nodeName)) {
          this.errorMessage = errMessage;
          return;
        }
      } else { // Validate operators
        if (!this.operators.includes(nodeName)) {
          this.errorMessage = errMessage;
          return;
        }
      }
    }
  
    this.submitData();
  }

  submitData() {
    if (this.data.rowData.transform === 'MappingTransform') {
      const mappingObject = {};
      // Filter out Add nodes and create mapping
      this.dataSource.data
        .filter(node => node.item !== 'Add')
        .forEach(node => {
          // Trim both key and value
          const key = typeof node.item === 'string' ? node.item.trim() : node.item;
          const value = typeof node.mappedValue === 'string' ? node.mappedValue.trim() : node.mappedValue;
          mappingObject[key] = value;
        });
      // If mappingObject is empty, use empty string instead of "{}"
      const transformExpr = Object.keys(mappingObject).length === 0 ? '' : JSON.stringify(mappingObject);
      this.data.handlers.addTransform(transformExpr);
    } else {
      const cleanData = this.dataSource.data
        .filter(node => node.inputType !== 'reservedNode')
        .map(node => ({
          item: node.item,
          index: node.index,
          inputType: node.inputType || 'customText'
        }));
      
      this.data.handlers.addTransform(cleanData);
    }
    this.errorMessage = '';
    this.dialogRef.close();
  }

  removeField(node) {
    this.errorMessage = '';
    this.dataSource.data = this.dataSource.data.filter(dataField => dataField.index !== node.index);
  }

  editField(node) {
    this.errorMessage = '';
    // Close the current editing or adding node if any
    if (this.isAddingNode || this.isEdit) {
      this.cancelAddNode(this.editingNode || this.addNode);
    }

    this.isEdit = true;
    this.editingNode = node;
    this.isAddingNode = false;
    
    node.disable = true;
    this.dropdownOptions = [];
    this.dataSource.data = [...this.dataSource.data];

    if (this.data.rowData.transform === 'ArithmeticTransform') {
      if (node.index % 2 === 0) {
        this.data.fields.forEach(field => this.dropdownOptions.push({label: field, value: field}));
        this.dropdownOptions.push({label: 'Custom Text', value: 'Custom Text', isReserved: true});
      } else {
        this.operators.forEach(field => this.dropdownOptions.push({label: field, value: field}));
      }
    } else {
      this.data.fields.forEach(field => this.dropdownOptions.push({label: field, value: field}));
      this.dropdownOptions.push({label: 'Custom Text', value: 'Custom Text', isReserved: true});
    }
    
    // Set newNodeName based on node type
    if (node.inputType === 'customText') {
      this.newNodeName = { value: node.item };
      this.loadCustomText = true;
    } else {
      const matchingOption = this.dropdownOptions.find(option => option.value === node.item);
      this.newNodeName = matchingOption || node.item;
      this.loadCustomText = false;
    }
        
    // Set up mapped value for MappingTransform
    if (this.data.rowData.transform === 'MappingTransform') {
      this.newNodeName = this.newNodeName?.value || this.newNodeName;
      this.newMappedValue = node.mappedValue;
    }
    
    // Ensure text is valid for custom text
    this.isTextValid = true;

    // Make the node appear as if it's being added to reuse the same UI
    node.isAddingNode = true;
    this.isAddingNode = true;
  }

  drop (event: CdkDragDrop<string[]>) {
    if (this.isEdit) {
      this.errorMessage = 'Please complete editing the selected field before using the drag-and-drop feature';
      return;
    }
    const { previousIndex, currentIndex } = event;
    if (previousIndex === currentIndex) return;
    const movedItem = this.dataSource.data.splice(previousIndex, 1)[0];
    this.dataSource.data.splice(currentIndex, 0, movedItem);
    this.dataSource.data.forEach((item, index) => item.index = index);
    this.dataSource.data = [...this.dataSource.data];
  }

  confirmation() {
    if (
      this.data.confirmation &&
      typeof this.data.confirmation === 'function'
    ) {
      this.data.confirmation(this.data.data);
    }
  }

  confirmationWithData() {
    this.data.confirmationWithData(this.data.data, this.inputData, this.isToggleActive);
  }

  openDialog() {
    // this.dialog.open(DialogElementsExampleDialog);
  }

  onFileSelected(event, fileNameInput) {
    this.inputData = event.target.files[0];
    fileNameInput.value = this.inputData.name;
    this.fileSelected = true;
  }

  getButtonClass() {
    const types = this.dialogTypes;

    if (!this.inputData && types.includes(this.data.dialogType)) {
      return 'btn disable-btn';
    }

    return 'btn delete-btn';
  }

  dismissErrorMessage(): void {
    this.errorMessage = null;
  }
}
