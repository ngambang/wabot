const puppeteer = require('puppeteer');
var path        = require("path");
var axios       = require("axios");
var qrcode      = require('qrcode-terminal');

var msg = "";
var msgTerakhir = "";
//config 

var notif    = ".OUeyt";
var pesanMsk = ".message-in";
var nama     = "#main > header > div._5SiUq > div > div > span";
var inPsn    = "#main > footer > div._3pkkz.V42si.copyable-area > div._1Plpp > div > div._2S1VP.copyable-text.selectable-text";//input pesan
var getRef   = "._11ozL";
var side     = "#pane-side";
var url_api  = "http://localhost:8000/api-chat";

(async () => {
	const args = []
	args.push('--app=https://web.whatsapp.com');
	args.push("--disable-gpu");
	args.push("--renderer");
	args.push("--no-sandbox");
	args.push("--no-service-autorun");
	args.push("--no-experiments");
	args.push("--no-default-browser-check");
	args.push("--disable-webgl");
	args.push("--disable-threaded-animation");
	args.push("--disable-threaded-scrolling");
	args.push("--disable-in-process-stack-traces");
	args.push("--disable-histogram-customizer");
	args.push("--disable-gl-extensions");
	args.push("--disable-extensions");
	args.push("--disable-composited-antialiasing");
	args.push("--disable-canvas-aa");
	args.push("--disable-3d-apis");
	args.push("--disable-accelerated-2d-canvas");
	args.push("--disable-accelerated-jpeg-decoding");
	args.push("--disable-accelerated-mjpeg-decode");
	args.push("--disable-app-list-dismiss-on-blur");
	args.push("--disable-accelerated-video-decode");
	args.push("--num-raster-threads=1");
	args.push("--disable-dev-shm-usage");
	args.push(`--user-data-dir=${path.resolve(__dirname, 'wa')}`);
	
	const browser = await puppeteer.launch({
		executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
		headless   : true,
		timeout    : 0,
		args
	});
	const [page] = await browser.pages();
	await page.setViewport({width:0,height:0})
	await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3641.0 Safari/537.36');

	await page.goto('https://web.whatsapp.com/',{waitUntil: 'networkidle2'});
	console.log("Whatsapp bot Siap.....");
	await page.waitForSelector("#app");
	// await page.screenshot({path: 'digg.png', fullPage: true});
	

	Showqrcode(page);

})();

async function cariNOtif(page){

	try {

		await page.waitForSelector(notif,{timeout:1000}); //cek apakah ada notif
		await page.click(notif); 
		//pesan masuk 
		await page.evaluate(({pesanMsk,nama}) => {
		
			var pesan = document.querySelectorAll(pesanMsk); //ambil semua pesan
			var txt   = pesan[pesan.length-1].querySelector("span > span").innerText // ambil pesan terakhir
			var name  = document.querySelector(nama).innerText; //ambil nama pengirim

			return {'txt':txt,'name':name} 

		},{pesanMsk,nama})
		.then(async (respon)=>{
			msg         = await botChat(respon['txt']); //proses jawab pesan
			msgTerakhir = respon['name']+respon['txt']; // catat pesan terakhir
		})

		await page.evaluate(({inPsn,msg}) => {
		
				document.querySelector(inPsn).innerText = " "+msg //tulis pesan

		},{inPsn,msg})
		
		if(respon['txt'] !== msgTerakhir){ //jika pesan terkhir berbeda 
			await page.waitFor(1000)
			await page.keyboard.press('Delete'); //penghapusan spasi
			await page.keyboard.press('Enter'); //kirim
			await page.waitFor(1000);
		}
		cariNOtif(page) // cari notif lagi


	} catch (error) {

		try {

			//jika tdak ada pesan masuk
			await page.evaluate(({pesanMsk,nama}) => {
		
				var pesan = document.querySelectorAll(pesanMsk);// ambil semua pesan masuk
				var txt   = pesan[pesan.length-1].querySelector("span > span").innerText //ambil pesan terakhir 
				var name  = document.querySelector(nama).innerText; // ambil nama pengirim
	
				return {'txt':txt,'name':name}
			},{pesanMsk,nama})
			.then(async (respon)=>{

				if(respon['txt'] !== msgTerakhir){ //jika pesan terkhir berbeda 

						msgTerakhir = respon['txt']; // pesan masuk 
						msg = await botChat(respon['txt']); //proses jawab pesan 
					 
						await page.evaluate(({inPsn,msg}) => {
		
							document.querySelector(inPsn).innerText = " "+msg //input jawaban 
			
						},{inPsn,msg})              
						
						await page.waitFor(1000)
						await page.keyboard.press('Delete'); //hapus spasi
						await page.keyboard.press('Enter')    // kirim
						await page.waitFor(1000);  
			
				}
			})

			cariNOtif(page)
			
		} catch (error) {
		
				cariNOtif(page)

		}
	 
	

	}  


}

async function Showqrcode(page){
	
	//tampilkan barcode 
	try {

		//cek sudah login apa belum 
		await page.waitForSelector(getRef,{timeout:2000});
		
		await page.evaluate((getRef) => {
			
				return document.querySelector(getRef).getAttribute("data-ref");

		},getRef)

		.then(e=>{

			qrcode.generate(e,{small: true});

			setTimeout(()=>{

				Showqrcode(page);

			},3000)
		})

	} catch (error) {
			 
			//jika kontak chat sudah muncul maka login sukses 
			try {
				
				await page.waitForSelector(side,{timeout:2000});
				cariNOtif(page)
				console.log("berhasil login");
			} catch (error) {
				console.log("Mengulangi pengambilan qrcode");				
				Showqrcode(page)


			}


		

	}


}


function botChat(txt){

	return  axios.post(url_api, {'text':txt})
	.then(result=>{
	
		return result['data'];
	
	}).catch (e=>{

		return e

	})

}
