/* eslint-disable no-unneeded-ternary */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prefer-stateless-function */
import React, { useEffect, useState } from 'react';
import JsZip from 'jszip';
// import sketch from 'sketch';
import Portal from './portal';
import Menu from './menu';
import StyleComponent from './style';
import PointSvg from './shape';
import { overrideListType, getStyleChildrenInfo } from './utils';

import './index.less';

const Test = () => {
  const [imgs, setImgs] = useState<any[]>([]);
  const [pagesList, setPages] = useState<any[]>([]);
  const [currentId, setCurrent] = useState<string>('');
  const [show, setShow] = useState(false);
  const [info, setInfo] = useState('');
  const [overId, setOverId] = useState('');
  const [documentSharedStyle, setSharedStyle] = useState<any[]>([]);
  const [symbolMasters, setMasters] = useState<any[]>([]);

  const bodyClick = () => {
    setShow(false);
  };

  useEffect(() => {
    document.body.addEventListener('click', bodyClick);
    return () => {
      document.body.removeEventListener('click', bodyClick);
    };
  }, []);

  const handleChange = (e: any) => {
    const { files } = e.target;
    const reader = new FileReader();
    reader.readAsArrayBuffer(files[0]);
    reader.onload = (evt) => {
      const data = evt.target?.result as ArrayBuffer;
      JsZip.loadAsync(data).then((zip) => {
        zip.forEach((value: any, key: any) => {
          if (value.startsWith('previews/')) {
            key.async('base64').then((content: any) => {
              const obj = {
                src: `data:image/png;base64,${content}`,
              };
              const img1 = new Image();
              img1.src = obj.src;
              img1.onload = () => {
                Object.assign(obj, {
                  width: img1.width,
                  height: img1.height,
                });
              };
            });
          }
          if (value.startsWith('meta')) {
            key.async('string').then((content: any) => {
              // console.log('---??meta', JSON.parse(content));
            });
          }
          if (value.startsWith('images')) {
            key.async('base64').then((content: any) => {
              setImgs((img) => img.concat([{ key: key.name, src: `data:image/png;base64,${content}` }]));
            });
          }
          if (value.startsWith('document')) {
            key.async('string').then((content: any) => {
              const documentsInfo = JSON.parse(content);
              const { layerStyles = {}, layerTextStyles = {} } = documentsInfo;
              setSharedStyle([...(layerStyles.objects || []), ...(layerTextStyles.objects || [])]);
              // console.log('---??document', JSON.parse(content));
            });
          }

          if (value.startsWith('pages/')) {
            key.async('string').then((content: any) => {
              setPages((ps) => ps.concat(JSON.parse(content)));
              const pageLayers = JSON.parse(content).layers || [];
              if (pageLayers.length > 0 && pageLayers[0]._class === 'symbolMaster') {
                setMasters(pageLayers);
              }
            });
          }
        });
      });
    };
  };

  const pages = pagesList.find((item) => item.do_objectID === currentId)?.layers || pagesList[0]?.layers || [];

  const Layer1 = (layers: any[], wp: number, parentList: overrideListType[] = []) => layers.map((item: any) => {
    const {
      currentStyle,
      itemValueOverride,
      background,
      borderColor,
      borderType,
      borderWidth,
      opacity,
      dashPattern,
      gradient,
      fillType,
      overrideList,
      borderFillType,
      borderGradient,
      shapeStyle,
      overrideSymbolID,
    } = getStyleChildrenInfo(item, documentSharedStyle, parentList, imgs, overId, wp);

    const infoObj = JSON.parse(JSON.stringify(currentStyle));
    const temList = overrideList.length > 0 ? overrideList : parentList;
    const currentSymbolMaster = symbolMasters.find((i: any) => {
      const id = overrideSymbolID || item.symbolID;
      return id === i.symbolID;
    })?.layers || [];

    if (item.do_objectID === 'FCE9ED37-B213-4178-B1DB-0C863A34A48D') {
      console.log('==item', item);
    }
    if (item.do_objectID === '9F6905D1-FDF5-41EB-8377-90D5E9F4090E') {
      console.log('==parent', item);
    }
    if (item.do_objectID === '31EFFF86-3683-4FCC-8611-E9C15B31E3BB') {
      console.log('==???another child', item);
    }

    return (
      <div
        key={item.do_objectID}
        className="layer"
        id={item.do_objectID}
        style={item._class === 'shapePath' || dashPattern.length > 0 ? shapeStyle : currentStyle}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation();
          setShow(true);
          setInfo(Object.assign(infoObj, {
            top: undefined,
            left: undefined,
            position: undefined,
          }));
          setOverId(item.do_objectID);
        }}
      >
        {(overrideSymbolID || item.symbolID) && Layer1(currentSymbolMaster, 1, temList)}
        {Array.isArray(item?.layers) && Layer1(item?.layers, wp, temList)}
        {itemValueOverride || item.attributedString?.string || (item._class === 'text' && item.name)}
        {(item._class === 'shapePath' || dashPattern.length > 0)
          && (
            <PointSvg
              item={item}
              lineWidth={borderWidth}
              borderColor={borderColor}
              borderType={borderType}
              fillStyle={background}
              gradient={gradient}
              fillType={fillType}
              opacity={opacity}
              borderFillType={borderFillType}
              borderGradient={borderGradient}
              dashPattern={dashPattern}
            />
          )}

      </div>
    );
  });

  return (
    <div style={{ display: 'flex' }}>
      {pagesList.length > 0 && (
        <Portal>
          <Menu pages={pagesList} currentId={currentId} setCurrent={setCurrent} />
        </Portal>
      )}
      {show && (
      <Portal>
        <StyleComponent info={info} />
      </Portal>
      )}
      {pages.length === 0 && <input type="file" onChange={handleChange} style={{ marginTop: 32 }} />}
      <div style={{
        width: '100%', border: '1px solid black', height: '100vh', overflow: 'auto', position: 'relative',
      }}
      >
        <div style={{
          width: 30000,
          height: 30000,
          background: '#fafafa',
        }}
        >
          {pagesList.length > 0 && (
            <div style={{ position: 'relative', left: 200 }}>
              {(pages || []).map((item: any) => {
                let background;
                const { backgroundColor: b, hasBackgroundColor, _class } = item || {};
                if (hasBackgroundColor && _class === 'artboard') {
                  background = `rgba(${b.red * 255}, ${b.green * 255}, ${b.blue * 255}, ${b.alpha})`;
                }
                return (
                  <div
                    key={item.do_objectID}
                    style={{
                      position: 'relative',
                      width: item.frame.width,
                      height: item.frame.height,
                      // top: item.frame.y,
                      // left: item.frame.x,
                      top: 0,
                      left: 0,
                      background,
                    }}
                  >
                    {Layer1(item.layers, 1)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Test;
