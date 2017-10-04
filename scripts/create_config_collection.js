use amijardin;
db.createCollection('configs');
db.configs.insert({
    'env': 'development',
    'pkpath' : '/home/fredy/.ssh/id_rsa_genevecultive.pem',
    'pubkpath' : '/home/fredy/.ssh/id_rsa_genevecultive_pub.pem',
    'expiresIn': 7200,
    'mailerpwd': 'fredazom3',
    'marpwd': 'tandi',
    'frepwd': 'califra',
    'letpwd': 'ninette',
    'dompwd': 'leo'
});
db.configs.insert({
    'env': 'production',
    'pkpath' : 'id_rsa_genevecultive.pem',
    'pubkpath' : 'id_rsa_genevecultive_pub.pem',
    'expiresIn': 7200,
    'mailerpwd': 'fredazom3',
    'marpwd': 'tandi',
    'frepwd': 'califra',
    'letpwd': 'ninette',
    'dompwd': 'leo'
});
db.configs.insert({
    'env': 'test',
    'database': 'db_playground',
    'pkpath' : '/home/fredy/.ssh/id_rsa_genevecultive.pem',
    'pubkpath' : '/home/fredy/.ssh/id_rsa_genevecultive_pub.pem',
    'expiresIn': 1,
    'mailerpwd': 'fredazom3',
    'marpwd': 'tandi',
    'frepwd': 'califra',
    'letpwd': 'ninette',
    'dompwd': 'leo'
});