export function getMushroomDataFromName(name = 'missingno') {
	let thisMushroomBankJson = mushroomBank.filter(function (data) {
		return data.title == name;
	})[0];
	if (thisMushroomBankJson == undefined)
		thisMushroomBankJson = mushroomBank.filter(function (data) {
			return data.title == 'missingno';
		})[0];
	return thisMushroomBankJson;
}

const mushroomBank = [
	{
		title: 'missingno',
		icon: 'images/mushrooms/missingno.png',
		scale: '100%'
	},
	{
		title: 'Shaggy Ink Cap',
		icon: 'images/mushrooms/shaggyInkCap.png',
		scale: 'contain'
	},
	{
		title: 'Fly Agaric',
		icon: 'images/mushrooms/flyAgaric.png',
		scale: '104%'
	},
	{
		title: 'Chanterelle',
		icon: 'images/mushrooms/chanterelle.png',
		scale: '104%'
	}
];

export function getMushroomBank() {
	// Sort alphabetically by name
	return [...mushroomBank].sort((a, b) => a.title.localeCompare(b.title));
}
