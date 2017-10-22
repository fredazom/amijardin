restore db as explained in
https://docs.openshift.com/online/dev_guide/migrating_applications/database_applications.html#dev-guide-migrating-database-applications-mongodb

copy by hand /home/fredy/projects/amijardindata/env into mongodb

load images into /opt/app-root/src/data/upload
oc rsync ~/amijardinimagescopy/restore <pod>:/opt/app-root/src/data

load cert into /opt/app-root/src/data/.ssh/
oc rsync ~/certToOpenshift <pod>:/opt/app-root/src/data
put content into .ssh/

ensure env variables NODE_ENV, OPENSHIFT_DATA_DIR (/opt/app-root/src/data)

execute: ln -sf /opt/app-root/src/data/upload /opt/app-root/src/public/images/upload

set DNS

**********
BEFORE DEPLOYING A NEW VERSION:
get images, previous tar -cxvf of images, then create directory images, put tar.gz there and execute:

oc rsync nodejs-mongo-persistent-12-g8mwg:/opt/app-root/src/data/images ~/amijardinimagescopy/

TODO
log size
4096 db size
set APPLICATION_DOMAIN
