import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NestedTreeControl } from '@angular/cdk/tree';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  InputBodyFieldDefs,
  InputFieldDefs,
  ResponseBodyFieldDefs,
  ResponseFieldDefs
} from 'src/app/models/template';
import { MatTree, MatTreeNestedDataSource } from '@angular/material/tree';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { AlertService } from '../../../shared/services/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../../common-components/delete-button/confirmation-dialog.component';

export class InputNode {
  children: InputNode[];
  // children: BehaviorSubject<InputNode[]>;
  constructor(
    public item: string,
    public index: number,
    children?: InputNode[],
    public isLeafNode?: boolean,
    public firstParentNodeText?: string,
    public parentNodeText?: string,
    public parent?: InputNode,
    public arrField?: string,
    public isNestedFieldSection?: boolean
  ) {
    // this.children = new BehaviorSubject(children === undefined ? [] : children);
    this.index = index || 0;
    this.children = children === undefined ? [] : children;
  }
}

interface ActiveFieldInterface {
  activeFileName: string; //Input/Response
  activeSectionName?: string; //Header/Body/Footer/File
  activeFieldName?: string; //Field Field 2 ...
  activeIndex?: number;
  removedIndex?: number;
  copiedIndex?: number;
  nestedActiveSectionName?: string; //arrfields
  firstArrayIndex?: number;
  arrField?: string;
}

export class DynamicFlatNode {
  constructor(
    public item: string,
    public level = 1,
    public expandable = false,
    public isLoading = false,
  ) {}
}

