fetch('/navbar.html')
                .then(response => response.text())
                .then(data => {
                    document.getElementById('navbar-container').innerHTML = data;
                    document.querySelector('.main-header').offsetHeight;
                });