import { useEffect } from 'react';

// 假设uploadImage函数的类型定义
type UploadImage = (file: File) => Promise<void>;

// 定义props类型接口（解决TS2554和index.d.ts错误）
interface ImageUploadProps {
  frames?: string[];
  uploadImage: UploadImage;
}

const ImageUploader = ({ frames, uploadImage }: ImageUploadProps) => {
  // base64转File的工具函数（带类型定义）
  const base64ToFile = (base64String: string, fileName: string): File => {
    const arr = base64String.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);

    if (!mimeMatch) {
      throw new Error('Invalid base64 string');
    }

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    // 明确类型，解决TS7009错误
    return new File([u8arr], fileName, { type: mime }) as File;
  };

  useEffect(() => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    // 图片压缩函数（带完整类型）
    const compressImage = async (base64Str: string, maxSize: number): Promise<File> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          // 保持原始比例
          canvas.width = img.width;
          canvas.height = img.height;

          // 绘制图片
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 初始质量
          let quality = 0.9;
          let compressedDataUrl: string;

          // 循环压缩直到符合大小要求或质量过低
          const compress = () => {
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

            // 计算压缩后的大小
            const compressedSize = compressedDataUrl.length * 0.75;

            // 如果小于最大尺寸或质量已过低，则停止压缩
            if (compressedSize <= maxSize || quality <= 0.1) {
              // 转换为File对象
              const file = base64ToFile(compressedDataUrl, 'frame.jpg');
              resolve(file);
              return;
            }

            // 每次降低10%的质量
            quality -= 0.1;
            compress();
          };

          compress();
        };

        img.onerror = () => {
          throw new Error('Failed to load image');
        };
      });
    };

    // 处理图片上传的主函数
    const handleImageUpload = async () => {
      if (frames && frames.length > 0) {
        // 从base64数据中提取
        const base64Data = frames[0].split(',')[1];
        const originalDataUrl = `data:image/jpeg;base64,${base64Data}`;

        // 计算原始图片大小
        const originalSize = base64Data.length * 0.75;

        let jpegFile: File;

        // 检查是否超过最大限制
        if (originalSize > MAX_SIZE) {
          // 压缩图片
          jpegFile = await compressImage(originalDataUrl, MAX_SIZE);
          console.log('图片已压缩至10M以下');
        } else {
          // 无需压缩，直接转换
          jpegFile = base64ToFile(originalDataUrl, 'frame.jpg');
        }

        // 上传图像
        await uploadImage(jpegFile);
      }
    };

    handleImageUpload().catch((err) => {
      console.error('图片处理失败:', err);
    });
  }, [frames]); // 确保依赖项完整

  return null; // 根据实际组件返回内容调整
};

export default ImageUploader;
