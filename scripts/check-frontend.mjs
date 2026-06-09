// Simule exactement ce que fait direction/index.js avec mapDirector
const API = 'http://localhost:1337/api';
const TOKEN = 'd21f96e2119d529adaf00695b29b806f4a8658c6d128f8d211bbf7acb0ecd66ed15f80eeb154510db1f1844305fa12bfc9190b8b8d53cf86375de4cd5d3d90294a29e0806237fd3ecb70c6ca3540d2c5a6ed67451d72c8ecc0c01a05774696f31d83aa6a2fab575d249e4580e6e5756f2375bd60a0ad96bf697aff310455a78f';

const res = await fetch(`${API}/directors?pagination[limit]=100&populate[0]=photo`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
const response = await res.json();

// Reproduire mapDirector
const mapDirector = (director) => {
  if (!director) return null;
  const attrs = director.attributes || director;
  let key = attrs.key || null;
  if (!key) {
    const lowerTitre = (attrs.titre || '').toLowerCase();
    if (lowerTitre.includes('ministre')) key = 'MINISTRE';
    else if (lowerTitre.includes('secrétaire général') && !lowerTitre.includes('adjoint')) key = 'SG';
    else if (lowerTitre.includes('secrétaire général adjoint')) key = 'SGA';
    else if (lowerTitre.includes('inspecteur général')) key = 'IGS';
    else if (lowerTitre.includes('enseignement')) key = 'DGES';
    else if (lowerTitre.includes('recherche')) key = 'DGRIT';
  }
  return { _id: director.id, id: director.id, nom: attrs.nom, titre: attrs.titre, direction: attrs.direction, key };
};

const data = response.data.map(mapDirector);

const dgs = data.filter(d => ['DGES', 'DGRIT'].includes(d.key));
const sousDirections = data.reduce((acc, curr) => {
  if (curr.direction) {
    if (!acc[curr.direction]) acc[curr.direction] = [];
    acc[curr.direction].push(curr);
  }
  return acc;
}, {});

console.log('DGs trouvés:', dgs.map(d => `${d.key} (${d.titre?.substring(0,30)})`));
console.log('\nsousDirections keys:', Object.keys(sousDirections));
console.log('\nsousDirections[DGRIT]:', sousDirections['DGRIT']?.map(d => d.key));
console.log('sousDirections[DGES]:', sousDirections['DGES']?.map(d => d.key));
console.log('sousDirections[SG]:', sousDirections['SG']?.map(d => d.key));
