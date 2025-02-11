import threading
import time
import argparse
import yaml
from shapecollage import ShapeCollage
import torch

def load_config(file_path,args):
    with open(file_path, 'r') as file:
        config =  yaml.safe_load(file)
        for key, value in config.items():
            setattr(args, key, value)
    return args

def main(args,device,progress_callback,stop_ids):
    sc = ShapeCollage(args,device,progress_callback,stop_ids)
    # shape_collage(args,device=torch.device('cuda:0'))
    sc.shape_collage()

def task(name,ptype,target_shape_mask_dir,primitive_dir,primitive_multiple,photos_dir=None,p_num=1, progress_callback=None,stop_ids = None):
    parser = argparse.ArgumentParser(
        description="collage",
    )
    # config
    parser.add_argument("-c", "--config", type=str,default="./data/config.yaml",help="YAML/YML file for configuration.")
    # 目标形状掩码路径
    parser.add_argument("-tsmd", "--target_shape_mask_dir", default=f"{target_shape_mask_dir}", type=str)
    # 形状类型
    parser.add_argument("-sc", "--shape_class", type=str, choices=["open", "closed"], default="closed",help="Specify the shape class (open, closed).")
    # 填充单元类型
    parser.add_argument("-pc", "--primitive_class", type=str, choices=["simple_shape", "any_shape_raster","any_shape_svg", "photo_collage", "wordle"], default=f"{ptype}",
                        help="Specify the primitive class (simple_shape, any_shape, photo_collage, wordle).")
    # 保存名称
    parser.add_argument("-sn", "--save_name", type=str, default=f"{name}",help="Files save name.")

    parser.add_argument("-pd","--primitive_dir",default=f"{primitive_dir}")

    parser.add_argument("-pm","--primitive_multiple",default=int(primitive_multiple))
    parser.add_argument("-phd","--photos_dir",default=f"{photos_dir}")
    parser.add_argument("--weights_list",default=[1]*int(p_num))

    args = parser.parse_args()
    args = load_config(args.config,args)
    device = torch.device("cuda:1")
    main(args,device,progress_callback,stop_ids)

# if __name__ == '__main__':
#     # 创建线程
#     # thread1 = threading.Thread(target=task, args=("A", 2))
#     thread1 = threading.Thread(target=task,args=("A"))
#     thread2 = threading.Thread(target=task,args=("B"))
#     thread3 = threading.Thread(target=task,args=("C"))
#     thread4 = threading.Thread(target=task,args=("D"))

#     # 启动线程
#     thread1.start()
#     thread2.start()
#     thread3.start()
#     thread4.start()

#     # 等待所有线程完成
#     thread1.join()
#     thread2.join()
#     thread3.join()
#     thread4.join()


#     print("All threads completed")

# from concurrent.futures import ThreadPoolExecutor, as_completed
# import time

# def task(n):
#     print(f"Task {n} starting")
#     time.sleep(2)
#     print(f"Task {n} completed")
#     return n * n

# # 创建一个包含 4 个线程的线程池
# with ThreadPoolExecutor(max_workers=4) as executor:
#     # 提交任务到线程池
#     futures = [executor.submit(task, i) for i in range(10)]
    
#     # 获取任务结果
#     for future in as_completed(futures):
#         print(f"Result: {future.result()}")

