FROM node:20

RUN mkdir -p /app
COPY ./common /common
WORKDIR /app

CMD npm install && sed -i 's#"import": "./lib/layer-vue.es.js"#"import": { "types": "./types/index.d.ts", "style": "./lib/index.css", "default": "./lib/layer-vue.es.js" }#gi' ./node_modules/@layui/layer-vue/package.json && npm run build
