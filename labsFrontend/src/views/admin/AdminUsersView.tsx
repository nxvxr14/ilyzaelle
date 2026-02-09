import { useState, useEffect } from 'react';
import { getUsers } from '@/api/adminApi';
import UserList from '@/components/admin/UserList';
import Loading from '@/components/common/Loading';
import type { User } from '@/types';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations';

const AdminUsersView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getUsers();
        if (res.data) setUsers(res.data);
      } catch (e) {
        console.error('Fetch users error:', e);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div>
      <motion.h1 {...fadeInUp} className="font-pixel text-pixel-primary text-lg mb-6">
        Usuarios
      </motion.h1>

      <UserList users={users} onUserClick={(userId) => console.log('User:', userId)} />
    </div>
  );
};

export default AdminUsersView;
