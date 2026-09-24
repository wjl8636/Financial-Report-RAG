from elasticsearch import Elasticsearch
from openai import OpenAI
import jieba
import json



def generate_embedding(text: str, api_key: str = None, base_url: str = None, model_name: str = "text-embedding-v3", dimensions: int = 1024, encoding_format: str = "float"):
    api_key = "sk-f25b431f918a4796b65b1ae4a2c3ce56"
    base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"    

    # 初始化 OpenAI 客户端
    client = OpenAI(
        api_key=api_key,
        base_url=base_url
    )

    # 调用 OpenAI 的嵌入接口
    try:
        completion = client.embeddings.create(
            model=model_name,
            input=text,
            dimensions=dimensions,
            encoding_format=encoding_format
        )
        embedding = completion.data[0].embedding
        return embedding
    except Exception as e:
        print(f"OpenAI API 请求失败: {e}")
        return None
    
def retrieve_content(session_id: str, question: str):
    print("连接数据库")
    es = Elasticsearch(
            ["http://es01:9200"],  # Elasticsearch 主机地址
            basic_auth=("elastic", "infini_rag_flow"),  # 用户名和密码
            verify_certs=False,  # 禁用 SSL 证书验证
            timeout=600
        )
    # 手动对查询进行分词
    tokens = jieba.lcut(question)

    # 生成问题向量
    question_vector = generate_embedding(question)

    # 构建混合检索查询
    search_body = {
        "size": 3,
        "query": {
            "script_score": {
                "query": {
                    "bool": {
                        "should": [
                            {
                                "terms": {
                                    "content_ltks": tokens
                                }
                            },
                            {
                                "terms": {
                                    "content_with_weight": tokens
                                }
                            }
                        ]
                    }
                },
                "script": {
                    "source": """
                        cosineSimilarity(params.query_vector, 'q_1024_vec') + 1.0 + _score
                    """,
                    "params": {
                        "query_vector": question_vector
                    }
                }
            }
        },
        "highlight": {
            "fields": {
                "content_ltks": {},
                "content_with_weight": {}
            }
        },
        "track_total_hits": True
    }

    # 执行查询
    print("session_id:" + session_id)
    response = es.search(index=session_id, body=search_body)

    # 设置阈值
    threshold = 3.0

    # 过滤结果
    filtered_results = [
        hit for hit in response['hits']['hits'] if hit['_score'] >= threshold
    ]

    # 解析结果并返回
    results = []
    for hit in filtered_results:
        result = {
            # "score": hit['_score'],
            "doc_id": hit['_source'].get('doc_id', 'N/A'),
            "docnm": hit['_source'].get('docnm', 'N/A'),
            "content_with_weight": hit['_source'].get('content_with_weight', 'N/A'),

        }
        results.append(result)

    return results



# 示例调用
# session_id = "162264171a2b4d7f"
# question = '世运电路2023业绩增长原因分析'
# retrieved_content = retrieve_content(session_id, question)
# print(retrieved_content)


if __name__ == "__main__":
    session_id = "162264171a2b4d7f"
    question = '世运电路2023业绩增长原因分析'
    retrieved_content = retrieve_content(session_id, question)
    print(retrieved_content)