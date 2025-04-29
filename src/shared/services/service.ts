import { useCallback } from 'react';
import axiosInstance from './http';
import { useAuth } from './auth';

interface RCXFieldModel {
  value: string;
  label: string;
  type: string;
  parentType: string;
  required: boolean;
  minLength: number;
  maxLength: number;
  format: string;
  arrField: string;
}

export const useService = () => {
  const { isLoggedIn } = useAuth();
  let loyaltyID: any;

  const setLoyaltyID = useCallback(async (lid: any) => {
    loyaltyID = lid;
  }, []);

  const setComponentView = useCallback((comp: string, view: boolean) => {
    localStorage.setItem(comp, String(view));
  }, []);

  const getComponentView = useCallback((comp: string) => {
    return localStorage.getItem(comp) === 'false' ? false : true;
  }, []);

  const getSchema = useCallback(async () => {
    const response = await axiosInstance.get('schema/validation');
    return response.data;
  }, []);

  const getFilteredSchema = useCallback((schema: any, rcxProcess: string, ignoredRCXFields: any, prefix = '') => {
    const dbSchema = schema[rcxProcess]?.dbSchema || {};
    let extSchema = schema[rcxProcess]?.extUISchema || {};
    
    if (rcxProcess === 'Activity') {
      ['LineItem', 'TenderItem'].forEach((val) => {
        let itemExt = Object.keys(schema[val]?.extUISchema || {}).reduce((acc, x) => {
          schema[val].extUISchema[x].ignoreExt = true;
          schema[val].extUISchema[x].parentType = 'array';
          acc[`${val.substring(0,1).toLowerCase() + val.substring(1)}s.ext.${x}`] = schema[val].extUISchema[x];
          return acc;
        }, {});
        itemExt[`${(val.substring(0,1).toLowerCase() + val.substring(1))}s`] = {type: 'array'};
        extSchema = {...extSchema, ...(itemExt || {})};
      });
    }

    if (rcxProcess === 'MemberSegment') {
      dbSchema.loyaltyId = { type: 'string', required: true, maxlength: 100 };
      delete dbSchema.member;
    }
    if (rcxProcess === 'MemberPreference') {
      dbSchema.loyaltyId = { type: 'string', required: true, maxlength: 100 };
      delete dbSchema.memberId;
    }
    if (rcxProcess === 'Activity') {
      dbSchema.srcChannelID['required'] = true;
      dbSchema.loyaltyID['required'] = true;
      dbSchema.externalTxnId['required'] = true;
    }
    if (rcxProcess === 'LoyaltyID') {
      dbSchema.existingLoyaltyId = {
        type: 'string',
        required: true,
        maxlength: 100,
      };
      delete dbSchema.memberId;
    }

    delete dbSchema.ext;
    Object.keys(dbSchema).forEach((field) => {
      if (dbSchema[field]?.type === 'array') {
        let arrSchema = dbSchema[field]?.['0'];
        if (arrSchema) {
          Object.keys(arrSchema).forEach((arrField) => {
            if (arrField === 'ext') {
              return;
            }
            dbSchema[`${field}.${arrField}`] = {
              ...arrSchema[arrField],
              parentType: 'array',
              arrField: field,
            };
          });
        }
        delete dbSchema[field];
      }
    });

    const dbExtSchema = dbSchema;

    Object.keys(extSchema).forEach((field) => {
      let prependStr = extSchema[field]['ignoreExt'] ? '' : 'ext.';
      if (extSchema[field].type === 'object') {
        return;
      }
      if (extSchema[field].type === 'array' && !extSchema[field].noProperties) {
        return;
      }
      if (field.includes('.') || extSchema[field].type === 'array') {
        let splitFields = field.split('.');
        let arrCounter = 0;
        let fieldJoin = '';
        let arrField;

        for (const i of splitFields) {
          if (!fieldJoin) {
            fieldJoin += i;
          } else {
            fieldJoin += '.' + i;
          }
          if (extSchema[fieldJoin]?.type === 'array') {
            arrField = fieldJoin;
            arrCounter += 1;
          }
          if (arrCounter > 1) {
            return;
          }
        }
        if (arrCounter === 0) {
          dbExtSchema[`${prependStr + field}`] = extSchema[field];
        } else if (arrCounter === 1) {
          dbExtSchema[`${prependStr + field}`] = {
            ...extSchema[field],
            parentType: 'array',
            arrField: prependStr + arrField,
          };
        }
      } else {
        dbExtSchema[`${prependStr + field}`] = extSchema[field];
      }
    });

    const commonIgnoreFields = ignoredRCXFields.commonFields || [];
    const specificRCXIgnoreFields = ignoredRCXFields[rcxProcess] || [];
    const allIgnoreRCXFields = [...commonIgnoreFields, ...specificRCXIgnoreFields];
    const result: RCXFieldModel[] = [];

    Object.keys(dbExtSchema).forEach((key) => {
      const schema = dbExtSchema[key];

      if (!allIgnoreRCXFields.includes(key) && !schema['rcxOpts']?.trans && !schema['rcxOpts']?.appMod) {
        const obj: RCXFieldModel = {
          value: prefix + key,
          label: prefix + key,
          type: schema?.type,
          parentType: schema?.parentType || '',
          required: schema?.required || false,
          minLength: schema?.minlength || 1,
          maxLength: schema?.maxlength || 100,
          format: schema.format || '',
          arrField: schema?.arrField || '',
        };

        result.push(obj);
      }
    });

    return result;
  }, []);

  const getFormattedSchema = useCallback((schema: any, rcxProcess: any, ignoredRCXFields: any) => {
    let rcxProcessVal = rcxProcess?.value;
    rcxProcess = rcxProcess?.data;
    
    if (!rcxProcess) {
      return [];
    }
    
    let result;

    if (rcxProcess !== 'Member') {
      result = getFilteredSchema(schema, rcxProcess, ignoredRCXFields);
    }
    
    if (rcxProcess === 'Member') {
      const enrollmentFields = [
        {
          value: 'loyaltyId',
          label: 'loyaltyId',
          type: 'string',
          parentType: '',
          required: false,
        },
        {
          value: 'alternateId',
          label: 'alternateId',
          type: 'string',
          parentType: '',
          required: false,
        },
        {
          value: 'channel',
          label: 'channel',
          type: 'string',
          parentType: '',
          required: true,
        },
        {
          value: 'cardType',
          label: 'cardType',
          type: 'string',
          parentType: '',
          required: false,
        },
        {
          value: 'assignCard',
          label: 'assignCard',
          type: 'boolean',
          parentType: '',
          required: false,
        },
        {
          value: 'cardName',
          label: 'cardName',
          type: 'string',
          parentType: '',
          required: false,
        },
      ];

      const profileUpdateFields = [
        {
          value: 'loyaltyId',
          label: 'loyaltyId',
          type: 'string',
          parentType: ''
        },
        {
          value: 'memberId',
          label: 'memberId',
          type: 'string',
          parentType: ''
        }
      ];
      
      const ignoreProfileUpdateFields = ['referralCode'];
      let prefix = rcxProcessVal === 'ProfileUpdate' ? '' : 'member.';
      result = getFilteredSchema(schema, rcxProcess, ignoredRCXFields, prefix);

      if (rcxProcessVal === 'ProfileUpdate') {
        result.forEach((field) => {
          field.required = false;
        });
        result = [...result, ...profileUpdateFields];
        result = result.filter((field) => !ignoreProfileUpdateFields.includes(field.value));
      } else {
        result = [...result, ...enrollmentFields];
      }
    }

    return result.sort((a, b) => {
      if (Number(b.required) - Number(a.required)) {
        return Number(b.required) - Number(a.required);
      }
      if (!a.label.includes('ext.') && b.label.includes('ext.')) {
        return -1;
      }
      if (a.label.includes('ext.') && !b.label.includes('ext.')) {
        return 1;
      }
      return a.label.localeCompare(b.label.toString());
    });
  }, [getFilteredSchema]);

  const getLoggedUserPermissions = useCallback(async () => {
    const response = await axiosInstance.get('acl/permissions');
    return response.data;
  }, []);

  return {
    setLoyaltyID,
    setComponentView,
    getComponentView,
    getSchema,
    getFilteredSchema,
    getFormattedSchema,
    getLoggedUserPermissions,
  };
};