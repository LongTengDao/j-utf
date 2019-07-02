'use strict';

require('@ltd/j-dev')(__dirname+'/..')(async ({ build, 龙腾道, get }) => {
	
	const zhs = 'UTF 相关共享实用程序。从属于“简计划”。';
	const en = 'UTF util. Belong to "Plan J".';
	
	await build({
		NPM: { description: `${en}／${zhs}` },
		ESM: true,
		ES: 3,
		semver: await get('src/version'),
		name: 'j-utf',
		user: 'LongTengDao@ltd',
		Desc: [ zhs, en ],
		Auth: 龙腾道,
		Copy: 'LGPL-3.0',
		LICENSE_: true,
	});
	
});
