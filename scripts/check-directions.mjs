const API = 'http://localhost:1337/api';
const TOKEN = 'd21f96e2119d529adaf00695b29b806f4a8658c6d128f8d211bbf7acb0ecd66ed15f80eeb154510db1f1844305fa12bfc9190b8b8d53cf86375de4cd5d3d90294a29e0806237fd3ecb70c6ca3540d2c5a6ed67451d72c8ecc0c01a05774696f31d83aa6a2fab575d249e4580e6e5756f2375bd60a0ad96bf697aff310455a78f';

const res = await fetch(`${API}/directors?pagination[limit]=100&fields[0]=key&fields[1]=direction&fields[2]=titre`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
const { data } = await res.json();
console.log('=== Toutes les directions avec parent ===');
data.filter(d => d.direction).forEach(d => console.log(`key=${d.key} | direction="${d.direction}" | ${d.titre?.substring(0,40)}`));
console.log('\n=== DGRIT sous-directions (direction=DGRIT) ===');
data.filter(d => d.direction === 'DGRIT').forEach(d => console.log(`  key=${d.key} | ${d.titre}`));
