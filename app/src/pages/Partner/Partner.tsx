import React, { useState, useEffect } from 'react';
import {
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { DropDownWithSearch } from '../../components/common';
import { useUtils } from '../../services/utils/useUtils';
import { useAlert } from '../../services/alert/useAlert';
import { useDialog } from '../../services/dialog/useDialog';
import PartnerList from './PartnerList';

const Partner: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [config, setConfig] = useState<any>({});
    const [cfgOpt, setCfgOpt] = useState<any>({});
    const [dataCollection, setDataCollection] = useState<any[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [refresh, setRefresh] = useState(false);
    const [requiredData, setRequiredData] = useState<any>({});
    const [partnerTypeOptions, setPartnerTypeOptions] = useState<any[]>([]);
    const [lastUpdatedByOptions, setLastUpdatedByOptions] = useState<any[]>([]);
    const [partnerNameOptions, setPartnerNameOptions] = useState<any[]>([]);

    const navigate = useNavigate();
    const { checkPerms, onChange, resetFilters, filterListData } = useUtils();
    const { errorAlert, successAlert } = useAlert();
    const { openDialog } = useDialog();

    const pageName = 'partners';

    // Handler functions for the partner list
    const getDataHandler = {
        delete: handleDelete,
        edit: handleEdit,
        editUser: handleEditUser,
        deleteUser: handleDeleteUser,
    };

    // Original order function for sorting
    const originalOrder = () => 0;

    useEffect(() => {
        const initConfig = async () => {
            // In a real implementation, this would fetch from a config service
            const config: any = {
                data: [
                    { name: 'name', label: 'Partner Name', type: 'text', routerLink: '/partners/detail' },
                    { name: 'partnerType', label: 'Partner Type', type: 'text' },
                    { name: 'code', label: 'Code', type: 'text' },
                    { name: 'email', label: 'Support Email', type: 'text' },
                    { name: 'phone', label: 'Support Number', type: 'text' },
                    { name: 'isHostingPartner', label: 'Hosting Partner', type: 'boolean' },
                    { name: 'updatedBy.login', label: 'Last Updated By', type: 'text' },
                    { name: 'updatedAt', label: 'Last Updated', type: 'date', pipe: 'dateTimeFormat' },
                    { name: 'actions', label: 'Actions', type: 'actions' }
                ],
                actions: [
                    { name: 'Edit', iconname: 'edit', clickHandler: 'edit' },
                    { name: 'Delete', iconname: 'delete', clickHandler: 'delete' }
                ],
                filterOptions: {
                    partnerType: {
                        placeholder: 'Partner Type',
                        searchplaceholder: 'Search Partner Type',
                        label: 'Partner Type',
                        field: 'partnerType'
                    },
                    lastUpdatedBy: {
                        placeholder: 'Last Updated By',
                        searchplaceholder: 'Search Last Updated By',
                        label: 'Last Updated By',
                        field: 'updatedBy'
                    }
                },
                filters: {}
            };

            setConfig(config);
            setCfgOpt(config.filterOptions);
            setRefresh(config?.refresh ?? false);
        };

        initConfig();
        getData();
    }, []);

    async function getData() {
        await getFilterData();
        await getListData();
    }

    async function getRefreshData() {
        await getListData();
    }

    async function getFilterData() {
        try {
            // This would fetch enum data from an API
            // For now, we'll just set some dummy data
            const enums = [
                { value: 'Supplier', label: 'Supplier' },
                { value: 'Customer', label: 'Customer' },
                { value: 'Distributor', label: 'Distributor' }
            ];

            getDropDownEnums(enums);
        } catch (err: any) {
            errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
        }
    }

    async function getListData() {
        try {
            // This would fetch partners from an API
            // For now, we'll just set some dummy data
            const partnersData = [
                {
                    _id: '1',
                    name: 'Partner 1',
                    partnerType: 'Supplier',
                    code: 'P1',
                    email: 'partner1@example.com',
                    phone: '+1234567890',
                    isHostingPartner: true,
                    updatedBy: { login: 'admin', _id: 'u1' },
                    updatedAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    name: 'Partner 2',
                    partnerType: 'Customer',
                    code: 'P2',
                    email: 'partner2@example.com',
                    phone: '+0987654321',
                    isHostingPartner: false,
                    updatedBy: { login: 'user1', _id: 'u2' },
                    updatedAt: new Date().toISOString()
                }
            ];

            setData(partnersData);
            setDataCollection(partnersData);

            getUpdatedByOptions(partnersData);
            getPartnerNameOptions(partnersData);

            filterListData({
                data: partnersData,
                dataCollection: partnersData,
                config,
                pageName
            });
        } catch (err: any) {
            errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
        }
    }

    function getDropDownEnums(enums: any[]) {
        const options = enums.map((e) => {
            return { name: e.value, id: e._id || e.value };
        });

        setPartnerTypeOptions(options);
        config['Partner Type'] = options;
    }

    function getUpdatedByOptions(data: any[]) {
        const options: any[] = [];

        for (const item of data) {
            const updatedByArray = lastUpdatedByOptions.map((obj) => obj.name);
            const uniqueUpdatedBySet = new Set(updatedByArray);
            const uniqueUpdatedByArray = Array.from(uniqueUpdatedBySet);

            if (item.updatedBy?.login && !uniqueUpdatedByArray.includes(item.updatedBy.login)) {
                options.push({
                    name: item.updatedBy.login,
                    id: item.updatedBy._id
                });
            }
        }

        setLastUpdatedByOptions([...lastUpdatedByOptions, ...options]);
        config['Last Updated By'] = [...lastUpdatedByOptions, ...options];
    }

    function getPartnerNameOptions(data: any[]) {
        const options = data.map((p) => {
            return { name: p.name, id: p._id };
        });

        setPartnerNameOptions(options);
        config['Partner'] = options;
    }

    function createPartner() {
        navigate('/partners/create');
    }

    function handleEdit(row: any) {
        navigate(`/partners/edit/${row._id}`);
    }

    function handleDelete(row: any) {
        openDialog({
            schema: 'Delete Partner',
            content: `Are you sure that you want to delete <strong>${row.name}</strong>?`,
            confirmButton: 'Yes, Delete',
            cancelButton: 'No',
            onConfirm: async () => {
                try {
                    // This would delete the partner via API
                    // await deletePartner(row);
                    successAlert('Partner deleted successfully');
                    getListData();
                } catch (err: any) {
                    errorAlert(err.errorMessage || 'Cannot delete partner');
                }
            }
        });
    }

    function handleEditUser(row: any) {
        navigate(`/users/edit/${row._id}`, { state: row });
    }

    function handleDeleteUser(row: any) {
        openDialog({
            schema: 'Delete User',
            content: `Are you sure that you want to delete <strong>${row.login}</strong>?`,
            confirmButton: 'Yes, Delete',
            cancelButton: 'No',
            onConfirm: async () => {
                try {
                    // This would delete the user via API
                    // await deleteUser(row);
                    successAlert('User deleted successfully');
                    getListData();
                } catch (err: any) {
                    errorAlert(err.errorMessage || 'Cannot delete user');
                }
            }
        });
    }

    function handleChange(options: any) {
        onChange({
            config,
            data,
            dataCollection,
            searchValue,
            pageName
        }, options);
    }

    function handleResetFilters() {
        resetFilters({
            searchValue: '',
            inputFieldValue: [],
            config,
            data: dataCollection
        },
            pageName
        );

        setSearchValue('');
    }

    function getSelectedValue(list: any[] = [], fieldName: string) {
        const filters = config.filters?.[fieldName] || [];
        return list.filter((l: any) => filters.includes(l.name));
    }

    return (
        <div className="partner">
            <Card className="shadow-none border-b border-gray-200">
                <CardContent className="flex justify-between items-center p-7">
                    <Typography variant="h5" className="font-semibold text-gray-900">
                        Partners
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={createPartner}
                        disabled={!checkPerms({ FX_Partner: ['create'] })}
                        className="bg-blue-800 hover:bg-blue-900"
                    >
                        Create New
                    </Button>
                </CardContent>
            </Card>

            <div className="p-8 bg-gray-50">
                <Card className="shadow-none border border-gray-200">
                    <CardContent className="p-0">
                        {/* Search Section */}
                        <div className="p-5 flex justify-end">
                            <TextField
                                placeholder="Search by Partner Name"
                                variant="outlined"
                                size="small"
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    handleChange({ input: e.target.value });
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon className="text-gray-400" />
                                        </InputAdornment>
                                    ),
                                }}
                                className="w-96"
                            />
                        </div>

                        {/* Filter Section */}
                        <div className="p-5 border-t border-b border-gray-200 flex justify-between items-center">
                            <div className="flex flex-wrap gap-4 flex-grow">
                                {Object.entries(cfgOpt).map(([key, value]: [string, any]) => (
                                    <DropDownWithSearch
                                        key={key}
                                        placeHolder={value.placeholder}
                                        placeHolderSearchBox={value.searchplaceholder}
                                        label={value.label}
                                        multiple={true}
                                        selectBoxOptions={config[value.label] || []}
                                        selectedValue={getSelectedValue(config[value.label], value.field)}
                                        fieldName={value.field}
                                        valueChange={(options) => handleChange(options)}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-2">
                                {refresh && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={getRefreshData}
                                    >
                                        Refresh
                                    </Button>
                                )}

                                <Button
                                    variant="outlined"
                                    onClick={handleResetFilters}
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        </div>

                        {/* Partner List */}
                        <PartnerList
                            data={data}
                            config={config}
                            handler={getDataHandler}
                            requiredData={requiredData}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Partner;