# ytdl-web-app
Node.js express app for downloading media from youtube.

Still needs a lot of configurations and extra functionality. It's nowhere suits for production use.
It's ok though. I am just testing stuff and it's fun.

Pull the repository and install dependencies with npm.
`$ git clone https://github.com/Nycrera/ytdl-web-app.git`
`$ cd ytdl-web-app`
`$ npm install`

then you can run the app. (This is meant for the nginx reverse proxy usage for now. But let's make these things configurable.)
`$ node index`

or alternatively you can use pm2 right ?
Install the pm2 then

`$ npm install pm2 -g`

you can create a app that will reset if anything bad happens. 

`$ pm2 start index --name yt-dl-app`

at this point app is available at the port 4000 (as default) or the according variable (const NET_PORT).

## API
All POST api calls are Content-Type: application/x-www-form-urlencoded
### /availability

  Checks if the endpoint is available. I probably will delete this soon because it is stupid. There is litterally no use.

* **Method:**
  
  `GET`
  
* **Response:**
  
  There is no error code for this type of request.

  * **Code:** 200 <br />
    **Content:** `1` or `0`
 

* **Sample Call:**
  ```javascript
    $.ajax({
      url: "/avilability",
      dataType: "text",
      type : "GET",
      success : function(r) {
       	if(r == "1") endPointAvailabe();
		else howCouldThisHappenToMe();
      }
    });
  ```
### /info

  Returns information of given media URL.

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `URL=[url of the media]`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
		 {	name: string;
  	  id: string;
    	length: number;
    	author: string;
  	  formats: ytdl.videoFormat[];	}
 
* **Error Response:**

  * **Code:**  418 (All error codes are 418. Can be changed at the Error Handler easily) 
  But you would destroy the fun.<br />
    **Content:** ` {status: number , errorString: string }`
	For this call there is 2 status codes that represents an error.
	* status code 1
	 "Invalid URL" Means given URL is unaccaptable by the yt-dl
	* status code 4
	"Server Error" Means there has been some server-side problems while getting the information from yt-dl.

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/info",
      dataType: "json",
      type : "GET",
	  data: {URL: "https://youtu.be/QH2-TGUlwu4"},
      success : function(r) {
        console.log(r);
      }
    });
  ```
  
  ### /download
  Generates a download token for passing it to "/apiv1".
 User picks the requested fomat with this request.

* **Method:**

  `POST`
  
* **Data Params**

   **Required:** 
   *Format:* application/x-www-form-urlencoded
   
   `URL=[url of the media]`
   `name=[title of the video in URL]`
   `type=[JSON type data]`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ status: 0  , requestData: string }`
 
* **Error Response:**
  * **Code:**  418 (All error codes are 418. Can be changed at the Error Handler easily) 
  But you would destroy the fun.<br />
    **Content:** ` {status: number , errorString: string }`
	For this call there is 2 status codes that represents an error.
	* status code 1
	 "Invalid URL" Means given URL is unaccaptable by the yt-dl

* **Sample Call:**

//TODO

