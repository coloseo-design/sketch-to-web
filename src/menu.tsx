import React from 'react';
import styled from 'styled-components';

interface MenuProps {
  pages: any[];
  setCurrent: any;
  currentId: string;
}

const MenuDiv = styled.div`
  width: 200px;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 1000;
  height: 100vh;
  box-shadow: 0px 5px 12px 0px rgba(169,175,192,0.35);
  overflow: auto;
  background-color: #fff;
  cursor: pointer;
`;

const Menu: React.FC<MenuProps> = (props) => {
  const { pages = [], setCurrent, currentId } = props;
  return (
    <MenuDiv>
      {pages.map((item: any) => (
        <div
          style={{ padding: '8px' }}
          key={item.do_objectID}
          onClick={() => setCurrent(item.do_objectID)}
        >
          <div style={{ padding: '12px', borderRadius: 8, background: currentId === item.do_objectID ? 'grey' : undefined }}>
            {item.name}
          </div>
        </div>
      ))}
    </MenuDiv>
  );
};

export default Menu;
