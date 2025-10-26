from robyn import Robyn, ALLOW_CORS
from robyn.robyn import Response
from subRouters.v1.user import userRouterV1

app = Robyn(__file__)
app.include_router(userRouterV1)
# 生产环境需要注释：使用nginx解决跨域
ALLOW_CORS(app, origins=["http://localhost:8888"])


@app.exception
def handle_exception(error):
    return Response(status_code=500, description=f"error msg: {error}", headers={})


@app.get("/")
async def index():
    return "OK"


if __name__ == "__main__":
    app.start(host="0.0.0.0", port=1024)
