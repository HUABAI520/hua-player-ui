import { Check, CheckColor } from '@/pages/Guanli/Test';
import {
  Button,
  Col,
  ColorPicker,
  ColorPickerProps,
  Divider,
  Drawer,
  DrawerProps,
  Flex,
  message,
  Row,
  theme,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { DrawerStyles } from 'antd/es/drawer/DrawerPanel';
import { useModel } from '@umijs/max';
import { deleteLocal, getLocal, setLocal } from '@/common/utils/LocalUtils';
import { areColorsEqual } from '@/common/utils/ColorUtils';
import { THEME_COLOR, THEME_COLORS, THEME_LIGHT } from '@/common/GlobalKey';

interface ThemeSetProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

import './Theme.less';

const { useToken } = theme;
import { cyan, generate, green, presetPalettes, red } from '@ant-design/colors';
import defaultSettings from '../../../config/defaultSettings';
import { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { LightTheme } from '@/components/Theme/LightTheme';

type Presets = Required<ColorPickerProps>['presets'][number];
const genPresets = (presets = presetPalettes) =>
  Object.entries(presets).map<Presets>(([label, colors]) => ({
    label,
    colors,
  }));
const ThemeSet: React.FC<ThemeSetProps> = ({ open, setOpen }) => {
  const [placement, setPlacement] = useState<DrawerProps['placement']>('right');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const { settings } = initialState || {};
  const defaultColors = [
    '#1677FF',
    '#1890FF',
    '#F5222D',
    '#FA541C',
    '#FAAD14',
    '#13C2C2',
    '#52C41A',
    '#2F54EB',
    '#722ED1',
  ];
  const [colors, setColors] = useState<string[]>(
    getLocal(THEME_COLORS + currentUser?.id, defaultColors),
  );
  const selectedColor = useRef<string>();
  const [loading, setLoading] = useState(false);
  //动画

  const { token } = useToken();

  const presets = genPresets({
    primary: generate(token.colorPrimary),
    red,
    green,
    cyan,
  });

  const onClose = () => {
    setOpen(false);
  };
  const drawerStyles: DrawerStyles = {
    content: {
      boxShadow: '-10px 0 10px #666',
    },
  };
  const customPanelRender: ColorPickerProps['panelRender'] = (
    _,
    { components: { Picker, Presets } },
  ) => (
    <Row justify="space-between" wrap={false}>
      <Col span={12}>
        <Presets />
      </Col>
      <Divider type="vertical" style={{ height: 'auto' }} />
      <Col flex="auto">
        <Flex vertical justify={'space-between'} style={{ height: '100%' }}>
          <Picker />
          <Flex flex={1} align={'end'} justify={'end'} style={{ marginBottom: '10px' }}>
            <Button
              onClick={() => {
                if (loading) return;
                setLoading(true);
                const newColors = [...colors, selectedColor.current!];
                setLocal(THEME_COLORS + currentUser?.id, newColors);
                setLocal(THEME_COLOR + currentUser?.id, selectedColor.current!);
                setColors(newColors);
                setInitialState({
                  ...initialState,
                  settings: {
                    ...initialState?.settings,
                    colorPrimary: selectedColor.current!,
                  },
                });
                setLoading(false);
              }}
            >
              确认
            </Button>
          </Flex>
        </Flex>
      </Col>
    </Row>
  );
  return (
    <Drawer
      title={
        <Flex justify={'space-between'} align={'center'}>
          <span>自定义主题</span>
          <Button
            type="link"
            onClick={() => {
              if (loading) return;
              setLoading(true);
              deleteLocal(THEME_COLORS + currentUser?.id);
              deleteLocal(THEME_COLOR + currentUser?.id);
              deleteLocal(THEME_LIGHT + currentUser?.id);
              setColors(defaultColors);
              setInitialState({
                ...initialState,
                settings: {
                  ...(defaultSettings as Partial<LayoutSettings>),
                },
              });
              message.success('已重置为默认主题~');
              setLoading(false);
            }}
          >
            一键重置
          </Button>
        </Flex>
      }
      placement={placement}
      closable={false}
      onClose={onClose}
      open={open}
      key={placement}
      styles={drawerStyles}
    >
      <p>主题风格</p>
      <Flex gap={'small'} style={{ marginBottom: '12px' }}>
        <LightTheme
          backgroundColor={token.colorWhite}
          onClick={() => {
            if (!settings || settings.navTheme === 'light' || loading) return;
            setLoading(true);
            setLocal(THEME_LIGHT + currentUser?.id, 'light');
            setInitialState({
              ...initialState,
              settings: {
                ...initialState?.settings,
                navTheme: 'light',
              },
            });
            setLoading(false);
          }}
        >
          {settings && settings.navTheme === 'light' && (
            <Check
              style={{
                position: 'absolute', // 添加绝对定位
                right: '6px',
                bottom: 4,
                fontWeight: 'bold',
                pointerEvents: 'none',
                fontSize: 14,
              }}
            />
          )}
        </LightTheme>
        <LightTheme
          backgroundColor={'#001529D9'}
          onClick={() => {
            if (!settings || settings.navTheme === 'realDark' || loading) return;
            setLoading(true);
            setLocal(THEME_LIGHT + currentUser?.id, 'realDark');
            setInitialState({
              ...initialState,
              settings: {
                ...initialState?.settings,
                navTheme: 'realDark',
              },
            });
            setLoading(false);
          }}
        >
          <div
            style={{
              position: 'absolute',
              insetBlockStart: 0,
              insetInlineStart: 0,
              width: '100%',
              height: '25%',
              content: '',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              insetBlockStart: 0,
              insetInlineStart: 0,
              width: '33%',
              height: '100%',
              content: '',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
            }}
          />
          {settings && settings.navTheme === 'realDark' && (
            <Check
              style={{
                position: 'absolute', // 添加绝对定位
                right: '6px',
                bottom: 4,
                fontWeight: 'bold',
                pointerEvents: 'none',
                fontSize: 14,
              }}
            />
          )}
        </LightTheme>
      </Flex>
      <p>主题颜色</p>
      <Flex vertical gap={'middle'}>
        <Flex wrap={'wrap'} gap={'small'} style={{ width: '100%' }}>
          {colors?.map((c) => {
            const isActive = areColorsEqual(settings?.colorPrimary || '#1890FF', c);
            return (
              <div
                key={c}
                className={`colorSelect ${isActive ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => {
                  if (isActive || loading) return;
                  setLoading(true);
                  setLocal(THEME_COLOR + currentUser?.id, c);
                  setInitialState({
                    ...initialState,
                    settings: {
                      ...initialState?.settings,
                      colorPrimary: c,
                    },
                  });
                  setLoading(false);
                }}
              >
                <Check className="check-icon" /> {/* 为 Check 组件添加类名 */}
              </div>
            );
          })}
        </Flex>

        <Flex>
          <ColorPicker
            onChangeComplete={(color) => {
              selectedColor.current = color.toHexString();
            }}
            disabledAlpha
            styles={{ popupOverlayInner: { width: 480 } }}
            panelRender={customPanelRender}
            presets={presets}
            onOpenChange={(o) => {
              console.log('打开状态：', o);
            }}
            children={<Button type={'primary'} >自定义主题颜色</Button>}
            
          />
        </Flex>
      </Flex>
    </Drawer>
  );
};
export default ThemeSet;
