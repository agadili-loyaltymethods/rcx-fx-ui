// import { useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDialog } from '../dialog';
// import { useAlert } from '../alert';
// import { useIntegrations } from '../integrations/useIntegrations';
// import { useConnections } from '../connections';

// export const useConnectionUtils = () => {
//   const navigate = useNavigate();
//   const dialog = useDialog();
//   const alert = useAlert();
//   const { getIntegrations } = useIntegrations();
//   const { deleteConnections } = useConnections();

//   const edit = useCallback(async (row: any) => {
//     try {
//       const query = JSON.stringify({
//         $or: [
//           {
//             'inputProperties.connection': row._id,
//           },
//           {
//             'responseProperties.connection': row._id,
//           },
//         ],
//       });

//       const depIntegrations = await getIntegrations({ query });
//       const validStatuses = ['Published', 'Publish Pending', 'Paused'];
//       const hasValidIntegrationStatus = depIntegrations.some(item => validStatuses.includes(item.status));

//       if (depIntegrations.length) {
//         if (hasValidIntegrationStatus) {
//           dialog.open({
//             schema: 'Warning',
//             content: `Unable to edit connection <strong>${row.name}</strong>, as it is used in one or more integrations.`,
//             confirmButton: 'Close',
//             disableCancelButton: true,
//           });
//         } else {
//           dialog.open({
//             schema: 'Warning',
//             content: `The connection <strong>${row.name}</strong> is currently utilized in one or more integrations, meaning that any modifications to the connection will impact the execution of these integrations. Would you like to proceed?`,
//             confirmButton: 'Yes',
//             cancelButton: 'Cancel',
//             onConfirm: () => navigate(`connections/edit/${row._id}`, { state: row }),
//           });
//         }
//       } else {
//         navigate(`connections/edit/${row._id}`, { state: row });
//       }
//     } catch (err: any) {
//       alert.errorAlert(err?.errorMessage || 'Something went wrong. Please try again later.');
//     }
//   }, [navigate, dialog, alert, getIntegrations]);

//   const deleteConnection = useCallback((row: any) => {
//     dialog.open({
//       schema: 'Delete Connection',
//       content: `Are you sure that you want to delete <strong>${row.name}</strong>?`,
//       confirmButton: 'Yes, Delete',
//       cancelButton: 'No',
//       onConfirm: async () => {
//         try {
//           await deleteConnections(row);
//           alert.successAlert('Connection deleted successfully');
//         } catch (err: any) {
//           alert.errorAlert(err.errorMessage || 'Cannot delete connection');
//         }
//       },
//     });
//   }, [dialog, deleteConnections, alert]);

//   const navigate = useCallback(() => {
//     if (history.state?.source !== 'connections') {
//       window.history.back();
//     } else {
//       navigate('connection/list');
//     }
//   }, [navigate]);

//   return {
//     edit,
//     deleteConnection,
//     navigate,
//   };
// };