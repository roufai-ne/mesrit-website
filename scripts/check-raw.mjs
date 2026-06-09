const API = 'http://localhost:1337/api';
const TOKEN = 'd21f96e2119d529adaf00695b29b806f4a8658c6d128f8d211bbf7acb0ecd66ed15f80eeb154510db1f1844305fa12bfc9190b8b8d53cf86375de4cd5d3d90294a29e0806237fd3ecb70c6ca3540d2c5a6ed67451d72c8ecc0c01a05774696f31d83aa6a2fab575d249e4580e6e5756f2375bd60a0ad96bf697aff310455a78f';

const res = await fetch(`${API}/directors?populate=*&pagination[limit]=100`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
const { data } = await res.json();
console.log('Nombre total:', data.length);
// Afficher structure d'un item pour voir le format
console.log('\nStructure du premier item:');
console.log(JSON.stringify(data[0], null, 2));
console.log('\nItems avec key DR ou DIT:');
const drdit = data.filter(d => d.key === 'DR' || d.key === 'DIT' || (d.attributes && (d.attributes.key === 'DR' || d.attributes.key === 'DIT')));
console.log(JSON.stringify(drdit, null, 2));
