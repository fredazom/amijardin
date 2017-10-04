db.nouvelles.find({ 'f' : {$ne: null}}).forEach(
	function(n) {
		var re = /^\d{2}\/\d{2}\/\d{4}$/;
		if (re.test(n.f)) {
			var date = n.f.split("/");
			var d = date[2] + "/" + date[1] + "/" + date[0];
			n.f = new Date(d);

			if (re.test(n.to)) {
				var date = n.to.split("/");
				var d = date[2] + "/" + date[1] + "/" + date[0];
				n.to = new Date(d);
				db.nouvelles.save(n);
			}

			db.nouvelles.save(n);
		}

	}
);


