let qrOpeners = document.querySelectorAll(".doc-link");

let qrOutsideContainer = document.querySelector(".qr-outside-container");
let qrCloseButton = document.querySelector(".qr-close-button");

let qrDocName = document.querySelector(".qr-doc-name");
let qrImage = document.querySelector(".qr-image");

qrCloseButton.addEventListener("click", () => {
    qrOutsideContainer.style.display = "none";
});

qrOpeners.forEach(qrOpener =>{
    qrOpener.addEventListener("click",(mouse) => {
        qrOutsideContainer.style.display = "flex";

        // get doc name
      if(mouse.target.closest("a")) {
        const docname = mouse.target.closest("a").querySelector(".doc-name").textContent;

            // change doc name
           qrDocName.textContent = docname;
            // change sub name
            
            // change src qr 
            let sanitizedDocName = docname.replace("/", "or");
            qrImage.src = `/assets/qr codes/${sanitizedDocName}.png`;
        
       }

    });
});





























































// let qrOpeners = document.querySelectorAll("doc-link");
// let qrOutsideContainer = document.querySelector (".qr-outside-container");
// let button = document.querySelector (".button");

// button.addEventListener ("click", () => {
//     qrOutsideContainer.style.display = "none";
// });

// qrOpeners.forEach(qrOpener => {
//     qrOpener.addEventListener ("click", () => {
//         qrOutsideContainer.style.display ="none";
//     });
// });

