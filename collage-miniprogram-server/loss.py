from torchvision import transforms
import torch
import torch.nn.functional as F
import torch.nn as nn
import pydiffvg
from utils.image_process import *
from torchvision.transforms import ToPILImage


def weights_mse(mask,raster_img,target_img,scale=1):
    loss_mse = F.mse_loss(raster_img, target_img)
    mask_raster_img = mask*raster_img
    mask_target_img = mask*target_img

    # image = ToPILImage()(mask_raster_img.detach())
    # image.save("test.png") 

    # image = ToPILImage()(mask_target_img.detach())
    # image.save("test1.png") 

    # image = ToPILImage()(raster_img.detach())
    # image.save("test2.png") 

    # image = ToPILImage()(target_img.detach())
    # image.save("test3.png") 

    loss_mse += F.mse_loss(mask_raster_img, mask_target_img)*100

    return loss_mse*scale

def exclude_loss(raster_img,scale=1):
    img = F.relu(178/255 - raster_img)
    # image = ToPILImage()(img.detach())
    # image.save("test4.png") 
    loss = torch.sum(img)*scale
    return loss

def weight_loss(size_tensor,target_area_list,scale):
    # 将维度为1的去掉 (20,1,1,2) 到 (20,2)
    size_tensor1 = size_tensor.squeeze()
    loss = 1-F.cosine_similarity(size_tensor1, target_area_list, dim=0)
    return loss*scale

def force_loss(pos_tensor,gravity_direction,scale=1):
    x1 = pos_tensor.squeeze()
    if gravity_direction=="left":
        result = x1[:,0]
    if gravity_direction == "down":
        result = 1000-x1[:,1]
    loss = torch.sum(result)+(1000-torch.min(x1[:,1]))*2
    loss = loss*scale
    return loss

def uniform_loss(mask1,raster_img,diflation_list,scale=1):
    loss = 0
    raster_img = rgb_to_grayscale(raster_img)
    for model in diflation_list:
        output_image = model(raster_img)*mask1
        loss+=torch.sum(output_image)

    # model = DilationApproximation(19).to(device)
    # output_image = model(raster_img)*mask1
    # image = ToPILImage()(output_image.detach())
    # image.save("2.png")
    # loss+=2*torch.sum(output_image)

    # model = DilationApproximation(23).to(device)
    # output_image = model(raster_img)*mask1
    # image = ToPILImage()(output_image.detach())
    # image.save("3.png")
    # loss+=3*torch.sum(output_image)

    # model = DilationApproximation(27).to(device)
    # output_image = model(raster_img)*mask1
    # image = ToPILImage()(output_image.detach())
    # image.save("4.png")
    # loss+=4*torch.sum(output_image)

    # model = DilationApproximation(31).to(device)
    # output_image = model(raster_img)*mask1
    # image = ToPILImage()(output_image.detach())
    # image.save("5.png")
    # loss+=5*torch.sum(output_image)

    # model = DilationApproximation(35).to(device)
    # output_image = model(raster_img)*mask1
    # image = ToPILImage()(output_image.detach())
    # image.save("6.png")
    # loss+=6*torch.sum(output_image)

    return loss*scale
