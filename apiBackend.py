import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from binance.client import Client
from binance.exceptions import BinanceAPIException
from pydantic import BaseModel
from data import Database
import uvicorn
import time
from contextlib import asynccontextmanager
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client

class ApiCredentials(BaseModel):
    api_key: str
    secret_key: str
    testnet: bool
    
supabase_url='https://ufibcdltlwjnvaekacyu.supabase.co'
supabase_key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmaWJjZGx0bHdqbnZhZWthY3l1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg1MzU4OSwiZXhwIjoyMDY5NDI5NTg5fQ.8ltqHhK0TXAAQntXBzuIEItjlJUrVBDEFUP6vu6IR_E'

db = create_client(supabase_url, supabase_key)

app = FastAPI()

# 配置CORS跨域中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头部
)

@app.get("/positionRisk/{u_id}")
def positionRisk(u_id: str, symbol: str=None):


    query = db.table("trading_strategies").select('*, api_configs(*)').eq('user_id', u_id)
    response = query.execute()
    # if not response.data:
    #     return []
    # k=[]
    resp = []
    for i in response.data:
        api_configs = i['api_configs']
        # print(api_configs, api_configs == None)
        # continue
        if api_configs == None:
            continue
        binance_client = Client(api_configs['api_key'], api_configs['secret_key'], tld='com', testnet=api_configs['testnet'])
        resp.extend(binance_client.futures_position_information())
        # for j in positionRisk:
        #     j['api_config_id']=api_configs['id']
        #     k.append(j)

    return resp



@app.get("/balance/{u_id}")
def accountInfo(u_id: str):
    query = db.table("trading_strategies").select('*, api_configs(*)').eq('user_id', u_id)
    response = query.execute()
    if not response.data:
        return []
    k=[]
    for i in range(len(response.data)):
        api_configs = response.data[i]['api_configs']
        if api_configs is None:
            return []
        binance_client = Client(api_configs['api_key'], api_configs['secret_key'], tld='com', testnet=api_configs['testnet'])
        balance = binance_client.futures_account_balance()#[]
        for j in balance:
            j['api_config_id']=api_configs['id']
            k.append(j)
    return k


@app.post("/validate")
def validate(credentials: ApiCredentials):
    tem_client =Client(
        credentials.api_key,
        credentials.secret_key,
        tld='com',
        testnet=credentials.testnet
    )
    tem_client.futures_account_balance()
    return {"success": True, "message": "API 驗證成功！"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)




    
