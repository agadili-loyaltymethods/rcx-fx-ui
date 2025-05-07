import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Typography,
    IconButton,
    Button,
    Card,
    CardContent,
    Drawer,
    Box
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { Link } from 'react-router-dom';
import { DynamicForm, DynamicTable, ErrorSidePanel } from '../../components/common';
import { useAlert } from '../../services/alert/useAlert';

const CreateUser: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const [data, setData] = useState<{partner?: any, role?: any, login?:any}>({});
    const [formGroup, setFormGroup] = useState<any>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [isView, setIsView] = useState(false);
    const [permissionsForRole, setPermissionsForRole] = useState<any[]>([]);
    const [currentRole, setCurrentRole] = useState<string>('');
    const [partner, setPartner] = useState<any>({});
    const [requiredData, setRequiredData] = useState<any>({});
    const [permissionListViewConfig, setPermissionListViewConfig] = useState<any>({});
    const [permissionConfigData, setPermissionConfigData] = useState<any[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const drawerRef = useRef<any>(null);
    const { successAlert, errorAlert } = useAlert();

    useEffect(() => {
        // Determine if we're in edit or view mode based on the URL
        const path = window.location.pathname.split('/')[2];
        setIsEdit(path === 'edit');
        setIsView(path === 'detail');

        // Get current user if editing or viewing
        if (id) {
            getCurrentUser(id);
        }

        // Set partner from state
        if (state?.partner) {
            setData(prev => ({ ...prev, partner: state.partner }));
            setPartner(state.partner);
        }

        // Get permission list view config
        getPermissionListViewConfig();
    }, [id, state]);

    const getCurrentUser = async (userId: string) => {
        try {
            // This would fetch the user from an API
            // For now, we'll just set some dummy data
            const userData = {
                _id: userId,
                login: 'user' + userId,
                email: `user${userId}@example.com`,
                partner: { _id: '1', name: 'Partner 1' }
            };

            setData(userData);
            setPartner(userData.partner);
        } catch (err: any) {
            errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
        }
    };

    const getPermissionListViewConfig = async () => {
        // This would fetch the config from a service
        // For now, we'll just set some dummy config
        setPermissionListViewConfig({
            data: [
                { name: 'resource', label: 'Resource', type: 'text' },
                { name: 'create', label: 'Create', type: 'boolean' },
                { name: 'read', label: 'Read', type: 'boolean' },
                { name: 'update', label: 'Update', type: 'boolean' },
                { name: 'delete', label: 'Delete', type: 'boolean' }
            ]
        });
    };

    const updateFormGroup = (formGroupData: any) => {
        setFormGroup(formGroupData);
    };

    const saveUser = async () => {
        try {
            // Ensure partner is properly formatted for API
            const userData = {
                ...data,
                partner: data.partner?._id || data.partner
            };

            // This would save the user via API
            // const result = await createUpdateUser(userData, isEdit);

            // If new user, send reset password email
            if (!isEdit) {
                // This would send a reset password email
                // await resetPassword({ userID: `${result.org?.name}/${result.login}`, client: 'fxui' });
            }

            // Update role if changed
            if (isEdit && currentRole && currentRole !== data.role) {
                // This would revoke the old role
                // await revokeRole(data.login, currentRole);
            }

            if (currentRole !== data.role) {
                // This would add the new role
                // await addRole(data.login, { role: data.role });
            }

            successAlert('User saved successfully');
            navigate('/partners');
        } catch (err: any) {
            if (err.errorMessage === 'Validation Error') {
                // Parse validation errors
                setErrors(err.errors || []);
                setDrawerOpen(true);
                return;
            }

            errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
        }
    };

    const getPartnerName = () => {
        return partner?.name || '';
    };

    const checkCurrentRole = async () => {
        if (isEdit || isView) {
            try {
                // This would fetch the user's role from an API
                // For now, we'll just set some dummy data
                const role = 'admin';

                setData(prev => ({ ...prev, role }));
                setCurrentRole(role);
                await onRoleChange();
            } catch (err: any) {
                errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
            }
        }
    };

    const onRoleChange = async () => {
        try {
            if (!data.role) {
                return;
            }

            // This would fetch permissions for the role from an API
            // For now, we'll just set some dummy data
            const permissions = [
                {
                    FX_Integration: {
                        create: true,
                        read: true,
                        update: true,
                        delete: false
                    },
                    FX_Connection: {
                        create: true,
                        read: true,
                        update: true,
                        delete: false
                    }
                }
            ];

            setPermissionsForRole(permissions);

            const permissionConfigData: any[] = [];

            permissions.forEach((perm: any) => {
                Object.keys(perm).forEach((act) => {
                    const obj = {
                        resource: act,
                        create: perm[act].create,
                        read: perm[act].read,
                        update: perm[act].update,
                        delete: perm[act].delete,
                    };

                    permissionConfigData.push(obj);
                });
            });

            setPermissionConfigData(permissionConfigData);
        } catch (err: any) {
            errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
        }
    };

    const onDrawerClosed = () => {
        setDrawerOpen(false);
    };

    // Define handlers for the dynamic form
    const handlers = {
        onRoleChange,
        checkCurrentRole
    };

    return (
        <div className="bg-white">
            {/* Header */}
            <div className="flex justify-between items-center px-7 py-4 border-b border-gray-200">
                <div className="flex items-center">
                    <div className="mr-4">
                        <IconButton
                            className="border border-gray-200 rounded-full"
                            component={Link}
                            to="/partners"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    </div>
                    <div>
                        <Typography variant="body2" className="text-gray-700">
                            User for {partner?.name}
                        </Typography>
                        <Typography variant="h6" className="font-semibold">
                            {formGroup?.controls?.['login']?.value || data.login || ''}
                        </Typography>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isView && (
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={saveUser}
                            disabled={!formGroup?.valid}
                            className="bg-blue-800 hover:bg-blue-900"
                        >
                            Save
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <Box className="relative">
                <div className="p-6">
                    <Card className="border border-gray-200 rounded-t-lg">
                        <div className="flex items-center px-5 py-6 border-b border-gray-200">
                            <Typography variant="h6" className="font-semibold">
                                User Details
                            </Typography>
                        </div>

                        <CardContent>
                            {/* Dynamic Form */}
                            <DynamicForm
                                config={{
                                    data: {
                                        userdata: {
                                            dataFields: [
                                                {
                                                    fields: [
                                                        {
                                                            field: 'login',
                                                            label: 'Username',
                                                            type: 'text',
                                                            required: true
                                                        },
                                                        {
                                                            field: 'email',
                                                            label: 'Email',
                                                            type: 'text',
                                                            required: true,
                                                            regExp: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
                                                        },
                                                        {
                                                            field: 'role',
                                                            label: 'Role',
                                                            type: 'select',
                                                            selectData: 'selectRoles',
                                                            selectLabel: 'name',
                                                            selectValue: 'id',
                                                            required: true,
                                                            selectionChange: 'onRoleChange'
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }}
                                data={data}
                                handlers={handlers}
                                requiredData={requiredData}
                                title="userdata"
                                formStatus={updateFormGroup}
                            />

                            {/* User Permissions */}
                            <div className="mt-8">
                                <Typography variant="h6" className="font-semibold mb-4">
                                    User Permissions
                                </Typography>

                                <DynamicTable
                                    config={permissionListViewConfig}
                                    data={permissionConfigData}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Error Drawer */}
                <Drawer
                    anchor="right"
                    open={drawerOpen}
                    onClose={onDrawerClosed}
                    ref={drawerRef}
                >
                    <ErrorSidePanel
                        drawer={{ toggle: () => setDrawerOpen(!drawerOpen) }}
                        errors={errors}
                    />
                </Drawer>
            </Box>
        </div>
    );
};

export default CreateUser;