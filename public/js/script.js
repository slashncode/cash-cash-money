//burger menu slide in/out
document.querySelector('.burgericon').addEventListener('click', function () {
    document
        .querySelector('.burgermenu')
        .classList.toggle('burgermenu--active');
});

function setDecimal(input) {
    input.value = parseFloat(input.value).toFixed(2);
}

function success() {
    console.log('yeah?');
}

function error(err) {
    console.log('nay :c');
}

document
    .querySelector('.entrybar-button--positive')
    .addEventListener('click', function () {
        let entry_name = document.querySelector('#entry_name').value;
        let entry_value = document.querySelector('#entry_value').value;
        let body = {
            entry_name: entry_name,
            entry_value: entry_value,
        };

        let xhr = new XMLHttpRequest();
        xhr.onload = success;
        xhr.onerror = error;
        xhr.open('POST', 'http://localhost:3000/hinzufuegen', true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(body));
        location.reload();
    });

document
    .querySelector('.entrybar-button--negative')
    .addEventListener('click', function () {
        let entry_name = document.querySelector('#entry_name').value;
        let entry_value = document.querySelector('#entry_value').value;
        let changeSign = true;
        let body = {
            entry_name: entry_name,
            entry_value: entry_value,
            changeSign: changeSign,
        };

        let xhr = new XMLHttpRequest();
        xhr.onload = success;
        xhr.onerror = error;
        xhr.open('POST', 'http://localhost:3000/hinzufuegen', true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(body));
        location.reload();
    });

document.querySelector('.calendar').addEventListener('click', function () {
    let date1 = document.querySelector('.date1').value;
    let date2 = document.querySelector('.date2').value;

    var searchParams = new URLSearchParams(window.location.search);
    if (date1 != '') {
        searchParams.set('startDate', date1);
    }
    if (date2 != '') {
        searchParams.set('endDate', date2);
    }
    window.location.search = searchParams.toString();
});
