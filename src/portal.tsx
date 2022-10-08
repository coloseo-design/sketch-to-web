import React from 'react';
import ReactDOM from 'react-dom';

export interface PortalProps {
  getPopupContainer?: () => HTMLElement | null;
  children: any;
}
const div = document.createElement('div');
div.setAttribute('style', 'position: absolute; top: 0px; left: 0px; width: 100%');

const Portal: React.FC<PortalProps> = (props) => {
  const { getPopupContainer = () => document.body, children } = props;
  React.useEffect(() => {
    const container = getPopupContainer();
    container && container.appendChild(div);
    () => {
      container && container.removeChild(div);
    };
  }, []);
  return (
    ReactDOM.createPortal(children, div)
  );
};

export default Portal;
