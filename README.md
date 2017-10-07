load images into /opt/app-root/src/data/upload
oc rsync ~/amijardinimagescopy/restore <pod>:/opt/app-root/src/data

load cert into /opt/app-root/src/data
oc rsync ~/certToOpenshift <pod>:/opt/app-root/src/data

ensure env variables NODE_ENV, OPENSHIFT_DATA_DIR (/opt/app-root/src/data)

execute: ln -sf /opt/app-root/src/data/upload /opt/app-root/src/public/images/upload
TODO
log size
4096 db size
set APPLICATION_DOMAIN
