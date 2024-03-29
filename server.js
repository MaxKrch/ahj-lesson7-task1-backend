const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const app = new Koa();

//for upload files
const path = require('path');
const fs = require('fs');
const koaStatic = require('koa-static');
const uuid = require('uuid');

const public = path.join(__dirname, '/public');

//for all

app.use(koaBody({
  text: true,
  urlencoded: true,
  multipart: true,
  json: true,
}))

.use(koaStatic(public))
	
	.use(async (ctx, next) => {
		const origin = ctx.request.get('Origin');
		if(!origin) {
			return await next();
		}

		const header = {'Access-Control-Allow-Origin': '*'};

		if(ctx.request.method !== 'OPTIONS') {
			ctx.response.set({...header});
			try {
				return await next();
			} catch(e) {
				e.header = {...e.header, ...header};
				throw e;
			}  

		}

		if(ctx.request.get('Access-Control-Request-Method')) {
			ctx.response.set({
				...headers,
				'Access-Control-Request-Method': 'GET, POST, PUT, DELETE, PATCH',
			});

			if(ctx.request.get('Access-Control-Request-Headers')) {
				ctx.response.set('Access-Control-Request-Headers', ctx.request.get('Access-Control-Request-Headers'))
			}

			ctx.response.status = 204; //No content
		}
	})

	// // form subscribe 
	// const subsriptions = new Map();
	// app.use(async (ctx) => {
	// 	const [ {name}, {phone} ] = ctx.request.querystring
	// 		.split('&')
	// 		.map(item => {
	// 			const array = item.split('=');
	// 			const [key, value] = array;
		
	// 			const obj = {};
	// 			obj[key] = value;
				
	// 			return obj;
	// 		})

	// 	// const { name, phone } = ctx.request.body;


	// 	if (subsriptions.has(phone)) {
	// 		ctx.response.status = 400;
	// 		ctx.response.body = "You alreade subceibed!";
	// 		return;
	// 	}
		
	// 	subsriptions.set(phone, name);
	// 	ctx.response.body = 'Ok';
	// })
app.use(async (ctx, next) => {
  const { name } = ctx.request.body;
  const { file } = ctx.request.files;
 
  if(file.size <= 0) {
  	ctx.response.status = 400;
		ctx.response.body = "Empty file!";
		return await next();
  }

  const link = await new Promise((resolve, reject) => {
    const oldPath = file.filepath;
    const arrayWithType = file.originalFilename.split('.');
    const lengthArray = arrayWithType.length;
    const typeFile = arrayWithType[lengthArray - 1];

    const filename = uuid.v4() + `.${typeFile}`;
    const newPath = path.join(public, filename);

    const callback = (error) => reject(error);

    const readStream = fs.createReadStream(oldPath);
    const writeStream = fs.createWriteStream(newPath);

    readStream.on('error', callback);
    writeStream.on('error', callback);

    readStream.on('close', () => {
      fs.unlink(oldPath, callback);
      resolve(filename);
    });

    readStream.pipe(writeStream);
  });

  ctx.response.body = link;
})
	// .use(async (ctx) => {
	// 	// const file = ctx.request.files.file.filepath;
	// 	// const fileName = ctx.request.body.name;

	// 	console.log('public/1.png')
	// 	ctx.response = '1.png';
	
	// })

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port)