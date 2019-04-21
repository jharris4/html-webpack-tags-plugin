const fakeA = require('fake-a-package').fakeA;
const fakeB = require('fake-b-package').fakeB;
const fakeC = require('fake-c-package').fakeC;

const fakes = [fakeA, fakeB, fakeC];

const fakeResults = fakes.map(fake => fake());

const fakeResultsHTML = fakeResults.map(fakeResult => '<div class="fake">' + fakeResult + '</div>').join('');

document.getElementById('root').innerHTML = fakeResultsHTML;
