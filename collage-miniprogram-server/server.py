from flask import Flask, request, jsonify
from PIL import Image
from io import BytesIO
import base64
import os
import torch
from utils.svg_process import init_diffvg
from outline_svg import preprocessing
from unify import unify_raw_data,convert_image_alpha_to_binary
from test import task
import threading
import time
import cairosvg
app = Flask(__name__ ,static_folder='')
working = False
progress_data = {}  # 存储进度信息的全局字典
stop_ids = []
@app.route('/process_data', methods=['POST'])
def process_data():
    global working
    if working:
        return jsonify({'message': '正在执行，请稍后','status':'-1'})
    
    working = True
    
    data = request.get_json()
    svg_index = data['svgIndex']
    mask_index = data['maskIndex']
    svg_image_base64 = data['svgImage'] #这是个列表
    mask_image_base64 = data['maskImage']
    mask_base64 = data['mask']
    id = data['id']
    os.makedirs(f"./workdir/{str(id)}", exist_ok=True)
    os.makedirs(f"./workdir/{str(id)}/raw_data", exist_ok=True)
    os.makedirs(f"./workdir/{str(id)}/outline_files", exist_ok=True)
    os.makedirs(f"./workdir/{str(id)}/images", exist_ok=True)
    os.makedirs(f"./workdir/{str(id)}/masks", exist_ok=True)
    ptype = 0
    
    try:
        # 判断 num_list 中的所有数字是否都小于200
        if all(index < 200 for index in svg_index):
            
            if(44 in svg_index or 45 in svg_index):
                ptype = 1#png模式
                for i in range(len(svg_index)):
                    file_path1 = f'png/outline_files/{svg_index[i]+1}.json'
                    file_path2 = f'png/outline_files/outline_{svg_index[i]+1}.svg'
                    file_path3 = f'png/outline_files/uniform_{svg_index[i]+1}.png'
                    file_path4 = f'png/outline_files/{svg_index[i]+1}.png'
                    target_file_path1 = f'./workdir/{str(id)}/outline_files/{i+1}.json'
                    target_file_path2 = f'./workdir/{str(id)}/outline_files/outline_{i+1}.svg'
                    target_file_path3 = f'./workdir/{str(id)}/outline_files/uniform_{i+1}.png'
                    target_file_path4 = f'./workdir/{str(id)}/outline_files/{i+1}.png'
                    
                    paths = [
                        (file_path1, target_file_path1, 'text'),
                        (file_path2, target_file_path2, 'text'),
                        (file_path3, target_file_path3, 'binary'),
                        (file_path4, target_file_path4, 'binary')
                    ]
                    
                    for path in paths:
                        mode = 'r' if path[2] == 'text' else 'rb'
                        with open(path[0], mode) as original_file:
                            content = original_file.read()
                            mode = 'w' if path[2] == 'text' else 'wb'
                            with open(path[1], mode) as new_file:
                                new_file.write(content)
            else:
                
                for i in range(len(svg_index)):
                    file_path1 = f'svg/outline_files/{svg_index[i]+1}.json'
                    file_path2 = f'svg/outline_files/outline_{svg_index[i]+1}.svg'
                    file_path3 = f'svg/outline_files/uniform_{svg_index[i]+1}.svg'
                    file_path4 = f'svg/outline_files/{svg_index[i]+1}.png'
                    target_file_path1 = f'./workdir/{str(id)}/outline_files/{i+1}.json'
                    target_file_path2 = f'./workdir/{str(id)}/outline_files/outline_{i+1}.svg'
                    target_file_path3 = f'./workdir/{str(id)}/outline_files/uniform_{i+1}.svg'
                    target_file_path4 = f'./workdir/{str(id)}/outline_files/{i+1}.png'
                    
                    paths = [
                        (file_path1, target_file_path1, 'text'),
                        (file_path2, target_file_path2, 'text'),
                        (file_path3, target_file_path3, 'text'),
                        (file_path4, target_file_path4, 'binary')
                    ]
                    
                    for path in paths:
                        mode = 'r' if path[2] == 'text' else 'rb'
                        with open(path[0], mode) as original_file:
                            content = original_file.read()
                            mode = 'w' if path[2] == 'text' else 'wb'
                            with open(path[1], mode) as new_file:
                                new_file.write(content)
                
                  
                    
        elif 200 in svg_index:#手绘
            ptype = 2#预处理模式
            for i in range(len(svg_image_base64)):
                svg_image = base64_to_image(svg_image_base64[i])  # 处理单个图片
                svg_image.save(f'./workdir/{str(id)}/images/{i+1}.png')
                mask = convert_image_alpha_to_binary(svg_image)
                mask.save(f'./workdir/{str(id)}/masks/{i+1}.png')
                
        elif 201 in svg_index:#上传
            for i in range(len(svg_image_base64)):
                svg_image = base64_to_image(svg_image_base64[i])  # 处理单个图片
                svg_image.save(f'./workdir/{str(id)}/images/{i+1}.png')
            if mask_base64!='':#如果这个有值，说明有抠图
                mask = base64_to_image(mask_base64)
                mask.save(f'./workdir/{str(id)}/raw_data/koutu.png') 
                mask = mask.resize([svg_image.width,svg_image.height])
                mask = convert_image_alpha_to_binary(mask)
                mask.save(f'./workdir/{str(id)}/masks/1.png')
                ptype = 2#预处理模式
            else:
                ptype = 3#照片墙模式
            
                
            
        if mask_index<200:
            file_path = f'mask/{mask_index}.png'
            if os.path.exists(file_path):
                image = Image.open(file_path)
                image.save(f"./workdir/{str(id)}/target_shape.png")
            
        
        elif mask_index==200:#同理
            mask_image = base64_to_image(mask_image_base64)
            mask_image.save(f'./workdir/{str(id)}/raw_data/mask.png') 
    
            mask_image = unify_raw_data(mask_image)
            mask_image = convert_image_alpha_to_binary(mask_image)
            mask_image.save(f"./workdir/{str(id)}/target_shape.png")
    
        
    
        def progress_callback(task_id, type, steps):
            global progress_data
            progress_data[task_id] = {
                'type':type,
                'steps':steps
            }
            
        if ptype == 2:
            preprocessing(f"./workdir/{str(id)}",DECVICE,progress_callback=progress_callback,id=str(id),stop_ids = stop_ids)
            task(f"{str(id)}","any_shape_raster",f"./workdir/{str(id)}/target_shape.png",f'./workdir/{str(id)}',primitive_multiple=int(80/len(svg_index)),p_num=len(svg_index), progress_callback=progress_callback,stop_ids = stop_ids)
        elif ptype == 3:
            task(f"{str(id)}","photo_collage",f"./workdir/{str(id)}/target_shape.png",f'./workdir/{str(id)}',primitive_multiple=int(60/len(svg_image_base64)),photos_dir=f"./workdir/{str(id)}/images",p_num=len(svg_image_base64), progress_callback=progress_callback,stop_ids = stop_ids)
        elif ptype == 0:
            task(f"{str(id)}","any_shape_svg",f"./workdir/{str(id)}/target_shape.png",f'./workdir/{str(id)}' , primitive_multiple=int(80/len(svg_index)),p_num=len(svg_index), progress_callback=progress_callback,stop_ids = stop_ids)
            # 输入和输出文件路径
            input_svg_path = f"./workdir/{str(id)}/final.svg"
            output_png_path = f"./workdir/{str(id)}/final.png"
            # 将 SVG 转换为 PNG
            cairosvg.svg2png(url=input_svg_path, write_to=output_png_path)
            
        elif ptype == 1:
            task(f"{str(id)}","any_shape_raster",f"./workdir/{str(id)}/target_shape.png",f'./workdir/{str(id)}',primitive_multiple=int(80/len(svg_index)),p_num=len(svg_index), progress_callback=progress_callback,stop_ids = stop_ids)
            
    
        working = False
        return jsonify({'message': '生成成功','status':'0'})
        
    except Exception as e:
        error_message = str(e)
        working = False
        return jsonify({'status': -1, 'error': error_message})
            
    

