/* eslint-disable react/no-array-index-key */
import React from 'react';
import styled from 'styled-components';

interface StyleProps {
  info: any;
}

const StyleContainter = styled.div`
  width: 300px;
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 1000;
  height: 100vh;
  box-shadow: 0px 5px 12px 0px rgba(169,175,192,0.35);
  overflow: auto;
  background-color: #fff;
  cursor: pointer;
`;

const StyleDiv = styled.div`
  width: 100%;
  margin-top: 32px;
  cursor: pointer; 
  font-size: 18px;
`;

const CodeTitle = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0px 24px;
  font-size: 18px;
  align-items: center;
  align-content: center;
  padding-top: 32px;
`;

const Button = styled.div`
  color: #268dec;
  background-color: #9fc2ea;
  border-radius: 10px;
  padding: 6px 12px;
`;

const currentCode = styled.div`
  width: 100%;
  display: flex;
  word-break: break-all;
  white-space: normal;
`;

const StyleComponent: React.FC<StyleProps> = (props) => {
  const { info } = props;
  return (
    <StyleContainter>
      <CodeTitle>
        <div>代码</div>
        <Button>复制代码</Button>
      </CodeTitle>
      <StyleDiv>
        {Object.entries(info).map((item, index) => (
          <div key={index}>
            {item[1] && (
            <div style={{ paddingLeft: 24, marginBottom: 8 }}>
              <span style={{ color: 'purple' }}>{item[0]}</span>
              <span style={{ paddingRight: 8, color: 'gray' }}>:</span>
              <span>{item[1]}</span>
            </div>
            )}
          </div>
        ))}
      </StyleDiv>
    </StyleContainter>
  );
};

export default StyleComponent;
