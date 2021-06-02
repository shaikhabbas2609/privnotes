const container = document.querySelector('.container');
const key = localStorage.getItem('key');
const form = document.querySelector('form')
let refNotes = db.collection('notes').doc(key);
let errorHTML = `
<p class="text-center" fw-light>
    Either Secret message or selection of Cipher is not correct
</p>
`

// On Windows Load
refNotes.get().then(doc => {
    if(!doc.exists){
        container.innerHTML 
            = `<h3 class="text-center">Link Does not Exist</h3>`
    }    
}).catch(err => {
    console.error(err)
})

// Destroying the Link
const deleteDoc = async () => {
    refNotes.delete();
}


// Decrypting and checking the value;
function decrypt(secret,cipher){
    let encryption;
    let decryption;
    const url = new URL(window.location.href)
    refNotes.get().then(doc => {
       const { key } = doc.data();
       encryption = key;
    }).then(() => {
        switch(cipher){
            case 'AES':
                decryption = CryptoJS.AES.decrypt(encryption,secret)
                break;
            case 'DES':
                decryption = CryptoJS.DES.decrypt(encryption,secret)
                break;
            case 'TripleDES':
                decryption = CryptoJS.TripleDES.decrypt(encryption,secret)
                break;
            case 'Rabbit':
                decryption = CryptoJS.Rabbit.decrypt(encryption,secret)
                break;
            case 'RC4':
                decryption = CryptoJS.RC4.decrypt(encryption,secret)
                break;
            default:
                return '';
        }
        let result = decryption.toString(CryptoJS.enc.Utf8);
        if(result){
            container.innerHTML = 
            `<h6 class="text-center fw-bold">${result}</h6>
            <p class="text-center" fw-light>
                If you refresh the page the link and message will be destroyed
            </p>
            `

            deleteDoc(key)

        }else{
            container.innerHTML +=errorHTML
            url.searchParams.set('','');
        }
        
    }).catch(()=> {
        container.innerHTML +=errorHTML;
        url.searchParams.set('','');
    })
}


// Catching the Field Value
function handleSubmit(e){
    e.preventDefault();

    const secret = form.secret.value.trim();
    const cipher = form.cipher.value;

    decrypt(secret,cipher)
}

// When User Submits
form.addEventListener('submit',handleSubmit);