@app.route('/get_progress', methods=['GET'])
def get_progress():
     # 从请求参数中获取ID
    id = request.args.get('id')
    
    #计算进度，百分之几之类的
    # 获取进度
    progress = progress_data.get(id,{})  # 默认进度为0
    print(progress)
    
    # 读取照片文件
    file_path = f'workdir/{str(id)}/final.png'
    if os.path.exists(file_path):
        # with open(file_path, 'rb') as file:
        #     photo_data = file.read()
        #     # 将照片数据进行 Base64 编码
        #     base64_data = base64.b64encode(photo_data).decode('utf-8')
        base64_data = f'https://collageminiprogram.szuvis.com/workdir/{str(id)}/final.png'
    else:
        base64_data = ''

    # 构建返回的 JSON 数据
    response_data = {
        'progress': progress,
        'photo_base64': base64_data
    }

    return response_data

@app.route('/stop_process' , methods=['POST'])
def stop_process():
    global stop_ids
    data = request.get_json()
    id = data['id']
    if id != -1:
        print('stop',id)
        stop_ids.append(str(id))
    else:
        print("要停止的id已执行完毕(-1)")
    return jsonify({'message': 'Stop signal received','id':id})

@app.route('/get_working', methods=['GET'])
def get_working():
    global working
    # 构建返回的 JSON 数据
    response_data = {
        'working': working,
    }
    return response_data

def base64_to_image(base64_data):
    image_data = base64.b64decode(base64_data)
    image = Image.open(BytesIO(image_data))
    return image
    
    
def clear_folder(folder_path):
    while True:
        for root, dirs, files in os.walk(folder_path, topdown=False):
            for name in files:
                try:
                    os.unlink(os.path.join(root, name))  # 删除文件
                except Exception as e:
                    print(f'Error deleting file {name}: {e}')
            for name in dirs:
                try:
                    os.rmdir(os.path.join(root, name))  # 删除空目录
                except Exception as e:
                    print(f'Error deleting directory {name}: {e}')
        print("已清空！")
        time.sleep(86400)  # 等待 24 小时
        # time.sleep(60)  # 等待 60 秒


if __name__ == '__main__':
    DECVICE = torch.device("cuda:1")
    threading.Thread(target=clear_folder, args=('workdir',), daemon=True).start()
    init_diffvg(DECVICE)
    app.run(host='0.0.0.0', port=5888)