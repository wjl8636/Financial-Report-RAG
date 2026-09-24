from openai import OpenAI
from llama_index.core.data_structs import Node
from llama_index.core.schema import NodeWithScore
from llama_index.postprocessor.dashscope_rerank import DashScopeRerank
import numpy as np
from typing import List

import os
from dotenv import load_dotenv
load_dotenv()

def get_chat_completion_block(session_id, question, references):
    """
    结合知识库内容生成回答，并在回答中标注引用来源。

    :param question: 用户问题
    :param references: 知识库内容，格式为 [{"id": 1, "content": "..."}, ...]
    :return: 模型的回答
    """
    try:
        
        # 初始化 OpenAI 客户端
        client = OpenAI(
            api_key=os.getenv("DASHSCOPE_API_KEY"),
            base_url=os.getenv("DASHSCOPE_BASE_URL")
        )
        # 格式化参考内容
        formatted_references = "\n".join([f"[{ref['id']}] {ref['content']}" for ref in references])
    
        # 构造提示词
        
    
        # 调用模型生成回答
        completion = client.chat.completions.create(
            model="deepseek-r1",
            messages=[{"role": "user", "content": prompt}],
            stream=False,
        )
    
        return completion.choices[0].message.content

    except Exception as e:
        return f"Error: {str(e)}"

def rerank_similarity(query, texts):
    api_key = os.getenv("DASHSCOPE_API_KEY")
    # 创建节点列表
    nodes = [NodeWithScore(node=Node(text=text), score=1.0) for text in texts]

    # 初始化 DashScopeRerank
    dashscope_rerank = DashScopeRerank(top_n=len(texts), api_key=api_key)

    # 执行重排序
    results = dashscope_rerank.postprocess_nodes(nodes, query_str=query)

    # 提取分数
    scores = [res.score for res in results]
    scores = np.array(scores)

    # 返回分数和一个占位符
    return scores, None




def generate_embedding(text: str | List[str], api_key: str = None, base_url: str = None, model_name: str = "text-embedding-v3", dimensions: int = 1024, encoding_format: str = "float", max_batch_size: int = 10):
    """
    生成文本的向量嵌入
    
    Args:
        text: 单个文本或文本列表
        api_key: API密钥
        base_url: API基础URL
        model_name: 模型名称
        dimensions: 向量维度
        encoding_format: 编码格式
        max_batch_size: 最大批量大小，默认为10（阿里云DashScope限制）
    
    Returns:
        单个文本时返回向量，文本列表时返回向量列表
    """
    api_key = os.getenv("DASHSCOPE_API_KEY")
    base_url = os.getenv("DASHSCOPE_BASE_URL")    

    # 初始化 OpenAI 客户端
    client = OpenAI(
        api_key=api_key,
        base_url=base_url
    )

    # 如果是单个文本，直接处理
    if isinstance(text, str):
        try:
            completion = client.embeddings.create(
                model=model_name,
                input=text,
                dimensions=dimensions,
                encoding_format=encoding_format
            )
            return completion.data[0].embedding
        except Exception as e:
            print(f"OpenAI API 请求失败: {e}")
            return None
    
    # 如果是文本列表，需要分批处理
    if isinstance(text, list):
        all_embeddings = []
        
        # 分批处理
        for i in range(0, len(text), max_batch_size):
            batch = text[i:i + max_batch_size]
            
            try:
                completion = client.embeddings.create(
                    model=model_name,
                    input=batch,
                    dimensions=dimensions,
                    encoding_format=encoding_format
                )
                
                # 收集这一批的向量
                batch_embeddings = [item.embedding for item in completion.data]
                all_embeddings.extend(batch_embeddings)
                
            except Exception as e:
                print(f"OpenAI API 批量请求失败 (batch {i//max_batch_size + 1}): {e}")
                # 如果批量失败，为这一批添加空向量
                all_embeddings.extend([None] * len(batch))
        
        return all_embeddings


# 示例调用
if __name__ == "__main__":
    # 示例调用
    question = "法国的首都是哪里？"
    references = [
        {"id": 1, "content": "法国的首都是巴黎。"},
        {"id": 2, "content": "巴黎是欧洲的文化中心之一。"},
    ]
    session_id = "sd"
    
    response = get_chat_completion_block(session_id, question, references)
    print(response)