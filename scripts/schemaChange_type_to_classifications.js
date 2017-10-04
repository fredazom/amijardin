db.gardens.find({ 'properties.classifications' : {$exists: false}}).forEach(
	function(garden) {
		garden.properties.classifications = [garden.properties.type];
		delete garden.properties.type;
		db.gardens.save(garden);
	}
);


