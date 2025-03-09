import { Avatar, Flex } from 'antd';
import { FC } from 'react';

export const UserMsg: FC<{
  user: any;
  content?: string;
}> = ({ user, content }) => {
  return (
    <Flex align={'center'}>
      {content && <span style={{ fontSize: '16px' }}>{content}</span>}
      <Avatar size={40} src={user?.userAvatar} style={{ margin: '0 16px 0 0' }}></Avatar>
      <Flex style={{ margin: '0' }}>
        <span style={{ color: 'red', fontSize: '16px' }}>{user?.username}</span>
      </Flex>
    </Flex>
  );
};
