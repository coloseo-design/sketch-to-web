/* eslint-disable no-unneeded-ternary */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prefer-stateless-function */
import React, { useEffect, useState } from 'react';
import JsZip from 'jszip';
import Portal from './portal';
import Menu from './menu';
import StyleComponent from './style';
import Shape, { TestCanvas } from './shape';
import { overridListType, getStyleChildrenInfo } from './utils';

import './index.less';

const Test = () => {
  const [imgs, setImgs] = useState<any[]>([]);
  const [pagesList, setPages] = useState<any[]>([]);
  const [currentId, setCurrent] = useState<string>('');
  const [show, setShow] = useState(false);
  const [info, setInfo] = useState('');
  const [overId, setOverId] = useState('');
  const [documentSharedStyle, setSharedStyle] = useState<any[]>([]);
  const [symbolMatsers, setMasters] = useState<any[]>([]);

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
          // if (value.startsWith('meta')) {
          //   key.async('string').then((content: any) => {
          //     console.log('---??meta', JSON.parse(content));
          //   });
          // }
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
              console.log('---??document', JSON.parse(content));
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

  const Layer1 = (layers: any[], wp: number, parentList: overridListType[] = []) => layers.map((item: any) => {
    const {
      currentStyle,
      itemValueOverrid,
      background,
      borderColor,
      borderType,
      borderWidth,
      opacity,
      dashPattern,
      gradient,
      fillType,
      overridList,
      borderFillType,
      borderGradient,
      shapeTyle,
    } = getStyleChildrenInfo(item, documentSharedStyle, parentList, imgs, overId, wp);

    // if (item.do_objectID === '6941B512-A88F-41A2-ABC3-A71D0770D075') {
    //   console.log('==all', item, symbolMatsers.find((i: any) => i.symbolID === '0B739F4F-63F8-4B11-B22B-06D56F1D221C'));
    // }

    const infoObj = JSON.parse(JSON.stringify(currentStyle));

    return (
      <div
        key={item.do_objectID}
        className="layer"
        id={item.do_objectID}
        style={item._class === 'shapePath' || dashPattern.length > 0 ? shapeTyle : currentStyle}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation();
          console.log('==item', item);
          setShow(true);
          setInfo(Object.assign(infoObj, {
            top: undefined,
            left: undefined,
            position: undefined,
          }));
          setOverId(item.do_objectID);
        }}
      >
        {item.do_objectID === '6941B512-A88F-41A2-ABC3-A71D0770D075'
          ? <TestCanvas item={symbolMatsers.find((i: any) => i.symbolID === '0B739F4F-63F8-4B11-B22B-06D56F1D221C') || {}} />
          : (
            <>
              {item.symbolID && Layer1(symbolMatsers.find((i: any) => item.symbolID === i.symbolID)?.layers || [], 1, overridList.length > 0 ? overridList : parentList)}
              {Array.isArray(item?.layers) && Layer1(item?.layers, wp, overridList.length > 0 ? overridList : parentList)}
              {(itemValueOverrid || item.attributedString) && <div style={{ whiteSpace: 'pre-wrap' }}>{itemValueOverrid || item.attributedString.string}</div>}
              {(item._class === 'shapePath' || dashPattern.length > 0)
                && (
                  <Shape
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
                  />
                )}
            </>
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
