#!/usr/bin/env python3
"""
JUJU App 图标生成脚本
生成品牌图标和启动页背景
"""
from PIL import Image, ImageDraw, ImageFont
import os

# JUJU品牌色
BRAND_COLOR = (255, 107, 107)  # #FF6B6B 珊瑚红
SECONDARY_COLOR = (78, 205, 196)  # #4ECDC4 青绿色

def create_juju_icon(size, output_path):
    """创建JUJU品牌图标 - 圆形背景+JU字母"""
    # 创建圆形图标
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 绘制圆形背景（渐变效果）
    margin = size // 20
    draw.ellipse([margin, margin, size-margin, size-margin], fill=BRAND_COLOR)
    
    # 添加内部高光效果
    inner_margin = size // 10
    highlight_color = (255, 130, 130)  # 稍亮的红色
    draw.ellipse([inner_margin, inner_margin, size-inner_margin, size-inner_margin], fill=highlight_color)
    
    # 绘制JU文字
    try:
        font_size = int(size * 0.45)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "JU"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - size // 20
    
    # 绘制白色文字
    draw.text((x, y), text, fill=(255, 255, 255), font=font)
    
    # 保存
    img.save(output_path, 'PNG')
    return output_path

def create_launch_background(size, output_path):
    """创建启动页背景"""
    img = Image.new('RGB', size, (255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # 绘制渐变背景（简化版）
    width, height = size
    for y in range(height):
        ratio = y / height
        r = int(255 - (255 - BRAND_COLOR[0]) * ratio * 0.3)
        g = int(255 - (255 - BRAND_COLOR[1]) * ratio * 0.3)
        b = int(255 - (255 - BRAND_COLOR[2]) * ratio * 0.3)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # 绘制中央大Logo
    logo_size = min(width, height) // 4
    logo_x = (width - logo_size) // 2
    logo_y = (height - logo_size) // 2 - height // 10
    
    # 绘制圆形Logo背景
    draw.ellipse([logo_x, logo_y, logo_x + logo_size, logo_y + logo_size], fill=BRAND_COLOR)
    
    # 添加JU文字
    try:
        font_size = int(logo_size * 0.45)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "JU"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    text_x = logo_x + (logo_size - text_width) // 2
    text_y = logo_y + (logo_size - text_height) // 2 - logo_size // 20
    draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)
    
    # 添加应用名称
    try:
        name_font_size = int(min(width, height) * 0.06)
        name_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", name_font_size)
    except:
        name_font = ImageFont.load_default()
    
    name_text = "聚聚"
    bbox = draw.textbbox((0, 0), name_text, font=name_font)
    name_width = bbox[2] - bbox[0]
    name_x = (width - name_width) // 2
    name_y = logo_y + logo_size + height // 15
    draw.text((name_x, name_y), name_text, fill=(51, 51, 51), font=name_font)
    
    # 添加副标题
    try:
        sub_font_size = int(min(width, height) * 0.03)
        sub_font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", sub_font_size)
    except:
        sub_font = ImageFont.load_default()
    
    sub_text = "发现身边的精彩聚会"
    bbox = draw.textbbox((0, 0), sub_text, font=sub_font)
    sub_width = bbox[2] - bbox[0]
    sub_x = (width - sub_width) // 2
    sub_y = name_y + height // 12
    draw.text((sub_x, sub_y), sub_text, fill=(102, 102, 102), font=sub_font)
    
    img.save(output_path, 'PNG')
    return output_path

if __name__ == "__main__":
    # 获取项目根目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(script_dir)
    res_dir = os.path.join(base_dir, "android/app/src/main/res")
    
    # 图标尺寸定义
    icon_sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    
    # 生成应用图标
    print("=" * 50)
    print("生成JUJU品牌图标")
    print("=" * 50)
    
    for folder, size in icon_sizes.items():
        output_dir = os.path.join(res_dir, folder)
        
        # 生成方形图标 (ic_launcher.png)
        output_path = os.path.join(output_dir, "ic_launcher.png")
        create_juju_icon(size, output_path)
        print(f"✓ 生成图标: {folder}/ic_launcher.png ({size}x{size})")
        
        # 生成圆形图标 (ic_launcher_round.png)
        output_path_round = os.path.join(output_dir, "ic_launcher_round.png")
        create_juju_icon(size, output_path_round)
        print(f"✓ 生成图标: {folder}/ic_launcher_round.png ({size}x{size})")
    
    # 生成启动页背景
    launch_sizes = [
        ("drawable-mdpi", 320, 480),
        ("drawable-hdpi", 480, 800),
        ("drawable-xhdpi", 720, 1280),
        ("drawable-xxhdpi", 1080, 1920),
    ]
    
    print("\n" + "=" * 50)
    print("生成启动页背景")
    print("=" * 50)
    
    for folder, width, height in launch_sizes:
        output_dir = os.path.join(res_dir, folder)
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "launch_screen.png")
        create_launch_background((width, height), output_path)
        print(f"✓ 生成启动页: {folder}/launch_screen.png ({width}x{height})")
    
    print("\n✅ 所有图标和启动页生成完成!")
