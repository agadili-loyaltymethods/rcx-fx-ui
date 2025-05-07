import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicTable } from '../../components/common';
import { Typography, Button} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUtils } from '../../services/utils/useUtils';

interface PartnerListProps {
    config: any;
    data: any[];
    handler: any;
    requiredData?: any;
}

const PartnerList: React.FC<PartnerListProps> = ({
    config,
    data = [],
    handler,
    requiredData = {}
}) => {
    const [childData, setChildData] = useState<any[]>([]);
    const navigate = useNavigate();
    const { checkPerms } = useUtils();

    useEffect(() => {
        if (data && data.length) {
            // Sort data by creation date (newest first)
            const sortedData = [...data].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            if (requiredData) {
                requiredData.selectedRow = sortedData[0];
            }

            getUsers();
        }
    }, [data]);

    const resetSelection = (newData: any[]) => {
        if (requiredData) {
            requiredData.selectedRow = (newData && newData[0]) || {};
        }
    };

    const editHandler = (row: any) => {
        handler.edit(row);
    };

    const deleteHandler = (row: any) => {
        handler.delete(row);
    };

    const editUserHandler = (row: any) => {
        handler.editUser(row);
    };

    const deleteUserHandler = (row: any) => {
        handler.deleteUser(row);
    };

    const createUser = () => {
        navigate('/users/create', { state: { partner: requiredData.selectedRow } });
    };

    const getUsers = async () => {
        if (!checkPerms({ User: ['read'] })) {
            return;
        }

        if (requiredData?.selectedRow?._id) {
            try {
                // This would fetch users based on the selected partner
                // For now, we'll just set some dummy data
                const users = [
                    { _id: '1', login: 'user1', email: 'user1@example.com', updatedBy: { login: 'admin' }, updatedAt: new Date().toISOString() },
                    { _id: '2', login: 'user2', email: 'user2@example.com', updatedBy: { login: 'admin' }, updatedAt: new Date().toISOString() }
                ];

                setChildData(users);
            } catch (err: any) {
                console.error('Error fetching users:', err);
            }
        } else {
            setChildData([]);
        }
    };

    const handlers = {
        edit: editHandler,
        delete: deleteHandler,
        editUser: editUserHandler,
        deleteUser: deleteUserHandler,
        getUsers,
        resetSelection
    };

    // Child config for users table
    const childConfig = {
        data: [
            { name: 'login', label: 'Username', type: 'text', routerLink: '/users/detail' },
            { name: 'email', label: 'Email', type: 'text' },
            { name: 'updatedBy.login', label: 'Last Updated By', type: 'text' },
            { name: 'updatedAt', label: 'Last Updated', type: 'date', pipe: 'dateTimeFormat' },
            { name: 'actions', label: 'Actions', type: 'actions' }
        ],
        actions: [
            { name: 'Edit', iconname: 'edit', clickHandler: 'editUser' },
            { name: 'Delete', iconname: 'delete', clickHandler: 'deleteUser' }
        ]
    };

    return (
        <div className="responsive-table">
            <DynamicTable
                config={config}
                data={data}
                requiredData={requiredData}
                handlers={handlers}
            />

            {checkPerms({ 'User': ['read'] }) && (
                <div>
                    <div className="bg-white border-b border-gray-200 shadow-sm">
                        <div className="flex items-center p-7">
                            <Typography variant="h5" className="font-semibold text-gray-900">
                                Partner Admins
                            </Typography>

                            {checkPerms({ 'User': ['create'] }) && (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={createUser}
                                    className="ml-auto bg-blue-800 hover:bg-blue-900"
                                >
                                    Create Partner Admins
                                </Button>
                            )}
                        </div>
                    </div>

                    <DynamicTable
                        config={childConfig}
                        data={childData}
                        handlers={handlers}
                    />
                </div>
            )}
        </div>
    );
};

export default PartnerList;