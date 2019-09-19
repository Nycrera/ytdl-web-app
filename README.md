# ytdl-web-app
Node.js express app for downloading media from youtube.

Still needs a lot of configurations and extra functionality. It's nowhere suits for production use.
It's ok though. I am just testing stuff and it's fun.

Pull the repository and install dependencies with npm.
`$ npm install marked`

`$ npm install`

then you can run the app. (This is meant for the nginx reverse proxy usage for now. But let's make these things configurable.)
`$ node index`

or alternatively you can use pm2 right ?
Install the pm2 then
`$ npm install pm2 -g`
you can create a app that will reset if anythink bad happens. 
`$ pm2 start index --name yt-dl-app`
