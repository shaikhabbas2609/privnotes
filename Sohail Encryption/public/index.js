const form = document.querySelector('form');
const outputDiv = document.querySelector('.output');


function copyClip(){
    console.log('hey')
    if(document.querySelector('#link')){
        const link = document.querySelector('#link').textContent;
        navigator.clipboard.writeText(link).then(() => {
            alert('Copied Successfully')
        }).catch(err => {
            console.error(err)
        })
    }
}

function handleUI(data){
    const { id } = data;
    const url = new URL(`https://privnote-clone.web.app/`);
    url.searchParams.set('key',id);
    let html = `<a id="link" href=${url}>${url}</a>
                <div>
                    <button onClick="copyClip()" 
                        class="btn btn-outline-primary w-60 fs-6 text-uppercase mt-2"
                    >
                        Copy to clipboard
                    </button>
                </div>
                <div class="fw-light mt-2">
                    Send this Link to your Partner Link Expires after 24 hours
                </div>`

    outputDiv.innerHTML = html

}

const generatingAndSavingLinks = async (encrypt) => {
    const date = new Date();
    const unix = Math.round(+date/1000 + 60 * 60 * 24);
    const data = await db.collection('notes').add({
        key:encrypt,
        timestamp:unix
    })
    handleUI(data);
}



const handleSubmit = (e) => {
    e.preventDefault();

    const message = form.message.value.trim();
    const secret = form.secret.value.trim();
    const cipher = form.cipher.value;


    let encryption;

    switch(cipher){
        case 'AES':
            encryption = CryptoJS.AES.encrypt(message,secret).toString();
            break;
        case 'DES':
            encryption = CryptoJS.DES.encrypt(message,secret).toString();
            break;
        case 'TripleDES':
            encryption = CryptoJS.TripleDES.encrypt(message,secret).toString();
            break;
        case 'Rabbit':
            encryption = CryptoJS.Rabbit.encrypt(message,secret).toString();
            break;
        case 'RC4':
            encryption = CryptoJS.RC4.encrypt(message,secret).toString();
            break;
        default:
            return '';
    }

    generatingAndSavingLinks(encryption);

    form.reset();
    
}

form.addEventListener('submit',handleSubmit)


const url = new URL(window.location.href);
// console.log(url.searchParams.get("key"))
if(url.searchParams.get("key")){
    const key = url.searchParams.get('key')
    localStorage.setItem('key',key);
    location.href = 'decrypt.html'
}



// Because Firebase functions are now Paid
    db.collection('notes').get().then(snapshot => {
        const {docs} = snapshot;
        const timestampArr = []
        docs.forEach(doc => {
            const {timestamp} = doc.data();
            timestampArr.push({id:doc.id,timestamp})
        })
    
        const date = new Date();
        const unix = Math.round(+date/1000);
        let filteredArr = timestampArr.filter(arr => unix > arr.timestamp);
        if(filteredArr){
            filteredArr.forEach( doc => {
                db.collection('notes').doc(doc.id).delete().then(() => {
                    console.log('deleted')
                })
            })
        }
    })
   