@Component({
  selector: 'app-template-properties-tree-section',
  templateUrl: './template-properties-tree-section.component.html',
  styleUrls: ['./template-properties-tree-section.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TemplatePropertiesTreeSectionComponent {
  @ViewChild('treeSelector') tree: MatTree<any>;

  @Input() onMenuClick: Function;
  @Input() updateNodeData: Function;
  @Input() deleteByIndex: Function;
  @Input() properties: any = {};
  @Input() isvalidForm: boolean;
  @Input() isView;
  @Input() handlers;
  @Output() validateForm: EventEmitter<string> = new EventEmitter<string>();

  matchedNodes: InputNode[] = [];
  config: any;
  toolTip: any;
  showFiller = false;
  treeHide = true;
  recursive = false;
  levels = new Map<InputNode, number>();
  treeControl: NestedTreeControl<InputNode>;
  activeFieldDetails: ActiveFieldInterface;

  dataChange = new BehaviorSubject<InputNode[]>([]);

  dataSource: MatTreeNestedDataSource<InputNode>;
  activeRoutes: string[] = [];
  treeData: any = [];
  isTreeExpanded = false;
  searchTerm = '';
  topNode = '';
  modelMap = {
    'Input File-Header': InputFieldDefs,
    'Input File-Body': InputBodyFieldDefs,
    'Input File-Footer': InputFieldDefs,
    'Response File-Header': ResponseFieldDefs,
    'Response File-Body': ResponseBodyFieldDefs,
    'Response File-Footer': ResponseFieldDefs,
  };
  constructor(
    private alertService: AlertService,
    private uiConfigService: UiConfigService,
    private dialog: MatDialog,
  ) {
    this.treeControl = new NestedTreeControl<InputNode>(this.getChildren);
    this.dataSource = new MatTreeNestedDataSource();
    this.dataSource.data = this.treeData;
    this.activeFieldDetails = { activeFileName: 'Template Properties', firstArrayIndex: null };
  }

  hasNoContent = (_: number, _nodeData: InputNode) => _nodeData.item === '';

  updateIndex(arr) {
    let i = 0;
    function update(arr) {
      for (let item of arr) {
        if (item.index !== -1) {
          item.index = i++;
        }
        if (item.children && item.children.length > 0) {
          update(item.children);
        }
      }
    }
    update(arr);
    return arr;
  }

  seperateValue(data, isArrayField) {
    let arrFieldValue:any = '';
    const dataSrc =  this.dataSource?.data[0]?.children[2]?.children.filter((ele) => {
      if (ele?.children?.length) {
        const children = ele.children.filter((child) => {
          if (child.index === data.sequence - 1 && ele?.item !== data.arrField) {
            arrFieldValue = child;
          } else {
            return child;
          }
        });
        ele.children = children;
      }
      if (ele.item !== 'Add' && ele?.index === data.sequence - 1) {
        if (isArrayField) {
          arrFieldValue = ele;
        }
      } else if (ele?.index === -1) {
        if (ele?.children?.length) {
          return ele;
        }
      } else {
        return ele;
      }
    });
    return {
      arrFieldValue: arrFieldValue,
      dataSrc: dataSrc
    }
  }

  arrFieldArrange(data) {
    let arrField: boolean = false;
    if (data && data.arrField && data.rcxField !== data.arrField) {
      arrField = true;
    }
    const { arrFieldValue, dataSrc } = this.seperateValue(data, arrField);
    if (arrFieldValue) {
      let newData = JSON.parse(JSON.stringify(this.dataSource.data));
      const appendArrFieldResult = this.appendArrFieldValue(dataSrc, arrFieldValue, data, arrField);
      newData[0].children[2].children = appendArrFieldResult.result;
      this.dataSource.data = newData;
      if (arrFieldValue && data?.arrField) {
        arrFieldValue.arrField = data.arrField;
        this.activeFieldDetails.nestedActiveSectionName = data.arrField
        let expandNode = this.findNodeByText(data.arrField)
        this.treeControl.expand(expandNode);
      } else {
        delete this.activeFieldDetails.nestedActiveSectionName;
      }
      let node = this.findNodeByIndex(data?.sequence-1 || 0);
      this.activeFieldDetails.activeIndex = node?.index || 0;
      this.activeFieldDetails.activeSectionName = data.parentNodeText;
      this.expandNodeAndParents(node);
      return appendArrFieldResult.trackIndex;
    }
  }

  appendArrFieldValue(data, value, refValue, isArrayField) {
    if (!isArrayField) {
      const lastVal = data.pop();
      data.push(value, lastVal);
      this.updateIndex(data);
      return { result: data, trackIndex: data[data.length - 1].index - 1 };
    }
    let result = [], isAppended = false;
    let trackIndex = 0, isIndexTracked = true;
    for (let ele of data) {
      if (ele?.item === refValue?.arrField && ele.isNestedFieldSection) {
        isIndexTracked = false;
        ele.children.push(value);
        isAppended = true;
        trackIndex += JSON.parse(JSON.stringify(ele.children)).length;
      } else if (ele.children.length && isIndexTracked) {
        trackIndex+= ele.children.length;
      } else if (isIndexTracked) {
        trackIndex++;
      }
      result.push(ele);
    }
    if (!isAppended) {
      let node = new InputNode(refValue?.arrField, -1, [], false);
      node.isNestedFieldSection = true;
      node.children.push(value);
      const lastVal = result.pop();
      result.push(node);
      result.push(lastVal);
    }
    return {
      result: result,
      trackIndex: trackIndex - 1
    }
  }

  createNodes(dataArr = [], resultArr = [], type, parent) {
    let index = 0, fieldIndex = -1;
    let arrFields = {};
    for (const data of dataArr) {
      if (data.arrField && data.arrField !== data.fieldName) {
        if (!(arrFields[data.arrField + 'Index'] >= 0)) {
          arrFields[data.arrField + 'Index'] = ++fieldIndex;
          let node = new InputNode(data.arrField, -1, [], false);
          node.isNestedFieldSection = true;
          let childNode = new InputNode(data.fieldName, index++, [], true, type, parent, null, data.arrField);
          // childNode.arrField = data.arrField;
          node.children.push(childNode);
          resultArr.push(node);
        } else {
          let node = new InputNode(data.fieldName, index++, [],  true, type, parent, null, data.arrField);
          // node.arrField = data.arrField;
          resultArr[fieldIndex].children.push(node);
        }
      } else {
        let node = new InputNode(data.fieldName, index++, [], true, type, parent);
        fieldIndex++;
        resultArr.push(node);
      }
    }

    return resultArr;
  }

  createNode(parent) {
    let value = Object.assign({}, new this.modelMap[parent]());
    value.sequence = 1;
    return [value];
  }

  generateTree(index? : number, nested = false) {
    if (Object.keys(this.properties).length) {
      let intheaders,
        intbody,
        intfooters,
        resheaders,
        resbody,
        resfooters = [];

      if (this.properties.inputFileLayout) {
        intheaders = this.properties.inputFileLayout.headerFieldDefs;
        intbody = this.properties.inputFileLayout.bodyFieldDefs;
        intfooters = this.properties.inputFileLayout.footerFieldDefs;
        if (!intheaders || !intheaders.length) {
          intheaders = this.createNode('Input File-Header');
          this.properties.inputFileLayout.headerFieldDefs = intheaders;
        }
        if (!intbody || !intbody.length) {
          intbody = this.createNode('Input File-Body');
          this.properties.inputFileLayout.bodyFieldDefs = intbody;
        }
        if (!intfooters || !intfooters.length) {
          intfooters = this.createNode('Input File-Footer');
          this.properties.inputFileLayout.footerFieldDefs = intfooters;
        }
      }
      if (this.properties.responseFileLayout) {
        resheaders = this.properties.responseFileLayout.headerFieldDefs;
        resbody = this.properties.responseFileLayout.bodyFieldDefs;
        resfooters = this.properties.responseFileLayout.footerFieldDefs;
        if (!resheaders || !resheaders.length) {
          resheaders = this.createNode('Response File-Header');
          this.properties.responseFileLayout.headerFieldDefs = resheaders;
        }
        if (!resbody || !resbody.length) {
          resbody = this.createNode('Response File-Body');
          this.properties.responseFileLayout.bodyFieldDefs = resbody;
        }
        if (!resfooters || !resfooters.length) {
          resfooters = this.createNode('Response File-Footer');
          this.properties.responseFileLayout.footerFieldDefs = resfooters;
        }
      }
      intheaders = this.createNodes(intheaders, [], 'Input File', 'Header');
      intbody = this.createNodes(intbody, [], 'Input File', 'Body');
      intfooters = this.createNodes(intfooters, [], 'Input File', 'Footer');
      resheaders = this.createNodes(resheaders, [], 'Response File', 'Header');
      resbody = this.createNodes(resbody, [], 'Response File', 'Body');
      resfooters = this.createNodes(resfooters, [], 'Response File', 'Footer');
      this.treeData = [
        new InputNode(
          'Input File',
          0,
          [
            new InputNode('File Properties', 0, [], false, 'Input File'),
            new InputNode(
              'Header',
              1,
              [
                ...intheaders,
                new InputNode(
                  `Add`,
                  intheaders.length,
                  [],
                  false,
                  'Input File',
                  'Header',
                ),
              ],
              false,
              'Input File',
            ),
            new InputNode(
              'Body',
              2,
              [
                ...intbody,
                new InputNode(
                  `Add`,
                  intbody.length,
                  [],
                  false,
                  'Input File',
                  'Body',
                ),
              ],
              false,
              'Input File',
            ),
            new InputNode(
              'Footer',
              3,
              [
                ...intfooters,
                new InputNode(
                  `Add`,
                  intfooters.length,
                  [],
                  false,
                  'Input File',
                  'Footer',
                ),
              ],
              false,
              'Input File',
            ),
          ],
          false,
        ),
        new InputNode(
          'Response File',
          1,
          [
            new InputNode('File Properties', 0, [], false, 'Response File'),
            new InputNode(
              'Header',
              1,
              [
                ...resheaders,
                new InputNode(
                  `Add`,
                  resheaders.length,
                  [],
                  false,
                  'Response File',
                  'Header',
                ),
              ],
              false,
              'Response File',
            ),
            new InputNode(
              'Body',
              2,
              [
                ...resbody,
                new InputNode(
                  `Add`,
                  resbody.length,
                  [],
                  false,
                  'Response File',
                  'Body',
                ),
              ],
              false,
              'Response File',
            ),
            new InputNode(
              'Footer',
              3,
              [
                ...resfooters,
                new InputNode(
                  `Add`,
                  resfooters.length,
                  [],
                  false,
                  'Response File',
                  'Footer',
                ),
              ],
              false,
              'Response File',
            ),
          ],
          false,
        ),
      ];
      this.dataSource.data = this.treeData;
      this.treeControl.dataNodes = this.treeData;
      if (index >= 0) {
        let node = this.findNodeByIndex(index);
        if (nested) {
          this.activeFieldDetails.nestedActiveSectionName = node?.arrField
        let expandNode = this.findNodeByText(node?.arrField)
        this.treeControl.expand(expandNode);
        }
        this.activeFieldDetails.activeSectionName = node?.parentNodeText;
        this.expandNodeAndParents(node);
      }
    }
  }

  async ngOnInit() {
    this.activeRoutes = [];
    this.generateTree();
    this.config = await this.uiConfigService.getFormViewConfig('templates');
    this.toolTip = this.config && this.config.toolTip;
  }

  ngOnChanges(changes: any) {
    const keys = Object.keys(changes);

    if (keys && keys.length === 1 && keys.includes('isvalidForm')) {
      return;
    }
    this.generateTree();
  }

  getChildren = (node: InputNode): InputNode[] => node.children;

  hasChildren = (_index: number, node: InputNode) => {
    return node.children.values.length > 0;
  };

  isLastChildren = (index: number, node: InputNode) => {
    return node.children.values.length - 1 == index;
  };

  formatPath(path: string) {
    let result = path;

    if (result.indexOf('(') > -1) {
      result = result.split('(')[0];
    }
    result = result.replace(' ', '');

    return result.toLowerCase();
  }

  showFormError() {
    this.alertService.infoAlert('Please fill all required fields.', '');
  }

  onNodeClick(node: any, isRemove?: boolean) {
    if (!isRemove && !this.isView && !this.isvalidForm) {
      this.validateForm.emit();
      this.showFormError();

      return;
    }
    const selectNode = node.item;
    const selectedParentNode: any = this.formatPath(
      node.parentNodeText || node.item,
    );

    if (selectNode == 'Response File') {
      this.activeFieldDetails = {
        activeFileName: 'Response File',
        activeSectionName: 'File Properties',
        removedIndex: -1,
      };
    }
    if (selectNode == 'Input File') {
      this.activeFieldDetails = {
        activeFileName: 'Input File',
        activeSectionName: 'File Properties',
        removedIndex: -1,
      };
    }

    if (selectNode == 'File Properties') {
      this.activeFieldDetails = {
        activeFileName: node.firstParentNodeText,
        activeSectionName: 'File Properties',
        removedIndex: -1,
      };
    }

    if (
      selectedParentNode == 'header' ||
      selectedParentNode == 'body' ||
      selectedParentNode == 'footer'
    ) {
      this.activeFieldDetails.activeSectionName = `${selectedParentNode
        .charAt(0)
        .toUpperCase()}${selectedParentNode.slice(1)}`;
      this.activeFieldDetails.activeFileName = node.firstParentNodeText;
      if (node.item !== 'Add') {
        this.activeFieldDetails.activeIndex = 0;
        this.activeFieldDetails.activeFieldName = node.children[0]?.item;
        if (node.children[0]?.isNestedFieldSection) {
          this.activeFieldDetails.nestedActiveSectionName = node.children[0].item;
          this.activeFieldDetails.activeFieldName = node.children[0]?.children[0]?.item;
        }
      }
    }
    if (!['Header', 'Footer', 'Body'].includes(selectNode)) {
      this.activeFieldDetails.activeIndex = node.index;
      this.activeFieldDetails.activeFieldName = selectNode;
      this.activeFieldDetails.removedIndex = -1;
      if (node.arrField) {
        this.activeFieldDetails.nestedActiveSectionName = node.arrField;
      } else if (node.isNestedFieldSection && node.children.length) {
        this.activeFieldDetails.nestedActiveSectionName = node.item;
        this.activeFieldDetails.activeIndex = node.children[0]?.index || 0;
        this.activeFieldDetails.activeFieldName = node.children[0]?.item;
      } else if (!node.isNestedFieldSection) {
        delete this.activeFieldDetails.nestedActiveSectionName;
      }
    }
    if (node.item == 'Add') {
      this.addRemoveDuplicatedField(node);
    }
    this.onClickOnMenuSelection();
    if (
      !this.treeControl.isExpanded(this.treeData[0]) &&
      !this.treeControl.isExpanded(this.treeData[1])
    ) {
      this.isTreeExpanded = false;
    } else {
      this.isTreeExpanded = true;
    }
  }

  removeField(node: any) {
    this.onNodeClick(node, true);
    this.addRemoveDuplicatedField(node, false);
    this.handlers.handleIsModifiedChange(true);
  }

  duplicate(node: any) {
    if (!this.isvalidForm) {
      this.showFormError();

      return;
    }
    // Duplicate logic goes here.
    this.onNodeClick(node);
    this.addRemoveDuplicatedField(node, false, true);
    this.handlers.handleIsModifiedChange(true);
  }

  addRemoveDuplicatedField(node: any, isAdding = true, duplicated = false) {
    this.treeHide = false;
    for (let index = 0; index < this.dataSource.data.length; index++) {
      const element = this.dataSource.data[index];

      if (element && element.item === node.firstParentNodeText) {
        for (let j = 0; j < element.children.length; j++) {
          const childElement = element.children[j];
          if (childElement.item === node.parentNodeText) {
              let btn = this.dataSource?.data[index]?.children[j].children;
              let btnLength = btn.length - 1;
              btn.forEach(ele => {
                if (ele.children) {
                  let len = ele.children.length - 1;
                  if (len > 0) {
                    btnLength += len;
                  }
                }
              })
            // element add condition
            if (isAdding) {
              const buttonElm =
                this.dataSource?.data[index]?.children[j].children?.pop();
              const newNode = new InputNode(
                `Field ${new Date().getTime()}`,
                btnLength,
                [],
                true,
                element.item,
                childElement.item,
              );

              this.dataSource?.data[index]?.children[j].children?.push(newNode);
              this.activeFieldDetails.activeFieldName = newNode.item;
              this.activeFieldDetails.activeIndex = btnLength;
              buttonElm.index = btnLength + 1;
              this.dataSource?.data[index]?.children[j].children?.push(
                buttonElm,
              );
              // element remove condition
            } else if (!isAdding && btnLength > 1 && !duplicated) {
              //find selected field index
              const indexRemoved = node.index;
              let res = this.deleteByIndex(this.dataSource?.data[index]?.children[j].children, indexRemoved);
              if (res && this.dataSource?.data[index]?.children[j].children) {
                this.dataSource.data[index].children[j].children = res;
              }
              this.updateIndex(this.dataSource?.data[index]?.children[j].children);
              if (this.activeFieldDetails.activeIndex === indexRemoved) {
                this.activeFieldDetails.activeIndex = 0;
              }
              this.activeFieldDetails.activeSectionName = node.parentNodeText;
              if (this.activeFieldDetails.activeIndex > indexRemoved) {
                this.activeFieldDetails.activeIndex -= 1;
              }
              this.activeFieldDetails.removedIndex = indexRemoved;
              // element duplicate condition
            } else if (duplicated) {
              const buttonElm =
                this.dataSource?.data[index]?.children[j].children?.pop();
              const newNode = new InputNode(
                `Field ${new Date().getTime()}`,
                btnLength,
                [],
                true,
                element.item,
                childElement.item,
              );

              let activeIndex = 0;
              if (node?.arrField) {
                for (let ele of this.dataSource?.data[index]?.children[j].children) {
                  if (ele?.isNestedFieldSection) {
                    activeIndex+= ele?.children?.length;
                  } else {
                    activeIndex++;
                  }
                  if (ele?.item === node.arrField) {
                    newNode.arrField = node.arrField;
                    ele?.children?.push(newNode);
                    break;
                  }

                };
                this.updateIndex(this.dataSource?.data[index]?.children[j].children);
                this.activeFieldDetails.nestedActiveSectionName = node.arrField;
              } else {
                this.dataSource?.data[index]?.children[j].children?.push(newNode);
                delete this.activeFieldDetails.nestedActiveSectionName;
              }
              this.activeFieldDetails.activeFieldName = newNode.item;
              if (this.activeFieldDetails.nestedActiveSectionName) {
                this.activeFieldDetails.activeIndex = activeIndex;
              } else {
                this.activeFieldDetails.activeIndex = btnLength;
              }
              this.activeFieldDetails.copiedIndex = node.index;
              this.activeFieldDetails.activeSectionName =
                newNode.parentNodeText;
              buttonElm.index = btnLength + 1;
              this.dataSource?.data[index]?.children[j].children?.push(
                buttonElm,
              );
            }
            const data = this.dataSource.data;
            this.dataSource.data = null;
            this.dataSource.data = data;
          }
        }
      }
    }
    this.updateNodeData(this.activeFieldDetails, isAdding, duplicated);
  }

  activeTemplateProperties() {
    if (!this.isView && !this.isvalidForm) {
      this.validateForm.emit();
      this.showFormError();

      return;
    }
    this.activeFieldDetails = {
      activeFileName: 'Template Properties',
    };
    this.onClickOnMenuSelection();
  }

  canButtonActive(node: InputNode) {
    if (node.isNestedFieldSection && this.activeFieldDetails.nestedActiveSectionName) {
      return node.item === this.activeFieldDetails.nestedActiveSectionName;
    }
    if (!node.firstParentNodeText) {
      return node.item === this.activeFieldDetails.activeFileName;
    } else if (!node.parentNodeText) {
      return (
        node.item === this.activeFieldDetails.activeSectionName &&
        node.firstParentNodeText === this.activeFieldDetails.activeFileName
      );
    }
  }

  canChildActive(node: InputNode) {
    if (node.arrField) {
      if (node.isLeafNode && this.activeFieldDetails.nestedActiveSectionName === node.arrField
        && node.index === this.activeFieldDetails.activeIndex) {
        return true;
      }
    }
    return (
      node.isLeafNode &&
      node.firstParentNodeText === this.activeFieldDetails.activeFileName &&
      node.parentNodeText === this.activeFieldDetails.activeSectionName &&
      node.index === this.activeFieldDetails.activeIndex
    );
  }

  onClickOnMenuSelection() {
    this.onMenuClick(this.activeFieldDetails);
  }

  private validateFieldDependencies(selectedNode: InputNode, moveToPosition: number, event?: CdkDragDrop<string[]>): boolean {
    const bodyFieldDefs = this.properties?.inputFileLayout?.bodyFieldDefs || [];
    const selectedFieldIndex = bodyFieldDefs.findIndex(field => field.fieldName === selectedNode.item);
    const newIndex = selectedFieldIndex + moveToPosition;
    // Simulate the move and validate all dependencies
    const simulatedFieldDefs = [...bodyFieldDefs];
    const [movedField] = simulatedFieldDefs.splice(selectedFieldIndex, 1);
    simulatedFieldDefs.splice(newIndex, 0, movedField);

    for (let i = 0; i < simulatedFieldDefs.length; i++) {
      const field = simulatedFieldDefs[i];
      if (field.transformExpr && field.transformExpr.trim()) {
        const referencedFields = this.extractReferencedFields(field.transformExpr);
        for (const refField of referencedFields) {
          const refFieldIndex = simulatedFieldDefs.findIndex(f => f.fieldName === refField);
          // Check if the referenced field is below the current field
          if (refFieldIndex > i) {
            this.dialog.open(ConfirmationDialog, {
              data: {
                schema: 'Transform',
                content: `The field <b>${selectedNode.item}</b> cannot be repositioned as it has a transform dependency.`,
                disableCancelButton: true,
                confirmButton: 'Ok',              },
            });
            if (event) {
              event.item._dragRef.reset(); // Undo the drag-and-drop operation
            }
            return false;
          }
        }
      }
    }

    return true;
  }

  drop(event: CdkDragDrop<string[]>) {
    const selectedNode = event.item.data;
    const moveToPosition = event.currentIndex - event.previousIndex;
    // ignore drops outside of the tree
    if (!event.isPointerOverContainer) return;
    // Validate field dependencies before proceeding
    if (!this.validateFieldDependencies(selectedNode, moveToPosition, event)) {
      return;
    }
    // Move the node to the new position if validation passes
    this.moveElementFromOnePointToAnother(selectedNode, moveToPosition);
  }

  private extractReferencedFields(transformExpr: string): string[] {
    const regex = /\$\{([^}]+)\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(transformExpr)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  getAllNodes(nodes: InputNode[], result: InputNode[] = []): InputNode[] {
    for (const node of nodes) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        this.getAllNodes(node.children, result);
      }
    }
    return result;
  }

  moveElementFromOnePointToAnother(selectedNode, moveToPosition) {
    this.onNodeClick(selectedNode);
    let prevIndex, currIndex, arrayElement = false;

    for (let index = 0; index < this.dataSource.data.length; index++) {
      const element = this.dataSource.data[index];

      if (element && element.item === selectedNode.firstParentNodeText) {
        for (let j = 0; j < element.children.length; j++) {
          const childElement = element.children[j];

          if (childElement.item === selectedNode.parentNodeText) {
            let fieldChildren =
              this.dataSource?.data[index]?.children[j].children;

            if (selectedNode.arrField) {
              let parent_node = fieldChildren.find((child) => child.item === selectedNode.arrField);
              arrayElement = selectedNode.arrField ? true : false;
              fieldChildren = parent_node.children;
            }

            for (let k = 0; k < fieldChildren.length; k++) {
              if (fieldChildren[k].item === selectedNode.item) {
                let isButton;
                let moveToFinalPosition;
                let updatedIndex = fieldChildren[k].index;
                let finalIndex;
                if(selectedNode.arrField) {
                  updatedIndex = selectedNode.index;
                }
                if (moveToPosition < 0) {
                  moveToFinalPosition = updatedIndex - -moveToPosition;
                  finalIndex = k - -moveToPosition;
                  isButton = fieldChildren[moveToFinalPosition]?.item === 'Add';
                } else {
                  moveToFinalPosition = updatedIndex + moveToPosition;
                  finalIndex = k + moveToPosition;
                  isButton = fieldChildren[moveToFinalPosition]?.item === 'Add';
                }
                const currentElement =  fieldChildren[k];
                let nextElement =
                  this.dataSource.data[index].children[j].children[moveToFinalPosition];
                if (selectedNode.arrField) {
                  nextElement = fieldChildren[finalIndex];
                }
                if (!isButton && currentElement && nextElement) {
                  prevIndex = updatedIndex;
                  let lenV = moveToFinalPosition;
                  if ( !selectedNode.arrField && prevIndex < moveToFinalPosition) {
                    for (let z = prevIndex; z <= lenV; z++) {
                      let nod = this.dataSource.data[index].children[j].children[z];
                      if (nod.children.length) {
                        moveToFinalPosition = moveToFinalPosition + nod.children.length - 1;
                      }
                    }
                  } else if (!selectedNode.arrField) {
                    for (let z = lenV; z <= prevIndex; z++) {
                      let nod = this.dataSource.data[index].children[j].children[z];
                      if (nod.children.length) {
                        moveToFinalPosition = moveToFinalPosition - nod.children.length + 1;
                      }
                    }
                  }
                  this.activeFieldDetails.activeIndex = currIndex =
                  moveToFinalPosition;
                  // let nodeData = JSON.parse(JSON.stringify(this.dataSource.data));
                  // let deletedData = nodeData[index].children[j].children.splice(prevIndex, 1);
                  // nodeData[index].children[j].children.splice(lenV, 0, deletedData[0]);
                  // this.dataSource.data = nodeData
                  const data = this.dataSource?.data;

                  this.dataSource.data = null;
                  this.dataSource.data = data;
                  break;
                }
              }
            }
          }
        }
      }
    }
    this.updateNodeData(
      Object.assign({ prevIndex, currIndex, arrayElement }, this.activeFieldDetails),
      false,
      false,
      true,
    );
    this.handlers.handleIsModifiedChange(true);
  }

  preventMoveIconClick(e: any, node: any) {
    if (node?.isLeafNode) {
      e.stopPropagation();

      return true;
    } else {
      return true;
    }
  }

  canShowNode(node: InputNode) {
    if (node.item === 'Add' && this.isView) {
      return false;
    }
    if (!['Header', 'Body', 'Footer'].includes(node.item)) {
      return true;
    }
    const type = node.firstParentNodeText.split(' ')[0].toLowerCase();

    return this.properties[`${type}FileLayout`]?.fileProperties[
      node.item.toLowerCase()
    ];
  }

  getNodeName(node: InputNode) {
    let section = node.parentNodeText;

    if (!section || node.item === 'Add') {
      return node.item;
    }
    section = section.toLowerCase();
    const type = node.firstParentNodeText.split(' ')[0].toLowerCase();
    const prop =
      this?.properties?.[`${type}FileLayout`]?.[`${section}FieldDefs`]?.[
        node.index
      ];
    const fieldName =
      (prop?.fieldName || '') +
      (prop?.rcxFieldArrLen > 0 ? `[${prop.rcxFieldArrLen}]` : '');

    node.item = fieldName;

    return fieldName;
  }

  toggleAllNodes() {
    if (!this.isView) {
      this.activeTemplateProperties();
    }
    if (this.isTreeExpanded) {
      this.treeControl.collapseAll();
      this.isTreeExpanded = false;
    } else {
      this.treeControl.expandAll();
      this.isTreeExpanded = true;
    }
  }

  applySearch() {
    const searchTermLower = this.searchTerm.toLowerCase();

    this.matchedNodes = [];
    this.findMatchedNode(this.dataSource.data, searchTermLower);
    this.treeControl.collapseAll();
    if (this.matchedNodes.length) {
      this.expandNodesForMatchedNode();
    }
    if (this.searchTerm === '') {
      this.matchedNodes = [];
      this.treeControl.collapseAll();
      this.isTreeExpanded = false;
    }
  }

  findMatchedNode(nodes: InputNode[], searchTermLower: string): void {
    for (const node of nodes) {
      if (!node.isLeafNode) {
        this.findMatchedNode(node.children, searchTermLower);
      }
      if (
        node.isLeafNode &&
        node.item &&
        node.item.toLowerCase().includes(searchTermLower)
      ) {
        this.matchedNodes.push(node);
      }
    }
  }

  expandNodesForMatchedNode() {
    this.matchedNodes.forEach((matchedNode) => {
      this.topNode = matchedNode.firstParentNodeText;
      this.expandNodeAndParents(matchedNode);
    });
  }

  expandNodeAndParents(node: InputNode | null) {
    if (node) {
      if (node.firstParentNodeText) {
        const firstParentNode = this.findNodeByText(node.firstParentNodeText);

        if (firstParentNode) {
          this.treeControl.expand(firstParentNode);
        }
      }
      if (
        node.parentNodeText &&
        node.parentNodeText !== node.firstParentNodeText
      ) {
        const parentNode = this.findNodeByText(node.parentNodeText);
        if (parentNode) {
          this.treeControl.expand(parentNode);
          this.expandNodeAndParents(parentNode);
        }
      }
    }
  }

  findNodeByText(
    text: string,
    nodes = this.dataSource.data,
  ): InputNode | undefined {
    for (const node of nodes) {
      if (node.item && node.item?.toLowerCase() === text?.toLowerCase()) {
        return node;
      }
      // if (
      //   node.firstParentNodeText &&
      //   node.firstParentNodeText !== this.topNode
      // ) {
      //   return;
      // }
      const foundInChildren = this.findNodeByText(text, node.children);
      if (foundInChildren) {
        return foundInChildren;
      }
    }

    return undefined;
  }

  findNodeByIndex(
    index: Number,
    nodes = this.dataSource.data[0].children[2].children,
  ): InputNode | undefined {
    for (const node of nodes) {
      if (node.item && node.index === index) {
        return node;
      }
      const foundInChildren = this.findNodeByIndex(index, node.children);
      if (foundInChildren) {
        return foundInChildren;
      }
    }

    return undefined;
  }

  shouldShowNode(node: InputNode): boolean {
    if (!this.searchTerm || !node.firstParentNodeText) {
      return true;
    }
    this.isTreeExpanded = true;
    if (this.matchedNodes.some((item) => _.isEqual(item, node))) {
      return true;
    } else if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (this.shouldShowNode(child)) {
          return true;
        }
      }
      // return true;  uncomment to show adjacent non-leaf nodes as well
    }

    return false;
  }
}
