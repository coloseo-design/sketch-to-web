import React from 'react';
import ReactDOM from 'react-dom';

export interface PortalProps {
  getPopupContainer?: () => HTMLElement | null;
}
const div = document.createElement('div');
div.setAttribute('style', 'position: absolute; top: 0px; left: 0px; width: 100%');

const Portal: React.FC<PortalProps> = (props) => {
  const { getPopupContainer = () => document.body, children } = props;
  React.useEffect(() => {
    const containter = getPopupContainer();
    containter && containter.appendChild(div);
    () => {
      containter && containter.removeChild(div);
    };
  }, []);
  return (
    ReactDOM.createPortal(children, div)
  );
};

export default Portal;
