from PIL import Image
import numpy as np
import cv2

def unify_raw_data(image):
    width = image.width
    height = image.height
    # 获取 alpha 通道
    alpha_channel = image.split()[-1]
    # 计算透明度不为 0 的边界框
    bbox = alpha_channel.getbbox()
    left, upper, right, lower = bbox
    x = left
    y = upper
    w = right-left
    h = lower-upper

    scale = 1000*0.8/max(w,h)

    numpy_image = np.array(image)
    image = cv2.cvtColor(numpy_image, cv2.COLOR_RGBA2BGRA)

    image = cv2.resize(image, (int(width*scale), int(height*scale)))

    x = int(x*scale)
    y = int(y*scale)

    margin1 = 100

    if w > h:
        margin2 = int((1000-h)/2)
        if x >= margin1:
            image = image[:, x-margin1:]
            x = margin1

        if image.shape[1] >= 1000:
            image = image[:,:1000-abs(margin1-x)]

        if y >= margin2:
            image = image[y-margin2:,:]
            y = margin2
        if image.shape[0] >= 1000:
            image = image[:1000-abs(margin2-y),:]

        # top, bottom, left, right
        image = cv2.copyMakeBorder(image, margin2-y, 0, margin1-x, 0, cv2.BORDER_CONSTANT, value=[0, 0, 0])

    else:
        margin3 = int((1000-w)/2)
        margin2 = margin1
        margin1 = margin3
        if x >= margin1:
            image = image[:, x-margin1:]
            x = margin1

        if image.shape[1] >= 1000:
            image = image[:,:1000-abs(margin1-x)]

        if y >= margin2:
            image = image[y-margin2:,:]
            y = margin2
        if image.shape[0] >= 1000:
            image = image[:1000-abs(margin2-y),:]

        # top, bottom, left, right
        image = cv2.copyMakeBorder(image, margin2-y, 0, margin1-x, 0, cv2.BORDER_CONSTANT, value=[0, 0, 0])
    image = Image.fromarray(image)
    return image


def convert_image_alpha_to_binary(image):
    image = image.convert("RGBA")
    # 获取图片的 alpha 通道
    alpha_channel = image.getchannel('A')
    
    # 将 alpha 通道转换为 numpy 数组
    alpha_array = np.array(alpha_channel)
    
    # 创建二值图，alpha > 1 为 False，alpha <= 1 为 True
    binary_array = alpha_array <= 1
    
    # 将二值数组转换为二值图像（模式为 '1'）
    binary_image = Image.fromarray(binary_array.astype(np.uint8) * 255, mode='L')
    
    return binary_image



# image = Image.open(r'E:\svg-collage-3.0\data\test3\images\1.png')
# width = image.width
# height = image.height
#  # 获取 alpha 通道
# alpha_channel = image.split()[-1]
# # 计算透明度不为 0 的边界框
# bbox = alpha_channel.getbbox()
# left, upper, right, lower = bbox
# x = left
# y = upper
# w = right-left
# h = lower-upper

# scale = 1000*0.8/max(w,h)

# numpy_image = np.array(image)
# image = cv2.cvtColor(numpy_image, cv2.COLOR_RGBA2BGRA)

# image = cv2.resize(image, (int(width*scale), int(height*scale)))

# x = int(x*scale)
# y = int(y*scale)

# margin1 = 100

# if w > h:
#     margin2 = int((1000-h)/2)
#     if x >= margin1:
#         image = image[:, x-margin1:]
#         x = margin1

#     if image.shape[1] >= 1000:
#         image = image[:,:1000-abs(margin1-x)]

#     if y >= margin2:
#         image = image[y-margin2:,:]
#         y = margin2
#     if image.shape[0] >= 1000:
#         image = image[:1000-abs(margin2-y),:]

#     # top, bottom, left, right
#     image = cv2.copyMakeBorder(image, margin2-y, 0, margin1-x, 0, cv2.BORDER_CONSTANT, value=[0, 0, 0])

# else:
#     margin3 = int((1000-w)/2)
#     margin2 = margin1
#     margin1 = margin3
#     if x >= margin1:
#         image = image[:, x-margin1:]
#         x = margin1

#     if image.shape[1] >= 1000:
#         image = image[:,:1000-abs(margin1-x)]

#     if y >= margin2:
#         image = image[y-margin2:,:]
#         y = margin2
#     if image.shape[0] >= 1000:
#         image = image[:1000-abs(margin2-y),:]

#     # top, bottom, left, right
#     image = cv2.copyMakeBorder(image, margin2-y, 0, margin1-x, 0, cv2.BORDER_CONSTANT, value=[0, 0, 0])
    
# image = Image.fromarray(image)
# image.save("test.png")


# def convert_image_alpha_to_binary(image_path):
#     # 打开图片并确保是 RGBA 模式
#     image = Image.open(image_path).convert("RGBA")
    
#     # 获取图片的 alpha 通道
#     alpha_channel = image.getchannel('A')
    
#     # 将 alpha 通道转换为 numpy 数组
#     alpha_array = np.array(alpha_channel)
    
#     # 创建二值图，alpha > 1 为 False，alpha <= 1 为 True
#     binary_array = alpha_array <= 1
    
#     # 将二值数组转换为二值图像（模式为 '1'）
#     binary_image = Image.fromarray(binary_array.astype(np.uint8) * 255, mode='L')
    
#     return binary_image

# # 使用示例
# image_path = r'E:\svg-collage-3.0\data\test3\1.png'
# binary_image = convert_image_alpha_to_binary(image_path)

# # 保存二值图像
# binary_image.save(r'E:\svg-collage-3.0\data\test3\2.png')

# # 显示二值图像
# binary_image.show()
