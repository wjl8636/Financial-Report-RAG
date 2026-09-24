FROM python:3.11.7-slim

# 方案1：使用更稳定的镜像源（清华大学镜像源）
RUN echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian-security bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list

# 或者使用官方源作为备用（如果镜像源有问题，请取消注释下面几行）
# RUN echo "deb http://deb.debian.org/debian bookworm main" > /etc/apt/sources.list && \
#     echo "deb http://security.debian.org/debian-security bookworm-security main" >> /etc/apt/sources.list && \
#     echo "deb http://deb.debian.org/debian bookworm-updates main" >> /etc/apt/sources.list

# 安装必要的构建工具和依赖，增加错误处理
RUN apt-get update --fix-missing || apt-get update && \
    apt-get install -y --no-install-recommends --fix-missing \
    build-essential \
    python3-dev \
    make \
    libgl1 \
    libgl1-mesa-glx \
    libglu1-mesa \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 更新 pip 并配置镜像源
RUN pip config set global.extra-index-url "https://mirrors.cernet.edu.cn/pypi/web/simple"
RUN pip install --upgrade pip setuptools wheel

# 设置工作目录
WORKDIR /app

# 拷贝依赖文件并安装
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 拷贝代码
COPY . /app

# 修改文件权限
RUN chmod -R 755 /app
RUN chmod +x /app/start.sh

# 设置启动脚本为入口点
ENTRYPOINT ["/app/start.sh"]
