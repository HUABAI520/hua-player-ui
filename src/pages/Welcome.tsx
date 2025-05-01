import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Space, theme, Typography } from 'antd';
import React, { useEffect, useRef } from 'react';

const { Title, Paragraph } = Typography;

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = '1';
            (entry.target as HTMLElement).style.transform = 'translateY(0)';
            // 然后取消观察
            observer.unobserve(entry.target);
          } else {
            (entry.target as HTMLElement).style.opacity = '0';
            (entry.target as HTMLElement).style.transform = 'translateY(50px)';
          }
        });
      },
      { threshold: 0.1 },
    );

    const sections = containerRef.current?.querySelectorAll('.section');
    sections?.forEach((section) => observer.observe(section));

    return () => {
      sections?.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const sections = [
    {
      title: '欢迎来到动漫世界',
      content: '这里是您探索无限动漫乐趣的起点。我们为您精心挑选了来自世界各地的优质动漫作品。',
      image: 'https://example.com/anime-world.jpg',
    },
    {
      title: '海量内容',
      content: '从经典名作到最新热播,应有尽有。无论您喜欢什么类型,总能找到心仪的作品。',
      image: 'https://example.com/anime-collection.jpg',
    },
    {
      title: '高清观看体验',
      content: '全站支持高清播放,让您享受极致画质。多语言字幕和配音选择,打造个性化观看体验。',
      image: 'https://example.com/hd-watching.jpg',
    },
    {
      title: '社区互动',
      content: '加入我们的动漫爱好者社区,分享观后感,参与讨论,结识志同道合的朋友。',
      image: 'https://example.com/anime-community.jpg',
    },
    {
      title: '开始您的动漫之旅',
      content: '准备好了吗?点击下方按钮,立即开始精彩的动漫冒险!',
      image: 'https://example.com/start-journey.jpg',
    },
  ];

  return (
    <PageContainer title={false}>
      <div ref={containerRef} style={{ overflow: 'hidden' }}>
        {sections.map((section, index) => (
          <div
            key={index}
            className="section"
            style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              opacity: 0,
              transform: 'translateY(50px)',
              transition: 'opacity 0.8s, transform 0.8s',
            }}
          >
            <Card
              style={{
                width: '80%',
                maxWidth: 800,
                textAlign: 'center',
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadowSecondary,
              }}
              cover={
                <img
                  alt={section.title}
                  src={section.image}
                  style={{ height: 300, objectFit: 'cover' }}
                />
              }
            >
              <Space direction="vertical" size="large">
                <Title level={2}>{section.title}</Title>
                <Paragraph style={{ fontSize: 18 }}>{section.content}</Paragraph>
                {index === sections.length - 1 && (
                  <Button type="primary" size="large" href="/dongman/index">
                    开始探索
                  </Button>
                )}
              </Space>
            </Card>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};

export default Welcome;
