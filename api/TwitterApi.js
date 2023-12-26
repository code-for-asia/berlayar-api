require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const Oauth1Helper = require('../utils/OauthHelper');


  
  function decrypt(encryptedText, encryptionKey) {
    const key = Buffer.from(encryptionKey, 'utf8');
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedBuffer = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedBuffer);
    decrypted += decipher.final('utf8');
    return decrypted;
  }

router.get('/check-api', (req, res) => {
    return res.status(200).json({success:true});
})

router.post('/get-access-token',(req,res) => {
    const code = req.body.code;
    const username = process.env.EMAIL
    const password = decrypt(process.env.EMAIL_PASSWORD,process.env.DECRYPT_KEY)
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    const headers = {
        headers:{
            'Authorization':'Basic '+credentials,
            'Content-Type':'application/x-www-form-urlencoded'
        }
    }

    const formData = new URLSearchParams();
    formData.append('code',code);
    formData.append('grant_type','authorization_code');
    formData.append('client_id',process.env.TWITTER_CLIENT_ID);
    formData.append('redirect_uri',process.env.REDIRECT_URL);
    formData.append('code_verifier','challenge');

    axios.post('https://api.twitter.com/2/oauth2/token', formData, headers)
    .then((result) => {
        return res.status(200).json({success:true, data:result.data});
    })
    .catch((error) => {
        return res.status(200).json({success:false, data:null});
    })
});

router.post('/get-fresh-token',(req,res) => {
    const code = req.body.code;
    const username = process.env.EMAIL
    const password = decrypt(process.env.EMAIL_PASSWORD,process.env.DECRYPT_KEY)
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    const headers = {
        headers:{
            'Authorization':'Basic '+credentials,
            'Content-Type':'application/x-www-form-urlencoded'
        }
    }

    const formData = new URLSearchParams();
    formData.append('refresh_token',code);
    formData.append('grant_type','refresh_token');
    formData.append('client_id',process.env.TWITTER_CLIENT_ID);

    axios.post('https://api.twitter.com/2/oauth2/token', formData, headers)
    .then((result) => {
        console.log(result);
        return res.status(200).json({success:true, data:result.data});
    })
    .catch((error) => {
        return res.status(200).json({success:false, data:null});
    })
})

router.post('/upload-media', (req, res) => {
    const mediaBase64 = req.body.media;
      const data ={
        media_category: "TWEET_IMAGE",
        media_data:mediaBase64
      }
      const formData = new FormData();
      formData.append('media_category',"TWEET_IMAGE");
      formData.append("media_data", mediaBase64);

      const request = {
        url:'https://upload.twitter.com/1.1/media/upload.json',
        method:'POST',
        body:{
            formData
        }
      }

      const authHeader = Oauth1Helper.getAuthHeaderForRequest(request);
      const headers = {
        headers:{
            authHeader,
            "Content-Type":"multipart/form-data"
        }
      }
      axios.post("https://upload.twitter.com/1.1/media/upload.json",formData,{headers:authHeader} )
      .then((result) => {
        return res.status(200).json({success:true, data:result.data})
      }).catch((error) => {
        return res.status(200).json({success:false, data:null})
      })

})

router.post('/post-tweet', (req, res) => {
    const text = req.body.text;
    const mediaId = req.body.mediaId;
    const token = req.body.token;

    const data = {
        text,
        media:{media_ids:[mediaId]}
    }

    const headers = {
        headers:{
            'Authorization':`Bearer ${token}`,
            'Content-Type':'application/json'
        }
    }

    axios.post("https://api.twitter.com/2/tweets",data, headers)
    .then((result) => {
        return res.status(200).json({success:true, data:result.data})
    }).catch((error) => {
        return res.status(200).json({success:false, data:error})
      })


})

router.post('/get-user', (req,res) => {
    const token = req.body.token;
    const headers = {
        headers:{
            'Authorization':`Bearer ${token}`,
            'Content-Type':'application/json'
        }
    }

    axios.get("https://api.twitter.com/2/users/me", headers)
    .then((result) => {
        return res.status(200).json({success:true, data:result.data})
    }).catch((error) => {
        return res.status(200).json({success:false, data:error})
      })
})

router.post("/url-image-to-base64", (req, res) => {
    const url = req.body.url;
    axios.get(url, {responseType:'arraybuffer'}).then((result) => {
        if(result.status === 200 && result.data){
            const imageData = Buffer.from(result.data, 'binary').toString('base64');
            return res.status(200).json({success:true, data:imageData})
        }
    })
    .catch((error)=>{
        return res.status(200).json({success:false, data:error})
    })
})

module.exports = router
