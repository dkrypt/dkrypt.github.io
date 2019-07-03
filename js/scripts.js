/*!
    Author: Deepak Kumar
    Repo: https://github.com/dkrypt
    
    This file contains all the custom JavaScripts associated with this portfolio.

*/

const { el, mount } = redom;
const html_element = document.querySelector('html');
html_element.classList.remove('no-js');
// VANTA.NET({
//     el: document.querySelector('#lead-overlay')
// });
const headerElement = document.getElementById('myHeader').querySelectorAll('a');
headerElement.forEach((element) => {
    element.addEventListener('click', (e) => {
        console.log('deepak Singh');
        if (element.className == 'no-scroll') return;
        e.preventDefault();
        let heading = element.getAttribute('href');
        let scrollDistance = document.querySelector(heading).offsetTop;
        console.log(scrollDistance);
        console.log(heading);
        document.documentElement.scroll({
            top: scrollDistance,
            behavior: 'smooth'
        });
        if (element.className == 'active') {
            element.classList.remove('active');
        }
    });
});

document.getElementById('to-top').addEventListener('click', () => {
    document.documentElement.scroll({
        top: 0,
        behavior: 'smooth'
    });
});

// Scroll to first element
document.getElementById('lead-down').firstElementChild.addEventListener('click', () => {
    let scrollDistance = document.getElementById('lead').nextElementSibling.offsetTop;
    document.documentElement.scroll({
        top: scrollDistance,
        behavior: 'smooth'
    })
});

/**
 * This method wraps an element with a given wrapper. It helps maintaining the heirarchy. 
 *  
 * @param {HTMLElement} wrapper - wrapper to use
 * @param {HTMLElement} elms - element to be wrapped
 */
function wrap(wrapper, elms) {
    if (!elms.length) {
        elms = [elms];
    }

    for (var i = elms.length - 1; i >= 0; i--) {
        var child = (i > 0) ? wrapper.cloneNode(true) : wrapper;
        var el = elms[i];

        var parent = el.parentNode;
        var sibling = el.nextSibling;

        child.appendChild(el);

        if (sibling) {
            parent.insertBefore(child, sibling);
        } else {
            parent.appendChild(child);
        }
    }
};

// Create Timeline
document.querySelectorAll('#experience-timeline div').forEach(function(element) {
    // let userContent = element;
    element.className = 'vtimeline-content';
    // const outer_wrap = document.createElement('div', className = 'vtimeline-point'); // el('.vtimeline-point');
    // const inner_wrap = document.createElement('div', className = 'vtimeline-block'); //el('.vtimeline-block');
    // console.log(element);
    wrap(el('.vtimeline-block'), element);
    element = element.parentElement;
    wrap(el('.vtimeline-point'), element);
    element.before(el('.vtimeline-icon', el('i', { className: 'fa fa-map-marker' })));

    element = element.firstElementChild;
    const date = element.getAttribute('data-date');
    if (date) {
        element.before(el('span', { className: 'vtimeline-date' }, date));
    }
});

// Open mobile menu
document.querySelector('#mobile-menu-open').addEventListener('click', () => {
    document.querySelector('body').className = 'active';
    document.querySelector('header').className = 'active';
});

// Close mobile menu
document.querySelector('#mobile-menu-close').addEventListener('click', () => {
    document.querySelector('body').classList.remove('active');
    document.querySelector('header').classList.remove('active');
});

var gf = Gradientify();

gf.create(document.getElementById('lead-overlay'), [ // Target element
    "linear-gradient(90deg, rgb(115, 211, 121), rgb(70, 13, 122))",
    "linear-gradient(45deg, rgb(113, 35, 28), rgb(32, 121, 107))",
    "linear-gradient(12deg, rgb(10, 12, 23), rgb(55, 31, 35))",
    "linear-gradient(76deg, rgb(13, 15, 18), rgb(32, 71, 57))",
    "linear-gradient(130deg, rgb(35, 23, 43), rgb(51, 89, 35), rgb(15, 89, 76))"
], 2500); // Interval