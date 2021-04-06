window.addEventListener("DOMContentLoaded", async (e) => {
    const quotes = [
        ["Energy and persistence conquer all things.", "Benjamin Franklin"],
        ["The reason I exercise is for the quality of life I enjoy.", "Kenneth H. Cooper"],
        ["Today I will do what others won’t, so tomorrow I can accomplish what others can’t.", "Jerry Rice"],
        ["One workout at a time. One day at a time. One meal at a time.", "Charlene Johnson"],
        ["If you don’t make time for exercise, you’ll probably have to make time for illness.", "Robin Sharma"],
        ["Exercise should be regarded as a tribute to the heart.", "Gene Tunney"],
        ["A year from now you may wish you had started today.", "Karen Lamb"],
        ["If you think lifting is dangerous, try being weak. Being weak is dangerous.", "Bret Contreras"],
        ["I have nothing in common with lazy people who blame others for their lack of success. Great things come from hard work and perseverance. No excuses.", "Kobe Bryant"],
        ["If you just push through the struggles and the hard times, it’ll be so worth it in the end, because you will be able to get to your dreams.", "Chloe Kim"],
    ]

    const random = Math.floor(Math.random() * quotes.length)

    const quoteEle = document.querySelector('.quote__display')
    const speakerEle = document.querySelector('.speaker__display')

    const quoteToDisplay = quotes[random]

    quoteEle.innerHTML = quoteToDisplay[0]
    speakerEle.innerHTML = quoteToDisplay[1]

})
