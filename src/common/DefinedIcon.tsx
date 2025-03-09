import { ReactComponent as CalculatorSVG } from '@/svg/calculator.svg';
import { ReactComponent as ComputeDeSvg } from '@/svg/computeDelete.svg';
import { ReactComponent as LocationSVG } from '@/svg/location.svg';
import { ReactComponent as OrderBuySvg } from '@/svg/orderBuy.svg';
import { ReactComponent as OrderDeleteSvg } from '@/svg/orderDelete.svg';
import { ReactComponent as OrderSvg } from '@/svg/orderDo2.svg';
import { ReactComponent as OrderVerSvg } from '@/svg/orderVerification.svg';
import { ReactComponent as OrderAllSvg } from '@/svg/orederAll.svg';
import { ReactComponent as QuickSVG } from '@/svg/quick.svg';
import { ReactComponent as LanguageSVG } from '@/svg/language.svg';
import { ReactComponent as RefreshSVG } from '@/svg/refresh.svg';
import { ReactComponent as SelectSVG } from '@/svg/select.svg';
import { ReactComponent as DetailEdit } from '@/svg/detailEdit.svg';
import { ReactComponent as PictureEdit } from '@/svg/pictureEdit.svg';
import { ReactComponent as TwoD } from '@/svg/view_2d.svg';
import { ReactComponent as ThreeD } from '@/svg/3d.svg';
import Icon from '@ant-design/icons';
import React from 'react';

type CustomIconComponentProps = React.ComponentProps<typeof Icon>;

// const OrderSvg = () => (
//   <svg
//     className="icon"
//     viewBox="0 0 1024 1024"
//     version="1.1"
//     xmlns="http://www.w3.org/2000/svg"
//     width="200"
//     height="200"
//   >
//     <path
//       d="M520.682667 767.850667l27.733333 27.733333a21.333333 21.333333 0 0 1-30.165333 30.165333L439.168 746.666667l79.082667-79.082667a21.333333 21.333333 0 0 1 30.165333 30.165333l-27.370667 27.370667A192 192 0 1 0 320 533.333333a21.333333 21.333333 0 0 1-42.666667 0c0-129.6 105.066667-234.666667 234.666667-234.666666s234.666667 105.066667 234.666667 234.666666c0 126.698667-100.416 229.952-225.984 234.517334zM298.666667 127.957333C298.666667 104.405333 317.824 85.333333 341.12 85.333333h341.76C706.304 85.333333 725.333333 104.490667 725.333333 127.957333v42.752A42.645333 42.645333 0 0 1 682.88 213.333333H341.12C317.696 213.333333 298.666667 194.176 298.666667 170.709333V127.957333zM341.333333 170.666667h341.333334V128H341.333333v42.666667z m-105.173333-42.666667v42.666667H170.752C170.688 170.666667 170.666667 895.893333 170.666667 895.893333 170.666667 896 853.333333 896 853.333333 896c0.042667 0 0-725.226667 0-725.226667C853.333333 170.688 789.909333 170.666667 789.909333 170.666667V128h63.296C876.842667 128 896 147.072 896 170.773333v725.12C896 919.509333 877.013333 938.666667 853.333333 938.666667H170.666667a42.666667 42.666667 0 0 1-42.666667-42.773334V170.773333C128 147.157333 147.114667 128 170.752 128h65.408z"
//       fill="#3D3D3D"
//     ></path>
//   </svg>
// );
export const OrderIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={OrderSvg} {...props} />
);
export const OrderAllIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={OrderAllSvg} {...props} />
);
export const OrderDeleteIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={OrderDeleteSvg} {...props} />
);
export const OrderBuyIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={OrderBuySvg} {...props} />
);
export const OrderVerIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={OrderVerSvg} {...props} />
);
export const LocationIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={LocationSVG} {...props} />
);
export const SelectIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={SelectSVG} {...props} />
);
export const RefreshIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={RefreshSVG} {...props} />
);
export const ComputeDeIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ComputeDeSvg} {...props} />
);
export const CalculatorSVGIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={CalculatorSVG} {...props} />
);
export const QuickSVGIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={QuickSVG} {...props} />
);
export const LanguageIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={LanguageSVG} {...props} />
);
export const DetailEditIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={DetailEdit} {...props} />
);
export const PictureEditIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={PictureEdit} {...props} />
);
export const TwoDIcon: React.FC = (props: Partial<CustomIconComponentProps>) => {
  return <Icon component={TwoD} {...props} />;
};
export const ThreeDIcon: React.FC = (props: Partial<CustomIconComponentProps>) => {
  return <Icon component={ThreeD} {...props} />;
};

import '@/svg/css/paly.css'; // 引入CSS文件
import { Flex, Space } from 'antd';

export const PlayingIcon: React.FC<{ color?: string }> = ({ color = '#1890ff' }) => {
  return (
    <Flex gap={'1px'} align={'center'} /*style={{ marginRight: '9px' }}*/>
      <div className="line line-left" style={{ backgroundColor: color }}></div>
      <div className="line line-middle" style={{ backgroundColor: color }}></div>
      <div className="line line-right" style={{ backgroundColor: color }}></div>
    </Flex>
  );
};
