import React from 'react';
import Layout from '@/components/Layout';
import AccessConfigPanel from '@/components/admin/AccessConfigPanel';

const AdminConfig: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <AccessConfigPanel />
      </div>
    </Layout>
  );
};

export default AdminConfig;