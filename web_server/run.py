from app import create_app
# app = create_app("production")

app = create_app('development')   # or read from ENV

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
