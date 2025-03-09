// todo 类似编辑页的设计
// 但卡片宽 160 图片宽80 高107
import { CheckOutlined, HighlightOutlined } from '@ant-design/icons';
import { Button, Card, Flex, theme, Typography } from 'antd';
import React, { FC } from 'react';

interface SeriesCardProps {
  seriesId: number | undefined;
  anime: API.AnimeIndexResp;
  index: number;
  onChange?: (v: string) => void;
  onClick?: () => void;
  onSelect?: () => void;
  style?: React.CSSProperties;
}

const { useToken } = theme;
const { Paragraph } = Typography;
export const SeriesCard: FC<SeriesCardProps> = ({
  seriesId,
  anime,
  index,
  onChange,
  onClick,
  onSelect,
  style,
}) => {
  const { token } = useToken();
  const buttonF = () => anime?.seriesId && seriesId && anime?.seriesId === seriesId;

  return (
    <Card
      key={index}
      styles={{
        body: {
          padding: '5px',
          overflow: 'hidden',
          width: '100%',
        },
      }}
      style={{
        marginBottom: '6px',
        backgroundColor: 'transparent',
        border: 'none',
        marginRight: '5px',
        marginLeft: '5px',
        ...style,
      }}
      onClick={onSelect}
    >
      <Flex style={{ width: '100%' }} gap={'4px'}>
        <div
          style={{
            height: '107px',
            width: '80px',
            overflow: 'hidden',
            borderRadius: '3px',
            display: 'inline-block',
            cursor: 'pointer',
          }}
        >
          <img
            // preview={false}
            alt="avatar"
            src={anime?.image}
            loading={'lazy'}
            style={{
              // 添加圆角
              display: 'block',
              // height: '214px',
              // width: '160px',
              width: '100%',
              height: '100%',
              objectFit: 'fill',
              borderRadius: '3px',
              // transform: `${focusAnimeId ? 'scale(1.2)' : 'scale(1)'} ${
              //   fadeIn ? 'translateY(0)' : 'translateY(25%)'
              // }`,
              transition: 'all 0.75s ease-in-out', // 使用贝塞尔曲线实现慢-快-慢效果
              // opacity: fadeIn ? 1 : 0.75, // 控制透明度的渐入效果
            }}
            // fallback={pictureFallback}
          />
        </div>

        <Flex
          vertical
          style={{
            height: '107px',
          }}
          gap={'4px'}
          flex={1}
        >
          <Paragraph
            ellipsis={{ tooltip: `${anime?.name}`, rows: 2 }}
            style={{ margin: 0, zIndex: 10 }}
          >
            {anime?.name}
          </Paragraph>
          <Paragraph
            ellipsis={{ tooltip: `${anime?.seasonTitle}` }}
            style={{ margin: 0 }}
            editable={{
              icon: <HighlightOutlined style={{ color: token.colorPrimary }} />,
              onChange: (v) => {
                if (onChange) {
                  onChange(v);
                }
              },
              tooltip: false,
              enterIcon: <CheckOutlined />,
            }}
          >
            {anime?.seasonTitle}
          </Paragraph>
          <Flex align={'end'} justify={'space-between'} flex={1}>
            <Button type={buttonF() ? 'default' : 'primary'} onClick={onClick}>
              {buttonF() ? '移除' : '添加'}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
