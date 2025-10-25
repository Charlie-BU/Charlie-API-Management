from robyn import Robyn, ALLOW_CORS

app = Robyn(__file__)
# 生产环境需要注释：使用nginx解决跨域
ALLOW_CORS(app, origins=["http://localhost:8888"])


@app.get("/")
async def index():
    return "OK"


if __name__ == "__main__":
    app.start(host="0.0.0.0", port=1024)
